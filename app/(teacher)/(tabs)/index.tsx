import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useTeacherDashboard } from '@/features/dashboard/hooks/useTeacherDashboard';
import { useCheckIn, useCheckOut } from '@/features/sessions/hooks/useCheckin';
import { typography } from '@/theme/typography';
import { lightTheme, colors, semantic } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';

// ─── Teacher Dashboard ────────────────────────────────────────────────────────

export default function TeacherDashboard() {
  const { t } = useTranslation();
  const { profile, schoolId } = useAuth();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useTeacherDashboard(profile?.id);
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;

  const checkin = data?.checkin;
  const isCheckedIn = !!checkin && !checkin.checked_out_at;
  const isCheckedOut = !!checkin && !!checkin.checked_out_at;

  const handleCheckIn = () => {
    if (!profile?.id || !schoolId) return;
    checkInMutation.mutate({ teacherId: profile.id, schoolId });
  };

  const handleCheckOut = () => {
    if (!checkin?.id) return;
    checkOutMutation.mutate(checkin.id);
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {t('dashboard.welcome', { name: profile?.full_name ?? '' })}
          </Text>
          <Badge label={t('roles.teacher')} variant="info" size="md" />
        </View>

        {/* Check-in / Check-out */}
        <Card variant="elevated" style={styles.checkinCard}>
          <View style={styles.checkinRow}>
            <View style={styles.checkinInfo}>
              <Ionicons
                name={isCheckedOut ? 'checkmark-circle' : isCheckedIn ? 'time-outline' : 'log-in-outline'}
                size={24}
                color={isCheckedOut ? semantic.success : isCheckedIn ? colors.primary[500] : lightTheme.textSecondary}
              />
              <Text style={styles.checkinLabel}>
                {isCheckedOut
                  ? t('teacher.checkedOutStatus')
                  : isCheckedIn
                    ? t('teacher.checkedInStatus')
                    : t('teacher.notCheckedIn')}
              </Text>
            </View>
            {!checkin ? (
              <Button
                title={t('teacher.checkIn')}
                onPress={handleCheckIn}
                variant="primary"
                size="sm"
                loading={checkInMutation.isPending}
              />
            ) : isCheckedIn ? (
              <Button
                title={t('teacher.checkOut')}
                onPress={handleCheckOut}
                variant="secondary"
                size="sm"
                loading={checkOutMutation.isPending}
              />
            ) : null}
          </View>
        </Card>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statValue}>{data?.todaySessionCount ?? 0}</Text>
            <Text style={styles.statLabel}>{t('teacher.dashboard.sessionsToday')}</Text>
          </Card>
          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statValue}>{data?.todayStudentsSeen ?? 0}</Text>
            <Text style={styles.statLabel}>{t('teacher.dashboard.studentsSeen')}</Text>
          </Card>
          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statValue}>{data?.totalStudents ?? 0}</Text>
            <Text style={styles.statLabel}>{t('dashboard.totalStudents')}</Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
        <View style={styles.actionsRow}>
          <Button
            title={t('teacher.logSession')}
            onPress={() => router.push('/(teacher)/sessions/create')}
            variant="primary"
            size="md"
            icon={<Ionicons name="add-circle-outline" size={20} color={colors.white} />}
            style={styles.actionButton}
          />
          <Button
            title={t('teacher.awardSticker')}
            onPress={() => router.push('/(teacher)/awards')}
            variant="secondary"
            size="md"
            icon={<Ionicons name="star-outline" size={20} color={colors.primary[500]} />}
            style={styles.actionButton}
          />
        </View>

        {/* Student Insights */}
        <Text style={styles.sectionTitle}>{t('teacher.todayOverview')}</Text>
        <View style={styles.actionsRow}>
          <Card
            variant="outlined"
            onPress={() => router.push('/(teacher)/students/top-performers')}
            style={styles.insightCard}
          >
            <Ionicons name="trophy-outline" size={24} color={colors.secondary[500]} />
            <Text style={styles.insightLabel}>{t('teacher.topPerformers')}</Text>
          </Card>
          <Card
            variant="outlined"
            onPress={() => router.push('/(teacher)/students/needs-support')}
            style={styles.insightCard}
          >
            <Ionicons name="hand-left-outline" size={24} color={semantic.warning} />
            <Text style={styles.insightLabel}>{t('teacher.needsSupport')}</Text>
          </Card>
        </View>

        {/* Recent Sessions */}
        <Text style={styles.sectionTitle}>{t('dashboard.recentActivity')}</Text>
        {(data?.recentSessions ?? []).length === 0 ? (
          <Card variant="outlined">
            <Text style={styles.emptyText}>{t('teacher.dashboard.noRecentSessions')}</Text>
          </Card>
        ) : (
          data?.recentSessions.map((session: any) => (
            <Card
              key={session.id}
              variant="outlined"
              onPress={() => router.push(`/(teacher)/sessions/${session.id}`)}
              style={styles.sessionCard}
            >
              <View style={styles.sessionRow}>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionStudentName}>
                    {session.student?.profiles?.full_name ?? t('common.noResults')}
                  </Text>
                  <Text style={styles.sessionDate}>{session.session_date}</Text>
                </View>
                <View style={styles.sessionScores}>
                  {session.memorization_score != null && (
                    <Badge label={`${session.memorization_score}/5`} variant="default" size="sm" />
                  )}
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
  checkinCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  checkinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkinLabel: {
    ...typography.textStyles.body,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.medium,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
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
  },
  actionButton: {
    flex: 1,
  },
  insightCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  insightLabel: {
    ...typography.textStyles.caption,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.medium,
    textAlign: 'center',
  },
  sessionCard: {
    marginBottom: spacing.xs,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionStudentName: {
    ...typography.textStyles.body,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.semiBold,
  },
  sessionDate: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    marginTop: 2,
  },
  sessionScores: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  emptyText: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
    textAlign: 'center',
  },
});
