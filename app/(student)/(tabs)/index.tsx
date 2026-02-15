import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge, ProgressBar } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useStudentDashboard } from '@/features/dashboard/hooks/useStudentDashboard';
import { useRoleTheme } from '@/hooks/useRoleTheme';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Student Dashboard ────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const router = useRouter();
  const theme = useRoleTheme();

  const { data, isLoading, error, refetch } = useStudentDashboard(profile?.id);

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
          data!.homework!.map((hw: any) => (
            <Card key={hw.id} variant="default" style={styles.homeworkCard}>
              <View style={styles.homeworkContent}>
                <View style={[styles.homeworkIcon, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="book" size={20} color={theme.primary} />
                </View>
                <View style={styles.homeworkInfo}>
                  <Text style={styles.homeworkDescription} numberOfLines={1}>{hw.description}</Text>
                  <Text style={styles.homeworkDue}>
                    {t('teacher.sessions.due')}: {hw.due_date}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
              </View>
            </Card>
          ))
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
    fontSize: 22,
  },
  subtitle: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    marginTop: 2,
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
    fontSize: 28,
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
    fontSize: 18,
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
    borderRadius: 16,
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
    padding: spacing.md,
  },
  homeworkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  homeworkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeworkInfo: {
    flex: 1,
  },
  homeworkDescription: {
    ...typography.textStyles.bodyMedium,
    color: lightTheme.text,
  },
  homeworkDue: {
    ...typography.textStyles.label,
    color: colors.accent.rose[500],
    marginTop: 2,
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
    width: 48,
    height: 48,
    borderRadius: 24,
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
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  greeting: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: '40%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  statValue: {
    ...typography.textStyles.heading,
    color: lightTheme.primary,
    fontSize: typography.fontSize['2xl'],
  },
  statLabel: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
    marginTop: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: '28%',
  },
  emptyText: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
    textAlign: 'center',
  },
  homeworkCard: {
    marginBottom: spacing.xs,
  },
  homeworkDescription: {
    ...typography.textStyles.body,
    color: lightTheme.text,
  },
  homeworkDue: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    marginTop: spacing.xs,
  },
  achievementCard: {
    marginBottom: spacing.xs,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    ...typography.textStyles.body,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.semiBold,
  },
  achievementDate: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
  },
});
