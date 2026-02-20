import React from 'react';
import { I18nManager, StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge, ProgressBar } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/feedback';
import { useRevisionSchedule } from '@/features/memorization/hooks/useRevisionSchedule';
import { useAuth } from '@/hooks/useAuth';
import { useStudentDashboard } from '@/features/dashboard/hooks/useStudentDashboard';
import { useRoleTheme } from '@/hooks/useRoleTheme';
import { formatSessionDate } from '@/lib/helpers';
import { formatVerseRange } from '@/lib/quran-metadata';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

// ─── Student Dashboard ────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const router = useRouter();
  const theme = useRoleTheme();

  const { data, isLoading, error, refetch } = useStudentDashboard(profile?.id);
  const todayStr = new Date().toISOString().split('T')[0];
  const { data: revisionSchedule = [] } = useRevisionSchedule(profile?.id, todayStr);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;

  const student = data?.student;
  const level = (student as any)?.levels ?? null;

  return (
    <Screen scroll hasTabBar>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>
              {t('dashboard.welcome', { name: profile?.full_name?.split(' ')[0] ?? '' })} 👋
            </Text>
            <Text style={styles.subtitle}>{t('student.dashboard.readyToLearn')}</Text>
          </View>
          {level && (
            <Badge 
              label={level.title ?? `${t('common.level')} ${level.level_number}`} 
              variant={theme.tag} 
              size="md" 
            />
          )}
        </View>

        {/* Level Progress */}
        <Card variant="primary-glow" style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelTitle}>{t('common.level')} {level?.level_number ?? 1}</Text>
            <Text style={styles.levelPoints}>{student?.total_points ?? 0} {t('student.points')}</Text>
          </View>
          <ProgressBar 
            progress={0.65} // Example progress
            variant={theme.tag} 
            height={10} 
            showLabel 
            label={t('student.dashboard.levelProgress')} 
          />
        </Card>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Card variant="default" style={styles.statCard}>
            <Text style={[styles.statValue, { color: theme.primary }]}>{student?.total_points ?? 0}</Text>
            <Text style={styles.statLabel}>{t('student.points')}</Text>
          </Card>
          <Card variant="default" style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.accent.rose[500] }]}>
              {student?.current_streak ?? 0}
            </Text>
            <Text style={styles.statLabel}>{t('student.streak')}</Text>
          </Card>
        </View>

        {/* Activity Summary */}
        <View style={styles.statsRow}>
           <Card variant="outlined" style={styles.miniStatCard}>
            <Ionicons name="calendar-outline" size={20} color={theme.primary} />
            <Text style={styles.miniStatValue}>{data?.totalSessions ?? 0}</Text>
            <Text style={styles.miniStatLabel}>{t('student.dashboard.sessions')}</Text>
          </Card>
          <Card variant="outlined" style={styles.miniStatCard}>
            <Ionicons name="star-outline" size={20} color={colors.secondary[500]} />
            <Text style={styles.miniStatValue}>{data?.totalStickers ?? 0}</Text>
            <Text style={styles.miniStatLabel}>{t('student.dashboard.stickers')}</Text>
          </Card>
        </View>

        {/* Today's Revision Plan */}
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
                <Ionicons name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"} size={18} color={colors.neutral[300]} />
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

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
        <View style={styles.actionsRow}>
          <Button
            title={t('student.dashboard.viewSessions')}
            onPress={() => router.push('/(student)/sessions')}
            variant="ghost"
            size="sm"
            icon={<Ionicons name="list" size={18} color={theme.primary} />}
            style={[styles.actionButton, { backgroundColor: theme.primaryLight }]}
          />
          <Button
            title={t('student.dashboard.viewTrophies')}
            onPress={() => router.push('/(student)/trophy-room')}
            variant="ghost"
            size="sm"
            icon={<Ionicons name="trophy" size={18} color={colors.secondary[500]} />}
            style={[styles.actionButton, { backgroundColor: colors.secondary[50] }]}
          />
        </View>

        {/* Current Homework */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('student.dashboard.currentHomework')}</Text>
          <Badge label={String((data?.homework ?? []).length)} variant={theme.tag} />
        </View>
        {(data?.homework ?? []).length === 0 ? (
          <Card variant="outlined" style={styles.emptyCard}>
            <Text style={styles.emptyText}>{t('student.dashboard.noHomework')}</Text>
          </Card>
        ) : (
          data!.homework!.map((hw: any) => {
            const isOverdue = hw.due_date && new Date(hw.due_date + 'T00:00:00') < new Date(new Date().toISOString().split('T')[0] + 'T00:00:00');
            const rec = hw.sessions?.recitations?.[0];
            const verse = rec ? formatVerseRange(rec.surah_number, rec.from_ayah, rec.to_ayah, i18n.language as 'ar' | 'en') : null;
            return (
              <Card key={hw.id} variant="default" onPress={() => router.push(`/(student)/homework/${hw.id}`)} style={styles.homeworkCard}>
                <View style={styles.homeworkContent}>
                  <View style={styles.homeworkIcon}>
                    <Ionicons name="book-outline" size={20} color={colors.accent.indigo[500]} />
                  </View>
                  <View style={styles.homeworkInfo}>
                    {verse ? (
                      <Text numberOfLines={1}>
                        <Text style={styles.homeworkSurah}>{verse}</Text>
                        {'  '}
                        <Text style={styles.homeworkType}>{hw.description.split(' ')[0]}</Text>
                      </Text>
                    ) : (
                      <Text style={styles.homeworkSurah} numberOfLines={1}>{hw.description}</Text>
                    )}
                    <Text style={styles.homeworkDue}>
                      <Text style={styles.homeworkDueLabel}>{t('teacher.sessions.due')}  </Text>
                      <Text style={isOverdue ? styles.homeworkOverdue : undefined}>
                        {hw.due_date
                          ? formatSessionDate(hw.due_date, i18n.language).date
                          : t('student.homeworkDetail.noDueDate')}
                      </Text>
                    </Text>
                  </View>
                  <Ionicons name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"} size={16} color={colors.neutral[300]} />
                </View>
              </Card>
            );
          })
        )}

        {/* Recent Achievements */}
        <Text style={styles.sectionTitle}>{t('student.dashboard.recentAchievements')}</Text>
        {(data?.recentAchievements ?? []).length === 0 ? (
          <Card variant="outlined" style={styles.emptyCard}>
            <Text style={styles.emptyText}>{t('student.dashboard.noAchievements')}</Text>
          </Card>
        ) : (
          <View style={styles.achievementsGrid}>
            {data!.recentAchievements!.map((ach: any) => (
              <Card key={ach.id} variant="glass" style={styles.achievementCard}>
                <View style={styles.achievementCircle}>
                  <Ionicons name="ribbon" size={24} color={colors.secondary[500]} />
                </View>
                <Text style={styles.achievementName} numberOfLines={1}>
                  {ach.achievements?.title ?? t('common.achievement')}
                </Text>
              </Card>
            ))}
          </View>
        )}
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
  levelCard: {
    padding: spacing.lg,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelTitle: {
    ...typography.textStyles.subheading,
    color: colors.neutral[900],
  },
  levelPoints: {
    ...typography.textStyles.label,
    color: colors.neutral[500],
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statValue: {
    ...typography.textStyles.display,
    fontSize: normalize(28),
  },
  statLabel: {
    ...typography.textStyles.label,
    color: colors.neutral[500],
    marginTop: spacing.xs,
  },
  miniStatCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  miniStatValue: {
    ...typography.textStyles.bodyMedium,
    fontSize: normalize(18),
    color: colors.neutral[900],
  },
  miniStatLabel: {
    ...typography.textStyles.label,
    color: colors.neutral[500],
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: normalize(16),
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  emptyText: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
  },
  homeworkCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  homeworkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  homeworkIcon: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(12),
    backgroundColor: colors.accent.indigo[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeworkInfo: {
    flex: 1,
    gap: normalize(3),
  },
  homeworkSurah: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(14),
    color: lightTheme.text,
  },
  homeworkType: {
    fontFamily: typography.fontFamily.regular,
    fontSize: normalize(12),
    color: colors.neutral[400],
  },
  homeworkDue: {
    ...typography.textStyles.caption,
    color: colors.neutral[400],
  },
  homeworkDueLabel: {
    color: colors.neutral[300],
  },
  homeworkOverdue: {
    color: colors.accent.rose[500],
  },
  achievementsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  achievementCard: {
    width: '47%',
    alignItems: 'center',
    padding: spacing.md,
  },
  achievementCircle: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    backgroundColor: colors.secondary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  achievementName: {
    ...typography.textStyles.label,
    color: colors.neutral[800],
    textAlign: 'center',
  },
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
});
