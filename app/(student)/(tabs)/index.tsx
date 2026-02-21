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
import { useAuth } from '@/hooks/useAuth';
import { useStudentDashboard } from '@/features/dashboard/hooks/useStudentDashboard';
import { useRoleTheme } from '@/hooks/useRoleTheme';
import { useRubCertifications, RevisionWarning } from '@/features/gamification';
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

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;

  const student = data?.student;
  const currentLevel = activeCount;
  const attendance = getAttendanceBadge(data?.todayAttendance?.status, t);
  const chevron = I18nManager.isRTL ? 'chevron-back' : 'chevron-forward';

  return (
    <Screen scroll hasTabBar>
      <View style={styles.container}>
        {/* 1. Header + Attendance Badge */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>
              {t('dashboard.welcome', { name: profile?.full_name?.split(' ')[0] ?? '' })} {'\uD83D\uDC4B'}
            </Text>
            <Text style={styles.subtitle}>{t('student.dashboard.readyToLearn')}</Text>
          </View>
          <Badge
            label={attendance.label}
            variant={attendance.variant}
            size="md"
          />
        </View>

        {/* 2. Today's Revision Plan */}
        {revisionSchedule.length > 0 && (() => {
          const newCount = revisionSchedule.filter((i: any) => i.review_type === 'new_hifz').length;
          const recentCount = revisionSchedule.filter((i: any) => i.review_type === 'recent_review').length;
          const oldCount = revisionSchedule.filter((i: any) => i.review_type === 'old_review').length;
          return (
            <Card
              variant="default"
              onPress={() => router.push('/(student)/(tabs)/memorization')}
              style={styles.revisionPlanCard}
            >
              <View style={styles.revisionPlanHeader}>
                <View style={[styles.revisionPlanIcon, { backgroundColor: colors.accent.indigo[50] }]}>
                  <Ionicons name="book" size={20} color={colors.accent.indigo[500]} />
                </View>
                <Text style={styles.revisionPlanTitle}>{t('memorization.todaysRevisionPlan')}</Text>
                <Ionicons name={chevron} size={18} color={colors.neutral[300]} />
              </View>
              <View style={styles.revisionPlanStats}>
                {newCount > 0 && (
                  <View style={styles.revisionPlanStat}>
                    <Text style={[styles.revisionPlanCount, { color: colors.accent.indigo[600] }]}>{newCount}</Text>
                    <Text style={styles.revisionPlanLabel}>{t('memorization.revisionLabels.new')}</Text>
                  </View>
                )}
                {recentCount > 0 && (
                  <View style={styles.revisionPlanStat}>
                    <Text style={[styles.revisionPlanCount, { color: colors.secondary[600] }]}>{recentCount}</Text>
                    <Text style={styles.revisionPlanLabel}>{t('memorization.revisionLabels.recent')}</Text>
                  </View>
                )}
                {oldCount > 0 && (
                  <View style={styles.revisionPlanStat}>
                    <Text style={[styles.revisionPlanCount, { color: colors.primary[600] }]}>{oldCount}</Text>
                    <Text style={styles.revisionPlanLabel}>{t('memorization.revisionLabels.older')}</Text>
                  </View>
                )}
              </View>
            </Card>
          );
        })()}

        {/* 3. Revision Warning */}
        <RevisionWarning count={criticalCount} />

        {/* 4. Progress Strip */}
        <Card
          variant="default"
          onPress={() => router.push('/(student)/rub-progress')}
          style={styles.progressStrip}
        >
          <View style={styles.progressStripHeader}>
            <Text style={styles.progressStripLevel}>
              {t('gamification.levelLabel', { level: currentLevel, total: 240 })}
            </Text>
            <Ionicons name={chevron} size={18} color={colors.neutral[300]} />
          </View>
          <ProgressBar
            progress={currentLevel / 240}
            variant={theme.tag}
            height={8}
          />
          <View style={styles.progressStripDivider} />
          <View style={styles.progressStripStats}>
            <View style={styles.progressStripStat}>
              <Ionicons name="flame-outline" size={16} color={colors.accent.rose[500]} />
              <Text style={styles.progressStripStatValue}>
                {student?.current_streak ?? 0}
              </Text>
              <Text style={styles.progressStripStatLabel}>{t('student.streak')}</Text>
            </View>
            <View style={styles.progressStripStatSeparator} />
            <View style={styles.progressStripStat}>
              <Ionicons name="star-outline" size={16} color={colors.secondary[500]} />
              <Text style={styles.progressStripStatValue}>
                {data?.totalStickers ?? 0}
              </Text>
              <Text style={styles.progressStripStatLabel}>{t('student.dashboard.stickers')}</Text>
            </View>
            <View style={styles.progressStripStatSeparator} />
            <View style={styles.progressStripStat}>
              <Ionicons name="calendar-outline" size={16} color={colors.accent.indigo[500]} />
              <Text style={styles.progressStripStatValue}>
                {data?.totalSessions ?? 0}
              </Text>
              <Text style={styles.progressStripStatLabel}>{t('student.dashboard.sessions')}</Text>
            </View>
          </View>
        </Card>

        {/* 6. Explore */}
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
  // Revision Plan
  revisionPlanCard: {
    padding: spacing.md,
  },
  revisionPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  revisionPlanIcon: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  revisionPlanTitle: {
    flex: 1,
    ...typography.textStyles.bodyMedium,
    color: lightTheme.text,
  },
  revisionPlanStats: {
    flexDirection: 'row',
    gap: spacing.lg,
    justifyContent: 'center',
  },
  revisionPlanStat: {
    alignItems: 'center',
    gap: normalize(2),
  },
  revisionPlanCount: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(20),
  },
  revisionPlanLabel: {
    ...typography.textStyles.label,
    color: colors.neutral[500],
  },

  // Progress Strip
  progressStrip: {
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  progressStripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressStripLevel: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[900],
  },
  progressStripDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutral[100],
    marginVertical: spacing.sm,
  },
  progressStripStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  progressStripStat: {
    alignItems: 'center',
    gap: normalize(2),
  },
  progressStripStatValue: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(14),
    color: colors.neutral[900],
  },
  progressStripStatLabel: {
    ...typography.textStyles.label,
    color: colors.neutral[500],
    fontSize: normalize(11),
  },
  progressStripStatSeparator: {
    width: StyleSheet.hairlineWidth,
    height: normalize(28),
    backgroundColor: colors.neutral[200],
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
