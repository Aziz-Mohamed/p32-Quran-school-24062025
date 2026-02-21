import React from 'react';
import { I18nManager, Pressable, StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge, ProgressBar } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/feedback';
import { useRevisionSchedule } from '@/features/memorization/hooks/useRevisionSchedule';
import { useMemorizationStats } from '@/features/memorization/hooks/useMemorizationStats';
import { useAuth } from '@/hooks/useAuth';
import { useStudentDashboard } from '@/features/dashboard/hooks/useStudentDashboard';
import { useRoleTheme } from '@/hooks/useRoleTheme';
import { useRubCertifications } from '@/features/gamification';
import { getSurah } from '@/lib/quran-metadata';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { normalize } from '@/theme/normalize';

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

function formatRelativeDate(dateStr: string, t: (key: string, opts?: Record<string, unknown>) => string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return t('student.dashboard.today');
  if (diffDays === 1) return t('student.dashboard.yesterday');
  return t('student.dashboard.daysAgo', { count: diffDays });
}

// ─── Student Dashboard ────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const router = useRouter();
  const theme = useRoleTheme();

  const { data, isLoading, error, refetch } = useStudentDashboard(profile?.id);
  const { activeCount, criticalCount } = useRubCertifications(profile?.id);
  const todayStr = new Date().toISOString().split('T')[0];
  const { data: revisionSchedule = [] } = useRevisionSchedule(profile?.id, todayStr);
  const { data: memStats } = useMemorizationStats(profile?.id);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;

  const student = data?.student;
  const attendance = getAttendanceBadge(data?.todayAttendance?.status, t);
  const chevron = I18nManager.isRTL ? 'chevron-back' : 'chevron-forward';

  const newCount = revisionSchedule.filter((i: any) => i.review_type === 'new_hifz').length;
  const recentCount = revisionSchedule.filter((i: any) => i.review_type === 'recent_review').length;
  const oldCount = revisionSchedule.filter((i: any) => i.review_type === 'old_review').length;
  const totalItems = revisionSchedule.length;
  const hasPlan = totalItems > 0;
  const hasWarning = criticalCount > 0;

  // Last session info
  const lastSession = data?.lastSession;
  const lastSessionRecitations = lastSession?.recitations as Array<{ surah_number: number; from_ayah: number; to_ayah: number }> | undefined;
  const lastSessionSurahInfo = lastSessionRecitations?.[0]
    ? getSurah(lastSessionRecitations[0].surah_number)
    : null;

  const quranPct = memStats?.quran_percentage ?? 0;

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

        {/* 2. Today's Plan (merged with revision warning) */}
        <Card
          variant="default"
          onPress={() => router.push('/(student)/(tabs)/memorization')}
          style={styles.todayCard}
        >
          <View style={styles.todayHeader}>
            <View style={[styles.todayIcon, { backgroundColor: colors.accent.indigo[50] }]}>
              <Ionicons name="book" size={20} color={colors.accent.indigo[500]} />
            </View>
            <View style={styles.todayHeaderText}>
              <Text style={styles.todayTitle}>{t('student.dashboard.todaysSchedule')}</Text>
              {hasPlan && (
                <Text style={styles.todaySubtitle}>
                  {t('student.dashboard.itemsToday', { count: totalItems })}
                </Text>
              )}
            </View>
            <Ionicons name={chevron} size={18} color={colors.neutral[300]} />
          </View>

          {hasPlan ? (
            <View style={styles.todayStats}>
              {newCount > 0 && (
                <View style={[styles.todayStat, { backgroundColor: colors.accent.indigo[50] }]}>
                  <Text style={[styles.todayStatCount, { color: colors.accent.indigo[600] }]}>{newCount}</Text>
                  <Text style={[styles.todayStatLabel, { color: colors.accent.indigo[500] }]}>{t('memorization.revisionLabels.new')}</Text>
                </View>
              )}
              {recentCount > 0 && (
                <View style={[styles.todayStat, { backgroundColor: colors.secondary[50] }]}>
                  <Text style={[styles.todayStatCount, { color: colors.secondary[600] }]}>{recentCount}</Text>
                  <Text style={[styles.todayStatLabel, { color: colors.secondary[500] }]}>{t('memorization.revisionLabels.recent')}</Text>
                </View>
              )}
              {oldCount > 0 && (
                <View style={[styles.todayStat, { backgroundColor: colors.primary[50] }]}>
                  <Text style={[styles.todayStatCount, { color: colors.primary[600] }]}>{oldCount}</Text>
                  <Text style={[styles.todayStatLabel, { color: colors.primary[500] }]}>{t('memorization.revisionLabels.older')}</Text>
                </View>
              )}
            </View>
          ) : !hasWarning ? (
            <View style={styles.todayCaughtUp}>
              <Ionicons name="checkmark-circle" size={20} color={colors.secondary[500]} />
              <Text style={styles.todayCaughtUpText}>{t('student.dashboard.allCaughtUp')}</Text>
            </View>
          ) : null}

          {/* Inline revision warning */}
          {hasWarning && (
            <View style={[styles.warningRow, hasPlan && styles.warningRowWithBorder]}>
              <Ionicons name="alert-circle" size={16} color="#92400E" />
              <Text style={styles.warningText}>
                {t('gamification.revisionWarning', { count: criticalCount })}
              </Text>
            </View>
          )}
        </Card>

        {/* 3. Last Session */}
        {lastSession && (
          <Pressable
            style={styles.lastSession}
            onPress={() => router.push('/(student)/sessions')}
          >
            <Ionicons name="time-outline" size={16} color={colors.neutral[400]} />
            <Text style={styles.lastSessionText}>
              {t('student.dashboard.lastSession')}: {formatRelativeDate(lastSession.session_date, t)}
              {lastSessionSurahInfo ? ` \u00B7 ${I18nManager.isRTL ? lastSessionSurahInfo.nameArabic : lastSessionSurahInfo.nameEnglish}` : ''}
            </Text>
            <Ionicons name={chevron} size={14} color={colors.neutral[300]} />
          </Pressable>
        )}

        {/* 4. Quran Journey */}
        <Card
          variant="default"
          onPress={() => router.push('/(student)/rub-progress')}
          style={styles.journeyCard}
        >
          <View style={styles.journeyHeader}>
            <Text style={styles.journeyTitle}>{t('student.dashboard.quranJourney')}</Text>
            <Text style={styles.journeyCount}>
              {activeCount} / 240 {t('student.dashboard.rubCertified')}
            </Text>
          </View>
          <ProgressBar
            progress={activeCount / 240}
            variant={theme.tag}
            height={8}
          />
          {quranPct > 0 && (
            <Text style={styles.journeyPct}>
              {t('student.dashboard.quranMemorized', { pct: quranPct.toFixed(1) })}
            </Text>
          )}
          <View style={styles.journeyDivider} />
          <View style={styles.journeyStats}>
            <View style={styles.journeyStat}>
              <Ionicons name="flame-outline" size={16} color={colors.accent.rose[500]} />
              <Text style={styles.journeyStatValue}>{student?.current_streak ?? 0}</Text>
              <Text style={styles.journeyStatLabel}>{t('student.streak')}</Text>
            </View>
            <View style={styles.journeyStatSep} />
            <View style={styles.journeyStat}>
              <Ionicons name="star-outline" size={16} color={colors.secondary[500]} />
              <Text style={styles.journeyStatValue}>{data?.totalStickers ?? 0}</Text>
              <Text style={styles.journeyStatLabel}>{t('student.dashboard.stickers')}</Text>
            </View>
            <View style={styles.journeyStatSep} />
            <View style={styles.journeyStat}>
              <Ionicons name="calendar-outline" size={16} color={colors.accent.indigo[500]} />
              <Text style={styles.journeyStatValue}>{data?.totalSessions ?? 0}</Text>
              <Text style={styles.journeyStatLabel}>{t('student.dashboard.sessions')}</Text>
            </View>
          </View>
        </Card>

        {/* 5. Quick Links */}
        <View style={styles.quickLinks}>
          <Pressable
            style={[styles.quickLink, { backgroundColor: colors.accent.violet[50] }]}
            onPress={() => router.push('/(student)/rub-progress')}
          >
            <Ionicons name="map" size={16} color={colors.accent.violet[500]} />
            <Text style={[styles.quickLinkText, { color: colors.accent.violet[600] }]}>
              {t('gamification.progressMap')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.quickLink, { backgroundColor: colors.secondary[50] }]}
            onPress={() => router.push('/(student)/leaderboard')}
          >
            <Ionicons name="podium" size={16} color={colors.secondary[500]} />
            <Text style={[styles.quickLinkText, { color: colors.secondary[600] }]}>
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

  // Today's Plan Card
  todayCard: {
    padding: spacing.md,
  },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  todayIcon: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayHeaderText: {
    flex: 1,
  },
  todayTitle: {
    ...typography.textStyles.bodyMedium,
    color: lightTheme.text,
  },
  todaySubtitle: {
    ...typography.textStyles.label,
    color: colors.neutral[500],
    marginTop: normalize(1),
  },
  todayStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  todayStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    gap: normalize(2),
  },
  todayStatCount: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(20),
  },
  todayStatLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(11),
  },
  todayCaughtUp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.secondary[50],
    borderRadius: radius.md,
  },
  todayCaughtUpText: {
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
  warningRowWithBorder: {
    marginTop: spacing.md,
  },
  warningText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(12),
    color: '#92400E',
    flex: 1,
  },

  // Last Session
  lastSession: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
  },
  lastSessionText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: normalize(12),
    color: colors.neutral[600],
  },

  // Quran Journey Card
  journeyCard: {
    padding: spacing.md,
  },
  journeyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  journeyTitle: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[900],
  },
  journeyCount: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(12),
    color: colors.neutral[500],
  },
  journeyPct: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(11),
    color: colors.neutral[500],
    marginTop: normalize(4),
  },
  journeyDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutral[100],
    marginVertical: spacing.sm,
  },
  journeyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  journeyStat: {
    alignItems: 'center',
    gap: normalize(2),
  },
  journeyStatValue: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(14),
    color: colors.neutral[900],
  },
  journeyStatLabel: {
    ...typography.textStyles.label,
    color: colors.neutral[500],
    fontSize: normalize(11),
  },
  journeyStatSep: {
    width: StyleSheet.hairlineWidth,
    height: normalize(28),
    backgroundColor: colors.neutral[200],
  },

  // Quick Links
  quickLinks: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickLink: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  quickLinkText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(13),
  },
});
