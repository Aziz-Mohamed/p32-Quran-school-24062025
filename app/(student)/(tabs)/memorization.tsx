import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, SectionList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { RevisionCard, MemorizationProgressBar } from '@/features/memorization';
import { useRevisionSchedule } from '@/features/memorization/hooks/useRevisionSchedule';
import { useMemorizationStats } from '@/features/memorization/hooks/useMemorizationStats';
import type { RevisionScheduleItem } from '@/features/memorization';
import { useAuth } from '@/hooks/useAuth';
import { useRoleTheme } from '@/hooks/useRoleTheme';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

// ─── Section Config ──────────────────────────────────────────────────────────

const SECTION_CONFIG = {
  new_hifz: {
    titleAr: 'الحفظ الجديد',
    titleEn: 'New Memorization',
    icon: 'add-circle' as const,
    color: colors.accent.indigo[500],
  },
  recent_review: {
    titleAr: 'المراجعة القريبة',
    titleEn: 'Recent Review',
    icon: 'refresh-circle' as const,
    color: colors.secondary[500],
  },
  old_review: {
    titleAr: 'المراجعة البعيدة',
    titleEn: 'Older Review',
    icon: 'time' as const,
    color: colors.primary[500],
  },
};

// ─── Memorization Screen ─────────────────────────────────────────────────────

export default function MemorizationScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const theme = useRoleTheme();

  const todayStr = new Date().toISOString().split('T')[0];
  const { data: schedule = [], isLoading, error, refetch } = useRevisionSchedule(profile?.id, todayStr);
  const { data: stats } = useMemorizationStats(profile?.id);

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Group schedule items by review_type
  const sections = useMemo(() => {
    const groups: Record<string, RevisionScheduleItem[]> = {
      new_hifz: [],
      recent_review: [],
      old_review: [],
    };

    for (const item of schedule) {
      const type = item.review_type;
      if (groups[type]) {
        groups[type].push(item);
      }
    }

    return (['new_hifz', 'recent_review', 'old_review'] as const)
      .filter((key) => groups[key].length > 0)
      .map((key) => ({
        key,
        ...SECTION_CONFIG[key],
        data: collapsedSections[key] ? [] : groups[key],
        count: groups[key].length,
      }));
  }, [schedule, collapsedSections]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;

  return (
    <Screen scroll={false} hasTabBar>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Memorization</Text>
          <Button
            title="Progress"
            onPress={() => router.push('/(student)/memorization/progress')}
            variant="ghost"
            size="sm"
            icon={<Ionicons name="stats-chart" size={16} color={theme.primary} />}
          />
        </View>

        {/* Quick Stats */}
        {stats && (
          <MemorizationProgressBar stats={stats} compact />
        )}

        {sections.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="book-outline"
              title="No revision items today"
              description="Your daily revision plan will appear here once your teacher assigns memorization."
            />
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item, index) =>
              item.progress_id ?? `${item.surah_number}-${item.from_ayah}-${index}`
            }
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section }) => {
              const s = section as any;
              const isCollapsed = collapsedSections[s.key] ?? false;
              return (
                <Pressable
                  onPress={() => toggleSection(s.key)}
                  style={styles.sectionHeaderContainer}
                >
                  <Ionicons name={s.icon} size={20} color={s.color} />
                  <View style={styles.sectionHeaderText}>
                    <Text style={styles.sectionHeaderArabic}>{s.titleAr}</Text>
                    <Text style={styles.sectionHeader}>{s.titleEn}</Text>
                  </View>
                  <View style={[styles.countBadge, { backgroundColor: s.color + '20' }]}>
                    <Text style={[styles.countText, { color: s.color }]}>{s.count}</Text>
                  </View>
                  <Ionicons
                    name={isCollapsed ? 'chevron-down' : 'chevron-up'}
                    size={18}
                    color={lightTheme.textTertiary}
                  />
                </Pressable>
              );
            }}
            renderItem={({ item }) => (
              <RevisionCard item={item} style={styles.revisionCard} />
            )}
          />
        )}
      </View>
    </Screen>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    fontSize: normalize(24),
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionHeaderArabic: {
    fontFamily: typography.fontFamily.arabicBold,
    fontSize: typography.fontSize.base,
    color: lightTheme.text,
  },
  sectionHeader: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
  },
  countBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: normalize(2),
    borderRadius: normalize(12),
    minWidth: normalize(28),
    alignItems: 'center',
  },
  countText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xs,
  },
  revisionCard: {
    marginBottom: spacing.sm,
  },
});
