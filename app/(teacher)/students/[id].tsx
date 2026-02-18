import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useStudentById } from '@/features/students/hooks/useStudents';
import { useSessions } from '@/features/sessions/hooks/useSessions';
import { useStudentStickers } from '@/features/gamification/hooks/useStickers';
import { useAttendanceRate } from '@/features/attendance/hooks/useAttendance';
import { typography } from '@/theme/typography';
import { lightTheme, colors, semantic } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Teacher Student Detail Screen ──────────────────────────────────────────

export default function TeacherStudentDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();

  const { data: student, isLoading: studentLoading, error: studentError, refetch } = useStudentById(id);
  const { data: sessions = [] } = useSessions({
    studentId: id,
    teacherId: profile?.id,
    pageSize: 10,
  });
  const { data: stickers = [] } = useStudentStickers(id);
  const { data: attendanceData } = useAttendanceRate(id);

  if (studentLoading) return <LoadingState />;
  if (studentError) return <ErrorState description={(studentError as Error).message} onRetry={refetch} />;
  if (!student) return null;

  const studentProfile = (student as any).profiles;
  const studentClass = (student as any).classes;
  const studentLevel = (student as any).levels;
  const attendanceRate = attendanceData?.rate ?? 0;

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Button
          title={t('common.back')}
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
        />

        {/* Student Header */}
        <View style={styles.headerSection}>
          <Text style={styles.studentName}>{studentProfile?.full_name ?? '—'}</Text>
          <View style={styles.metaRow}>
            {studentClass?.name && (
              <Badge label={studentClass.name} variant="info" size="sm" />
            )}
            {studentLevel?.title && (
              <Badge label={studentLevel.title} variant="default" size="sm" />
            )}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statValue}>{student.total_points ?? 0}</Text>
            <Text style={styles.statLabel}>{t('student.points')}</Text>
          </Card>
          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statValue}>{student.current_streak ?? 0}</Text>
            <Text style={styles.statLabel}>{t('student.streak')}</Text>
          </Card>
          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statValue}>{stickers.length}</Text>
            <Text style={styles.statLabel}>{t('navigation.stickers')}</Text>
          </Card>
          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statValue}>{Math.round(attendanceRate)}%</Text>
            <Text style={styles.statLabel}>{t('navigation.attendance')}</Text>
          </Card>
        </View>

        {/* Recent Sessions */}
        <Text style={styles.sectionTitle}>{t('teacher.insights.recentSessions')}</Text>
        {sessions.length === 0 ? (
          <Card variant="outlined">
            <Text style={styles.emptyText}>{t('teacher.dashboard.noRecentSessions')}</Text>
          </Card>
        ) : (
          sessions.map((session: any) => (
            <Card key={session.id} variant="outlined" style={styles.sessionCard}>
              <View style={styles.sessionRow}>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionDate}>{session.session_date}</Text>
                </View>
                <View style={styles.scoresRow}>
                  {session.memorization_score != null && (
                    <View style={styles.scoreItem}>
                      <Text style={styles.scoreLabel}>{t('teacher.sessions.memorization')}</Text>
                      <Text style={styles.scoreValue}>{session.memorization_score}/5</Text>
                    </View>
                  )}
                  {session.tajweed_score != null && (
                    <View style={styles.scoreItem}>
                      <Text style={styles.scoreLabel}>{t('teacher.sessions.tajweed')}</Text>
                      <Text style={styles.scoreValue}>{session.tajweed_score}/5</Text>
                    </View>
                  )}
                  {session.recitation_quality != null && (
                    <View style={styles.scoreItem}>
                      <Text style={styles.scoreLabel}>{t('teacher.sessions.recitation')}</Text>
                      <Text style={styles.scoreValue}>{session.recitation_quality}/5</Text>
                    </View>
                  )}
                </View>
              </View>
            </Card>
          ))
        )}

        {/* Sticker History */}
        <Text style={styles.sectionTitle}>{t('teacher.insights.stickerHistory')}</Text>
        {stickers.length === 0 ? (
          <Card variant="outlined">
            <Text style={styles.emptyText}>{t('student.stickers.emptyDescription')}</Text>
          </Card>
        ) : (
          stickers.slice(0, 5).map((sticker: any) => (
            <Card key={sticker.id} variant="outlined" style={styles.stickerCard}>
              <View style={styles.stickerRow}>
                <View style={styles.stickerInfo}>
                  <Text style={styles.stickerName}>
                    {sticker.stickers?.name ?? '—'}
                  </Text>
                  {sticker.reason && (
                    <Text style={styles.stickerReason}>{sticker.reason}</Text>
                  )}
                </View>
                <Text style={styles.stickerPoints}>
                  +{sticker.stickers?.points_value ?? 0}
                </Text>
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
  headerSection: {
    gap: spacing.sm,
  },
  studentName: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  statValue: {
    ...typography.textStyles.subheading,
    color: colors.primary[500],
    fontSize: typography.fontSize.xl,
  },
  statLabel: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
    marginTop: spacing.sm,
  },
  sessionCard: {
    marginBottom: spacing.xs,
  },
  sessionRow: {
    gap: spacing.sm,
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionDate: {
    ...typography.textStyles.body,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.medium,
  },
  scoresRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
  },
  scoreValue: {
    ...typography.textStyles.body,
    color: colors.primary[500],
    fontFamily: typography.fontFamily.semiBold,
  },
  stickerCard: {
    marginBottom: spacing.xs,
  },
  stickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stickerInfo: {
    flex: 1,
  },
  stickerName: {
    ...typography.textStyles.body,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.semiBold,
  },
  stickerReason: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    marginTop: 2,
  },
  stickerPoints: {
    ...typography.textStyles.body,
    color: colors.secondary[500],
    fontFamily: typography.fontFamily.semiBold,
  },
  emptyText: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
    textAlign: 'center',
  },
});
