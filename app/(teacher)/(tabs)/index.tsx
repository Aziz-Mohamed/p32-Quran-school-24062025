import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
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
import { useRoleTheme } from '@/hooks/useRoleTheme';
import { typography } from '@/theme/typography';
import { lightTheme, colors, semantic } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Teacher Dashboard ────────────────────────────────────────────────────────

export default function TeacherDashboard() {
  const { t } = useTranslation();
  const { profile, schoolId } = useAuth();
  const router = useRouter();
  const theme = useRoleTheme();

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
    <Screen scroll hasTabBar>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>
              {t('dashboard.welcome', { name: profile?.full_name?.split(' ')[0] ?? '' })} 👋
            </Text>
            <Text style={styles.subtitle}>{t('teacher.dashboard.readyToTeach')}</Text>
          </View>
          <Badge label={t('roles.teacher')} variant={theme.tag} size="md" />
        </View>

        {/* Check-in / Check-out */}
        <Card variant={isCheckedIn ? "primary-glow" : "default"} style={styles.checkinCard}>
          <View style={styles.checkinRow}>
            <View style={styles.checkinInfo}>
              <View style={[
                styles.checkinIcon, 
                { backgroundColor: isCheckedIn ? theme.primaryLight : colors.neutral[100] }
              ]}>
                <Ionicons
                  name={isCheckedOut ? 'checkmark-circle' : isCheckedIn ? 'time' : 'log-in'}
                  size={24}
                  color={isCheckedOut ? semantic.success : isCheckedIn ? theme.primary : colors.neutral[400]}
                />
              </View>
              <View>
                <Text style={styles.checkinLabel}>
                  {isCheckedOut
                    ? t('teacher.checkedOutStatus')
                    : isCheckedIn
                      ? t('teacher.checkedInStatus')
                      : t('teacher.notCheckedIn')}
                </Text>
                {isCheckedIn && (
                  <Text style={styles.checkinTime}>
                    {t('teacher.since')}: {new Date(checkin.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                )}
              </View>
            </View>
            {!checkin ? (
              <Button
                title={t('teacher.checkIn')}
                onPress={handleCheckIn}
                variant={theme.tag}
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
          <Card variant="default" style={styles.statCard}>
            <Text style={[styles.statValue, { color: theme.primary }]}>{data?.todaySessionCount ?? 0}</Text>
            <Text style={styles.statLabel}>{t('teacher.dashboard.sessionsToday')}</Text>
          </Card>
          <Card variant="default" style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.accent.sky[500] }]}>{data?.todayStudentsSeen ?? 0}</Text>
            <Text style={styles.statLabel}>{t('teacher.dashboard.studentsSeen')}</Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
        <View style={styles.actionsRow}>
          <Button
            title={t('teacher.logSession')}
            onPress={() => router.push('/(teacher)/sessions/create')}
            variant={theme.tag}
            size="md"
            icon={<Ionicons name="add-circle" size={20} color={colors.white} />}
            style={styles.actionButton}
          />
          <Button
            title={t('teacher.awardSticker')}
            onPress={() => router.push('/(teacher)/awards')}
            variant="ghost"
            size="md"
            icon={<Ionicons name="star" size={20} color={colors.secondary[500]} />}
            style={[styles.actionButton, { backgroundColor: colors.secondary[50] }]}
          />
        </View>

        {/* Student Insights */}
        <Text style={styles.sectionTitle}>{t('teacher.todayOverview')}</Text>
        <View style={styles.actionsRow}>
          <Card
            variant="glass"
            onPress={() => router.push('/(teacher)/students/top-performers')}
            style={styles.insightCard}
          >
            <View style={[styles.insightIcon, { backgroundColor: colors.secondary[50] }]}>
              <Ionicons name="trophy" size={22} color={colors.secondary[500]} />
            </View>
            <Text style={styles.insightLabel}>{t('teacher.topPerformers')}</Text>
          </Card>
          <Card
            variant="glass"
            onPress={() => router.push('/(teacher)/students/needs-support')}
            style={styles.insightCard}
          >
            <View style={[styles.insightIcon, { backgroundColor: colors.accent.rose[50] }]}>
              <Ionicons name="hand-left-outline" size={22} color={semantic.warning} />
            </View>
            <Text style={styles.insightLabel}>{t('teacher.needsSupport')}</Text>
          </Card>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('dashboard.recentActivity')}</Text>
          <Badge label={String(data?.totalStudents ?? 0)} variant="sky" />
        </View>
        {(data?.recentSessions ?? []).length === 0 ? (
          <Card variant="outlined" style={styles.emptyCard}>
            <Text style={styles.emptyText}>{t('teacher.dashboard.noRecentSessions')}</Text>
          </Card>
        ) : (
          data?.recentSessions.map((session: any) => (
            <Card
              key={session.id}
              variant="default"
              onPress={() => router.push(`/(teacher)/sessions/${session.id}`)}
              style={styles.sessionCard}
            >
              <View style={styles.sessionRow}>
                <View style={[styles.sessionAvatar, { backgroundColor: colors.neutral[100] }]}>
                  <Text style={styles.avatarText}>
                    {session.student?.profiles?.full_name?.[0]?.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionStudentName} numberOfLines={1}>
                    {session.student?.profiles?.full_name ?? t('common.noResults')}
                  </Text>
                  <Text style={styles.sessionDate}>{session.session_date}</Text>
                </View>
                <View style={styles.sessionScores}>
                  {session.memorization_score != null && (
                    <Badge 
                      label={`${session.memorization_score}/5`} 
                      variant={session.memorization_score >= 4 ? "success" : "warning"} 
                      size="sm" 
                    />
                  )}
                  <Ionicons name="chevron-forward" size={18} color={colors.neutral[300]} />
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
  checkinCard: {
    padding: spacing.md,
  },
  checkinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkinIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkinLabel: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[900],
  },
  checkinTime: {
    ...typography.textStyles.label,
    color: colors.neutral[500],
    marginTop: 2,
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
  insightCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  insightIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightLabel: {
    ...typography.textStyles.label,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  sessionCard: {
    padding: spacing.md,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sessionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[600],
  },
  sessionInfo: {
    flex: 1,
  },
  sessionStudentName: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[900],
  },
  sessionDate: {
    ...typography.textStyles.label,
    color: colors.neutral[500],
    marginTop: 2,
  },
  sessionScores: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
});
