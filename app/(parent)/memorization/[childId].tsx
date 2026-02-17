import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/feedback';
import { MemorizationProgressBar } from '@/features/memorization';
import { useMemorizationProgress } from '@/features/memorization/hooks/useMemorizationProgress';
import { useMemorizationStats } from '@/features/memorization/hooks/useMemorizationStats';
import { SURAHS } from '@/lib/quran-metadata';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { normalize } from '@/theme/normalize';

// ─── Status Colors ───────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  new: { color: colors.accent.indigo[600], bg: colors.accent.indigo[50] },
  learning: { color: colors.secondary[700], bg: colors.secondary[50] },
  memorized: { color: colors.semantic.success, bg: '#DCFCE7' },
  needs_review: { color: colors.semantic.warning, bg: '#FEF3C7' },
};

// ─── Parent Memorization View (Read-Only) ────────────────────────────────────

export default function ParentMemorizationScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { childId } = useLocalSearchParams<{ childId: string }>();

  const { data: stats, isLoading: statsLoading } = useMemorizationStats(childId);
  const { data: progress = [], isLoading: progressLoading, error, refetch } = useMemorizationProgress({
    studentId: childId ?? '',
  });

  const [expandedSurah, setExpandedSurah] = useState<number | null>(null);

  // Group by surah
  const surahsWithProgress = useMemo(() => {
    const map = new Map<number, { memorized: number; total: number; items: any[] }>();

    for (const item of progress) {
      const existing = map.get(item.surah_number) ?? { memorized: 0, total: 0, items: [] };
      const count = item.to_ayah - item.from_ayah + 1;
      existing.total += count;
      if (item.status === 'memorized') existing.memorized += count;
      existing.items.push(item);
      map.set(item.surah_number, existing);
    }

    return SURAHS.filter((s) => map.has(s.number)).map((s) => {
      const stat = map.get(s.number)!;
      return {
        ...s,
        progress: stat.total > 0 ? stat.memorized / s.ayahCount : 0,
        items: stat.items,
      };
    });
  }, [progress]);

  const isLoading = statsLoading || progressLoading;

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Button
          title={t('common.back')}
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
        />

        <Text style={styles.title}>Memorization Progress</Text>

        {/* Stats */}
        <Card variant="primary-glow" style={styles.statsCard}>
          <MemorizationProgressBar stats={stats ?? null} />
        </Card>

        {/* Surah List */}
        <Text style={styles.sectionTitle}>
          Surahs ({surahsWithProgress.length} started)
        </Text>

        {surahsWithProgress.length === 0 ? (
          <Card variant="outlined" style={styles.emptyCard}>
            <Text style={styles.emptyText}>No memorization progress yet.</Text>
          </Card>
        ) : (
          surahsWithProgress.map((surah) => {
            const isExpanded = expandedSurah === surah.number;
            return (
              <Card key={surah.number} variant="default" style={styles.surahCard}>
                <Pressable
                  onPress={() => setExpandedSurah(isExpanded ? null : surah.number)}
                  style={styles.surahRow}
                >
                  <View style={styles.surahInfo}>
                    <View style={styles.surahNameRow}>
                      <Text style={styles.surahNumber}>{surah.number}</Text>
                      <View>
                        <Text style={styles.surahArabic}>{surah.nameArabic}</Text>
                        <Text style={styles.surahEnglish}>{surah.nameEnglish}</Text>
                      </View>
                    </View>
                    <ProgressBar progress={surah.progress} variant="primary" height={6} showLabel />
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={lightTheme.textTertiary}
                  />
                </Pressable>

                {isExpanded && (
                  <View style={styles.ayahDetails}>
                    {surah.items.map((item: any, idx: number) => {
                      const sc = STATUS_COLORS[item.status] ?? STATUS_COLORS.new;
                      return (
                        <View key={idx} style={styles.ayahRange}>
                          <Text style={styles.ayahRangeText}>
                            Ayah {item.from_ayah}–{item.to_ayah}
                          </Text>
                          <View style={[styles.statusChip, { backgroundColor: sc.bg }]}>
                            <Text style={[styles.statusChipText, { color: sc.color }]}>
                              {item.status.replace('_', ' ')}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </Card>
            );
          })
        )}
      </View>
    </Screen>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
  },
  statsCard: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
    marginTop: spacing.sm,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  emptyText: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
    textAlign: 'center',
  },
  surahCard: {
    padding: spacing.md,
  },
  surahRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  surahInfo: {
    flex: 1,
    gap: spacing.sm,
  },
  surahNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  surahNumber: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.sm,
    color: lightTheme.textTertiary,
    width: normalize(28),
    textAlign: 'center',
  },
  surahArabic: {
    fontFamily: typography.fontFamily.arabicBold,
    fontSize: typography.fontSize.base,
    color: lightTheme.text,
  },
  surahEnglish: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: lightTheme.textSecondary,
  },
  ayahDetails: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    gap: spacing.sm,
  },
  ayahRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ayahRangeText: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: lightTheme.text,
  },
  statusChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: normalize(2),
    borderRadius: radius.xs,
  },
  statusChipText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(10),
    textTransform: 'uppercase',
  },
});
