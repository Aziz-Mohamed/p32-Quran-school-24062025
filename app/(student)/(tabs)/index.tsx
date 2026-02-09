import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useStudentDashboard } from '@/features/dashboard/hooks/useStudentDashboard';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Student Dashboard ────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useStudentDashboard(profile?.id);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;

  const student = data?.student;
  const level = (student as any)?.levels ?? null;

  return (
    <Screen scroll>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {t('dashboard.welcome', { name: profile?.full_name ?? '' })}
          </Text>
          {level && (
            <Badge label={level.title ?? `Level ${level.level_number}`} variant="info" size="md" />
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statValue}>{student?.total_points ?? 0}</Text>
            <Text style={styles.statLabel}>{t('student.points')}</Text>
          </Card>
          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statValue}>{student?.current_streak ?? 0}</Text>
            <Text style={styles.statLabel}>{t('student.streak')}</Text>
          </Card>
          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statValue}>{data?.totalSessions ?? 0}</Text>
            <Text style={styles.statLabel}>{t('student.dashboard.sessionsCompleted')}</Text>
          </Card>
          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statValue}>{data?.totalStickers ?? 0}</Text>
            <Text style={styles.statLabel}>{t('student.dashboard.stickersEarned')}</Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
        <View style={styles.actionsRow}>
          <Button
            title={t('student.dashboard.viewSessions')}
            onPress={() => router.push('/(student)/sessions')}
            variant="secondary"
            size="sm"
            icon={<Ionicons name="list-outline" size={18} color={colors.primary[500]} />}
            style={styles.actionButton}
          />
          <Button
            title={t('student.dashboard.viewTrophies')}
            onPress={() => router.push('/(student)/trophy-room')}
            variant="secondary"
            size="sm"
            icon={<Ionicons name="trophy-outline" size={18} color={colors.primary[500]} />}
            style={styles.actionButton}
          />
          <Button
            title={t('student.dashboard.viewLeaderboard')}
            onPress={() => router.push('/(student)/leaderboard')}
            variant="secondary"
            size="sm"
            icon={<Ionicons name="podium-outline" size={18} color={colors.primary[500]} />}
            style={styles.actionButton}
          />
        </View>

        {/* Current Homework */}
        <Text style={styles.sectionTitle}>{t('student.dashboard.currentHomework')}</Text>
        {(data?.homework ?? []).length === 0 ? (
          <Card variant="outlined">
            <Text style={styles.emptyText}>{t('student.dashboard.noHomework')}</Text>
          </Card>
        ) : (
          data!.homework!.map((hw: any) => (
            <Card key={hw.id} variant="outlined" style={styles.homeworkCard}>
              <Text style={styles.homeworkDescription}>{hw.description}</Text>
              <Text style={styles.homeworkDue}>
                {t('teacher.sessions.due')}: {hw.due_date}
              </Text>
            </Card>
          ))
        )}

        {/* Recent Achievements */}
        <Text style={styles.sectionTitle}>{t('student.dashboard.recentAchievements')}</Text>
        {(data?.recentAchievements ?? []).length === 0 ? (
          <Card variant="outlined">
            <Text style={styles.emptyText}>{t('student.dashboard.noAchievements')}</Text>
          </Card>
        ) : (
          data!.recentAchievements!.map((ach: any) => (
            <Card key={ach.id} variant="outlined" style={styles.achievementCard}>
              <View style={styles.achievementRow}>
                <Ionicons name="ribbon-outline" size={24} color={colors.primary[500]} />
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementName}>
                    {ach.achievements?.title ?? 'Achievement'}
                  </Text>
                  <Text style={styles.achievementDate}>{ach.earned_at?.split('T')[0]}</Text>
                </View>
              </View>
            </Card>
          ))
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
