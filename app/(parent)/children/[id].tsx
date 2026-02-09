import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/feedback';
import { useChildDetail } from '@/features/children/hooks/useChildren';
import { useAttendanceRate } from '@/features/attendance/hooks/useAttendance';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Child Detail Screen ─────────────────────────────────────────────────────

export default function ChildDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading, error, refetch } = useChildDetail(id);
  const { data: attendanceRate } = useAttendanceRate(id);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={(error as Error).message} onRetry={refetch} />;
  if (!data?.student) return <ErrorState description={t('admin.students.notFound')} />;

  const { student, recentSessions, stickerCount } = data;
  const classId = (student as any).classes?.id;

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Button
          title={t('common.back')}
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
        />

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={colors.primary[500]} />
          </View>
          <Text style={styles.name}>{(student as any).profiles?.full_name ?? '—'}</Text>
          <Text style={styles.className}>
            {(student as any).classes?.name ?? t('admin.students.noClass')}
          </Text>
          {(student as any).levels && (
            <Badge
              label={(student as any).levels.title ?? `Level ${(student as any).levels.level_number}`}
              variant="info"
              size="md"
            />
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{student.total_points}</Text>
            <Text style={styles.statLabel}>{t('student.points')}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{student.current_streak}</Text>
            <Text style={styles.statLabel}>{t('student.streak')}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{stickerCount}</Text>
            <Text style={styles.statLabel}>{t('navigation.stickers')}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{attendanceRate?.rate ?? '—'}%</Text>
            <Text style={styles.statLabel}>{t('dashboard.attendanceRate')}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actions}>
          <Button
            title={t('parent.viewAttendance')}
            onPress={() => router.push(`/(parent)/attendance/${id}`)}
            variant="secondary"
            size="md"
            style={styles.actionButton}
          />
          {classId && (
            <Button
              title={t('parent.classStanding')}
              onPress={() => router.push(`/(parent)/class-standing/${id}`)}
              variant="secondary"
              size="md"
              style={styles.actionButton}
            />
          )}
        </View>

        {/* Recent Sessions */}
        <Text style={styles.sectionTitle}>{t('parent.recentSessions')}</Text>
        {!recentSessions || recentSessions.length === 0 ? (
          <Card variant="outlined">
            <Text style={styles.emptyText}>{t('student.sessions.emptyDescription')}</Text>
          </Card>
        ) : (
          recentSessions.map((session: any) => (
            <Card key={session.id} variant="outlined" style={styles.sessionCard}>
              <Text style={styles.sessionDate}>{session.session_date}</Text>
              <View style={styles.scoresRow}>
                <Text style={styles.score}>
                  {t('teacher.sessions.memorization')}: {session.memorization_score}/10
                </Text>
                <Text style={styles.score}>
                  {t('teacher.sessions.tajweed')}: {session.tajweed_score}/10
                </Text>
                <Text style={styles.score}>
                  {t('teacher.sessions.recitation')}: {session.recitation_score}/10
                </Text>
              </View>
              {session.notes && (
                <Text style={styles.sessionNotes}>{session.notes}</Text>
              )}
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
  profileHeader: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
  },
  className: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    backgroundColor: lightTheme.surface,
    borderRadius: 12,
  },
  stat: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.bold,
  },
  statLabel: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
    marginTop: spacing.sm,
  },
  sessionCard: {
    gap: spacing.xs,
  },
  sessionDate: {
    ...typography.textStyles.body,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.medium,
  },
  scoresRow: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  score: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
  },
  sessionNotes: {
    ...typography.textStyles.caption,
    color: lightTheme.textTertiary,
    fontStyle: 'italic',
  },
  emptyText: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
    textAlign: 'center',
  },
});
