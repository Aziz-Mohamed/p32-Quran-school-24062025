import React, { useMemo } from 'react';
import { I18nManager, Pressable, StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/feedback';
import { useRevisionSchedule } from '@/features/memorization/hooks/useRevisionSchedule';
import { useAuth } from '@/hooks/useAuth';
import { useStudentDashboard } from '@/features/dashboard/hooks/useStudentDashboard';
import { useRubCertifications, useRevisionHomework } from '@/features/gamification';
import type { EnrichedCertification } from '@/features/gamification';
import { useMemorizationStats } from '@/features/memorization';
import { getSurah } from '@/lib/quran-metadata';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { normalize } from '@/theme/normalize';

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_PREVIEW_ITEMS = 4;

const TYPE_CONFIG = {
  new_hifz: { labelKey: 'student.dashboard.newHifz', color: colors.accent.indigo[500], bg: colors.accent.indigo[50] },
  recent_review: { labelKey: 'student.dashboard.review', color: colors.secondary[500], bg: colors.secondary[50] },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAttendanceBadge(status: string | null | undefined, t: (key: string) => string) {
  switch (status) {
    case 'present':
      return { label: t('admin.attendance.status.present'), variant: 'success' as const };
    case 'absent':
      return { label: t('admin.attendance.status.absent'), variant: 'error' as const };
    case 'late':
      return { label: t('admin.attendance.status.late'), variant: 'warning' as const };
    case 'excused':
      return { label: t('admin.attendance.status.excused'), variant: 'info' as const };
    default:
      return { label: t('parent.dashboard.notMarked'), variant: 'default' as const };
  }
}

function TaskRow({ item, isRTL, t }: { item: any; isRTL: boolean; t: (key: string) => string }) {
  const surah = getSurah(item.surah_number);
  const surahName = surah
    ? (isRTL ? surah.nameArabic : surah.nameEnglish)
    : `${item.surah_number}`;
  const ayahRange = item.from_ayah === item.to_ayah
    ? `${item.from_ayah}`
    : `${item.from_ayah}-${item.to_ayah}`;
  const config = TYPE_CONFIG[item.review_type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.recent_review;

  return (
    <View style={styles.taskRow}>
      <View style={[styles.taskDot, { backgroundColor: config.color }]} />
      <View style={styles.taskInfo}>
        <Text style={styles.taskSurah} numberOfLines={1}>{surahName}</Text>
        <Text style={styles.taskAyah}>{ayahRange}</Text>
      </View>
      <View style={[styles.taskBadge, { backgroundColor: config.bg }]}>
        <Text style={[styles.taskBadgeText, { color: config.color }]}>{t(config.labelKey)}</Text>
      </View>
    </View>
  );
}

const FRESHNESS_DOT_COLORS: Record<string, string> = {
  fresh: '#22C55E',
  fading: '#EAB308',
  warning: '#F97316',
  critical: '#EF4444',
  dormant: '#9CA3AF',
};

function HomeworkRow({ item, enriched, t }: {
  item: { assignmentId: string; rubNumber: number; juz: number };
  enriched: EnrichedCertification[];
  t: (key: string, opts?: any) => string;
}) {
  const cert = enriched.find((c) => c.rub_number === item.rubNumber);
  const dotColor = cert
    ? (FRESHNESS_DOT_COLORS[cert.freshness.state] ?? colors.primary[400])
    : colors.primary[400];

  return (
    <View style={styles.taskRow}>
      <View style={[styles.taskDot, { backgroundColor: dotColor }]} />
      <View style={styles.taskInfo}>
        <Text style={styles.taskSurah} numberOfLines={1}>
          {t('gamification.rub')} {item.rubNumber}
        </Text>
        <Text style={styles.taskAyah}>
          {t('gamification.juz')} {item.juz}
        </Text>
      </View>
    </View>
  );
}

// ─── Student Dashboard ────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const router = useRouter();
  const isRTL = I18nManager.isRTL;

  const { data, isLoading, error, refetch } = useStudentDashboard(profile?.id);
  const { enriched } = useRubCertifications(profile?.id);
  const { homeworkItems } = useRevisionHomework(profile?.id);
  const { data: memStats } = useMemorizationStats(profile?.id);
  const todayStr = new Date().toISOString().split('T')[0];
  const { data: revisionSchedule = [] } = useRevisionSchedule(profile?.id, todayStr);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;

  const student = data?.student;
  const attendance = getAttendanceBadge(data?.todayAttendance?.status, t);
  const chevron = isRTL ? 'chevron-back' : 'chevron-forward';

  // Only show new_hifz + recent_review (old_review lives on Revision Health tab)
  const filteredSchedule = revisionSchedule.filter(
    (item: any) => item.review_type !== 'old_review',
  );
  const totalItems = filteredSchedule.length;
  const previewItems = filteredSchedule.slice(0, MAX_PREVIEW_ITEMS);
  const hasMore = totalItems > MAX_PREVIEW_ITEMS;
  const homeworkRubSet = useMemo(
    () => new Set(homeworkItems.map((h) => h.rubNumber)),
    [homeworkItems],
  );

  const effectiveCriticalCount = useMemo(
    () => enriched.filter(
      (c) => (c.freshness.state === 'critical' || c.freshness.state === 'warning')
        && !homeworkRubSet.has(c.rub_number),
    ).length,
    [enriched, homeworkRubSet],
  );

  const hasWarning = effectiveCriticalCount > 0;

  return (
    <Screen scroll hasTabBar>
      <View style={styles.container}>
        {/* 1. Header + Attendance Badge */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>
              {t('dashboard.welcome', { name: profile?.full_name?.split(' ')[0] ?? '' })}
            </Text>
            <Text style={styles.subtitle}>{t('student.dashboard.readyToLearn')}</Text>
          </View>
          <Badge
            label={attendance.label}
            variant={attendance.variant}
            size="md"
          />
        </View>

        {/* 2. Streak + Progress Card */}
        <Card variant="default" style={styles.heroCard}>
          {/* Streak Banner */}
          <View style={styles.streakBanner}>
            <View style={styles.streakLeft}>
              <Ionicons name="flame" size={normalize(28)} color={colors.accent.rose[500]} />
              <View>
                <Text style={styles.streakNumber}>{student?.current_streak ?? 0}</Text>
                <Text style={styles.streakLabel}>{t('student.dashboard.dayStreak')}</Text>
              </View>
            </View>
            {(student?.current_streak ?? 0) > 0 ? (
              <Text style={styles.bestStreak}>
                {t('student.dashboard.bestStreak', { count: student?.longest_streak ?? 0 })}
              </Text>
            ) : (
              <Text style={styles.startStreak}>{t('student.dashboard.startStreak')}</Text>
            )}
          </View>

          <View style={styles.heroDivider} />

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statBlock, { backgroundColor: colors.accent.indigo[50] }]}>
              <Text style={[styles.statValue, { color: colors.accent.indigo[600] }]}>
                {memStats?.quran_percentage != null
                  ? `${memStats.quran_percentage.toFixed(1)}%`
                  : '0%'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.accent.indigo[500] }]}>
                {t('student.dashboard.quranMemorized')}
              </Text>
            </View>
            <View style={[styles.statBlock, { backgroundColor: colors.secondary[50] }]}>
              <Text style={[styles.statValue, { color: colors.secondary[600] }]}>
                {data?.totalStickers ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.secondary[500] }]}>
                {t('student.dashboard.stickers')}
              </Text>
            </View>
            <View style={[styles.statBlock, { backgroundColor: colors.primary[50] }]}>
              <Text style={[styles.statValue, { color: colors.primary[600] }]}>
                {data?.totalSessions ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.primary[500] }]}>
                {t('student.dashboard.sessions')}
              </Text>
            </View>
          </View>
        </Card>

        {/* 3. Today's Tasks */}
        <Card
          variant="default"
          onPress={() => router.push('/(student)/(tabs)/memorization')}
          style={styles.tasksCard}
        >
          <View style={styles.tasksHeader}>
            <View style={[styles.tasksIcon, { backgroundColor: colors.accent.indigo[50] }]}>
              <Ionicons name="book" size={20} color={colors.accent.indigo[500]} />
            </View>
            <Text style={styles.tasksTitle}>{t('student.dashboard.todaysTasks')}</Text>
            <Ionicons name={chevron} size={18} color={colors.neutral[300]} />
          </View>

          {totalItems > 0 ? (
            <>
              <View style={styles.tasksList}>
                {previewItems.map((item: any, idx: number) => (
                  <TaskRow key={item.progress_id ?? `${item.surah_number}-${item.from_ayah}-${idx}`} item={item} isRTL={isRTL} t={t} />
                ))}
              </View>
              {hasMore && (
                <Text style={styles.seeAll}>
                  {t('student.dashboard.seeAll', { count: totalItems })} {isRTL ? '←' : '→'}
                </Text>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={20} color={colors.secondary[500]} />
              <Text style={styles.emptyStateText}>{t('student.dashboard.allCaughtUp')}</Text>
            </View>
          )}

        </Card>

        {/* 3b. Revision Homework */}
        {(homeworkItems.length > 0 || hasWarning) && (
          <Card
            variant="default"
            onPress={() => router.push('/(student)/(tabs)/lessons')}
            style={styles.tasksCard}
          >
            <View style={styles.tasksHeader}>
              <View style={[styles.tasksIcon, { backgroundColor: colors.secondary[50] }]}>
                <Ionicons name="book-outline" size={20} color={colors.secondary[500]} />
              </View>
              <Text style={styles.tasksTitle}>{t('student.revision.revisionHomework')}</Text>
              {homeworkItems.length > 0 && (
                <View style={styles.homeworkBadge}>
                  <Text style={styles.homeworkBadgeText}>{homeworkItems.length}</Text>
                </View>
              )}
              <Ionicons name={chevron} size={18} color={colors.neutral[300]} />
            </View>

            {homeworkItems.length > 0 && (
              <View style={styles.tasksList}>
                {homeworkItems.slice(0, MAX_PREVIEW_ITEMS).map((item) => (
                  <HomeworkRow key={item.assignmentId} item={item} enriched={enriched} t={t} />
                ))}
              </View>
            )}
            {homeworkItems.length > MAX_PREVIEW_ITEMS && (
              <Text style={styles.seeAll}>
                {t('student.dashboard.seeAll', { count: homeworkItems.length })} {isRTL ? '←' : '→'}
              </Text>
            )}

            {hasWarning && (
              <View style={[styles.warningRow, homeworkItems.length > 0 && styles.warningRowBorder]}>
                <Ionicons name="alert-circle" size={16} color="#92400E" />
                <Text style={styles.warningText}>
                  {t('gamification.revisionWarning', { count: effectiveCriticalCount })}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* 4. Explore */}
        <View style={styles.exploreRow}>
          <Pressable
            style={[styles.explorePill, { backgroundColor: colors.accent.violet[50] }]}
            onPress={() => router.push('/(student)/rub-progress')}
          >
            <Ionicons name="map" size={16} color={colors.accent.violet[500]} />
            <Text style={[styles.explorePillText, { color: colors.accent.violet[600] }]}>
              {t('gamification.progressMap')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.explorePill, { backgroundColor: colors.secondary[50] }]}
            onPress={() => router.push('/(student)/leaderboard')}
          >
            <Ionicons name="podium" size={16} color={colors.secondary[500]} />
            <Text style={[styles.explorePillText, { color: colors.secondary[600] }]}>
              {t('student.dashboard.viewLeaderboard')}
            </Text>
          </Pressable>
        </View>

      </View>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    fontSize: normalize(22),
  },
  subtitle: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    marginTop: normalize(2),
  },

  // Today's Tasks Card
  tasksCard: {
    padding: spacing.md,
  },
  tasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tasksIcon: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tasksTitle: {
    flex: 1,
    ...typography.textStyles.bodyMedium,
    color: lightTheme.text,
  },
  tasksList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  taskDot: {
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
  },
  taskInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  taskSurah: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(13),
    color: colors.neutral[900],
    flexShrink: 1,
  },
  taskAyah: {
    fontFamily: typography.fontFamily.regular,
    fontSize: normalize(12),
    color: colors.neutral[500],
  },
  taskBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: normalize(2),
    borderRadius: radius.full,
  },
  taskBadgeText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(11),
  },
  seeAll: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(12),
    color: colors.accent.indigo[500],
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral[100],
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.secondary[50],
    borderRadius: radius.md,
  },
  emptyStateText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(13),
    color: colors.secondary[700],
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: '#FEF3C7',
    borderRadius: radius.sm,
  },
  warningRowBorder: {
    marginTop: spacing.md,
  },
  warningText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(12),
    color: '#92400E',
    flex: 1,
  },

  // Hero Card (Streak + Stats)
  heroCard: {
    padding: spacing.md,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  streakNumber: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(26),
    color: colors.neutral[900],
    lineHeight: normalize(30),
  },
  streakLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(12),
    color: colors.neutral[500],
  },
  bestStreak: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(12),
    color: colors.neutral[400],
  },
  startStreak: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(12),
    color: colors.accent.rose[500],
    flexShrink: 1,
    textAlign: 'right' as const,
  },
  heroDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutral[100],
    marginVertical: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    gap: normalize(2),
  },
  statValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(16),
  },
  statLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(11),
  },

  // Homework Badge
  homeworkBadge: {
    backgroundColor: colors.secondary[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: normalize(2),
    borderRadius: radius.full,
    minWidth: normalize(24),
    alignItems: 'center',
  },
  homeworkBadgeText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(11),
    color: colors.secondary[600],
  },

  // Explore Pills
  exploreRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  explorePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  explorePillText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(13),
  },
});
