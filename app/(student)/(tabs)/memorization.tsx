import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { MemorizationHealthCard, MemorizationRow } from '@/features/memorization';
import { useRevisionSchedule } from '@/features/memorization/hooks/useRevisionSchedule';
import { useMemorizationStats } from '@/features/memorization/hooks/useMemorizationStats';
import { useMemorizationProgress } from '@/features/memorization/hooks/useMemorizationProgress';
import type { RevisionScheduleItem } from '@/features/memorization';
import { useAuth } from '@/hooks/useAuth';
import { SURAHS } from '@/lib/quran-metadata';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { normalize } from '@/theme/normalize';

// ─── Memorization Screen ─────────────────────────────────────────────────────

export default function MemorizationScreen() {
  const { t } = useTranslation();
  const { profile } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];
  const { data: schedule = [], isLoading: scheduleLoading, error, refetch } = useRevisionSchedule(profile?.id, todayStr);
  const { data: stats } = useMemorizationStats(profile?.id);
  const { data: progress = [], isLoading: progressLoading } = useMemorizationProgress({
    studentId: profile?.id ?? '',
  });

  const [practiceCollapsed, setPracticeCollapsed] = useState(false);

  // Split schedule into new_hifz (prominent) and recent_review (compact)
  const { newHifzItems, recentReviewItems } = useMemo(() => {
    const newHifz: RevisionScheduleItem[] = [];
    const recentReview: RevisionScheduleItem[] = [];

    for (const item of schedule) {
      if (item.review_type === 'new_hifz') {
        newHifz.push(item);
      } else if (item.review_type === 'recent_review') {
        recentReview.push(item);
      }
    }

    return { newHifzItems: newHifz, recentReviewItems: recentReview };
  }, [schedule]);

  // Group progress by surah for compact journey list
  const surahsWithProgress = useMemo(() => {
    const map = new Map<number, { memorized: number; total: number }>();

    for (const item of progress) {
      const existing = map.get(item.surah_number) ?? { memorized: 0, total: 0 };
      const ayahCount = item.to_ayah - item.from_ayah + 1;
      existing.total += ayahCount;
      if (item.status === 'memorized') {
        existing.memorized += ayahCount;
      }
      map.set(item.surah_number, existing);
    }

    return SURAHS.filter((s) => map.has(s.number)).map((s) => {
      const data = map.get(s.number)!;
      return {
        ...s,
        memorizedAyahs: data.memorized,
        totalTrackedAyahs: data.total,
        progress: data.total > 0 ? data.memorized / s.ayahCount : 0,
        percentage: data.total > 0 ? Math.round((data.memorized / s.ayahCount) * 100) : 0,
      };
    });
  }, [progress]);

  const isLoading = scheduleLoading || progressLoading;
  const hasNoTasks = newHifzItems.length === 0 && recentReviewItems.length === 0;

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;

  return (
    <Screen scroll hasTabBar>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>{t('memorization.title')}</Text>

        {/* Hero Ayah Counter */}
        <MemorizationHealthCard stats={stats} />

        {/* New Memorization — PRIMARY */}
        {newHifzItems.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>
              {t('memorization.sections.new_hifz')}
            </Text>
            {newHifzItems.map((item, index) => {
              const surah = SURAHS[item.surah_number - 1];
              const ayahCount = item.to_ayah - item.from_ayah + 1;
              return (
                <Card
                  key={item.progress_id ?? `new-${item.surah_number}-${item.from_ayah}-${index}`}
                  variant="default"
                  style={styles.newHifzCard}
                >
                  <View style={styles.newHifzAccent} />
                  <View style={styles.newHifzContent}>
                    <Text style={styles.newHifzSurah}>
                      {surah?.nameArabic ?? `Surah ${item.surah_number}`}
                    </Text>
                    <Text style={styles.newHifzEnglish}>
                      {surah?.nameEnglish}
                    </Text>
                    <Text style={styles.newHifzRange}>
                      {t('memorization.ayahRange', { from: item.from_ayah, to: item.to_ayah })}
                      {'  ·  '}
                      {t('memorization.newAyahCount', { count: ayahCount })}
                    </Text>
                  </View>
                  <Ionicons
                    name="book-outline"
                    size={20}
                    color={colors.accent.indigo[500]}
                  />
                </Card>
              );
            })}
          </>
        )}

        {/* Continue Practicing — SECONDARY */}
        {recentReviewItems.length > 0 && (
          <>
            <Pressable
              onPress={() => setPracticeCollapsed((prev) => !prev)}
              style={styles.sectionHeaderContainer}
            >
              <Text style={styles.sectionHeader}>
                {t('memorization.sections.recent_practice')}
              </Text>
              <Ionicons
                name={practiceCollapsed ? 'chevron-down' : 'chevron-up'}
                size={16}
                color={colors.neutral[400]}
              />
            </Pressable>
            {!practiceCollapsed &&
              recentReviewItems.map((item, index) => (
                <MemorizationRow
                  key={item.progress_id ?? `review-${item.surah_number}-${item.from_ayah}-${index}`}
                  item={item}
                />
              ))}
          </>
        )}

        {/* Empty State */}
        {hasNoTasks && (
          <EmptyState
            icon="book-outline"
            title={t('memorization.noRevisionToday')}
            description={t('memorization.noRevisionDescription')}
          />
        )}

        {/* Your Journey — TERTIARY (compact surah list) */}
        {surahsWithProgress.length > 0 && (
          <>
            <Text style={styles.journeyHeader}>
              {t('memorization.yourJourney')}
            </Text>
            <View style={styles.journeyList}>
              {surahsWithProgress.map((surah) => (
                <View key={surah.number} style={styles.journeyRow}>
                  <Text style={styles.journeyNum}>{surah.number}</Text>
                  <Text style={styles.journeyName} numberOfLines={1}>
                    {surah.nameArabic}
                  </Text>
                  <View style={styles.journeyBarContainer}>
                    <ProgressBar
                      progress={surah.progress}
                      variant="primary"
                      height={4}
                    />
                  </View>
                  <Text style={styles.journeyPct}>{surah.percentage}%</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    fontSize: normalize(24),
  },

  // Section Headers
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sectionHeader: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
    fontSize: normalize(15),
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },

  // New Hifz Cards — PROMINENT
  newHifzCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingLeft: 0,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  newHifzAccent: {
    width: normalize(4),
    alignSelf: 'stretch',
    backgroundColor: colors.accent.indigo[500],
    borderRadius: radius.xs,
    marginRight: spacing.md,
  },
  newHifzContent: {
    flex: 1,
    gap: normalize(2),
  },
  newHifzSurah: {
    fontFamily: typography.fontFamily.arabicBold,
    fontSize: normalize(18),
    color: lightTheme.text,
  },
  newHifzEnglish: {
    fontFamily: typography.fontFamily.regular,
    fontSize: normalize(12),
    color: lightTheme.textSecondary,
  },
  newHifzRange: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(13),
    color: colors.accent.indigo[600],
    marginTop: spacing.xs,
  },

  // Journey Section — COMPACT
  journeyHeader: {
    ...typography.textStyles.subheading,
    color: lightTheme.textSecondary,
    fontSize: normalize(14),
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  journeyList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  journeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  journeyNum: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(11),
    color: colors.neutral[400],
    width: normalize(22),
    textAlign: 'center',
  },
  journeyName: {
    fontFamily: typography.fontFamily.arabicBold,
    fontSize: normalize(13),
    color: lightTheme.text,
    width: normalize(70),
  },
  journeyBarContainer: {
    flex: 1,
  },
  journeyPct: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(11),
    color: colors.neutral[500],
    width: normalize(32),
    textAlign: 'right',
  },
});
