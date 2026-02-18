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
import { useTeacherUpcomingSessions } from '@/features/scheduling/hooks/useScheduledSessions';
import { typography } from '@/theme/typography';
import { lightTheme, colors, semantic } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

const STATUS_COLORS: Record<string, string> = {
  scheduled: colors.accent.sky[500],
  in_progress: semantic.warning,
  completed: semantic.success,
  cancelled: colors.neutral[400],
  missed: semantic.error,
};

// ─── Teacher Schedule ────────────────────────────────────────────────────────

export default function TeacherScheduleScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, schoolId } = useAuth();

  const { data: sessions = [], isLoading, error, refetch } =
    useTeacherUpcomingSessions(profile?.id, schoolId ?? undefined);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;

  // Group sessions by date
  const grouped = new Map<string, any[]>();
  for (const session of sessions) {
    const date = session.session_date;
    if (!grouped.has(date)) grouped.set(date, []);
    grouped.get(date)!.push(session);
  }

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Button
          title={t('common.back')}
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
        />

        <Text style={styles.title}>{t('scheduling.mySchedule')}</Text>
        <Text style={styles.subtitle}>{t('scheduling.upcomingSessions')}</Text>

        {sessions.length === 0 ? (
          <Card variant="outlined" style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={40} color={colors.neutral[300]} />
            <Text style={styles.emptyText}>{t('scheduling.noUpcomingSessions')}</Text>
          </Card>
        ) : (
          Array.from(grouped.entries()).map(([date, daySessions]) => (
            <View key={date}>
              <Text style={styles.dateHeader}>
                {new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              {daySessions.map((session: any) => (
                <Card
                  key={session.id}
                  variant="default"
                  style={styles.sessionCard}
                  onPress={() => router.push(`/(teacher)/schedule/${session.id}`)}
                >
                  <View style={styles.sessionRow}>
                    <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[session.status] ?? colors.neutral[400] }]} />
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionTitle}>
                        {session.class?.name ?? t('scheduling.individualSession')}
                      </Text>
                      <Text style={styles.sessionTime}>
                        {session.start_time?.slice(0, 5)} – {session.end_time?.slice(0, 5)}
                      </Text>
                      {session.student?.profiles?.full_name && (
                        <Text style={styles.studentName}>
                          {session.student.profiles.full_name}
                        </Text>
                      )}
                    </View>
                    <Badge
                      label={t(`scheduling.status.${session.status}`)}
                      variant={session.status === 'scheduled' ? 'sky' : session.status === 'in_progress' ? 'warning' : 'success'}
                      size="sm"
                    />
                    <Ionicons name="chevron-forward" size={18} color={colors.neutral[300]} />
                  </View>
                </Card>
              ))}
            </View>
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
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
  },
  subtitle: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
  },
  dateHeader: {
    ...typography.textStyles.subheading,
    color: colors.neutral[700],
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sessionCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusDot: {
    width: normalize(10),
    height: normalize(10),
    borderRadius: normalize(5),
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[900],
  },
  sessionTime: {
    ...typography.textStyles.label,
    color: colors.neutral[500],
    marginTop: normalize(2),
  },
  studentName: {
    ...typography.textStyles.label,
    color: colors.accent.indigo[500],
    marginTop: normalize(2),
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    borderStyle: 'dashed',
    gap: spacing.md,
  },
  emptyText: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
    textAlign: 'center',
  },
});
