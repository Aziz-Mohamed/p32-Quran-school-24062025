import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import {
  useSchoolAttendanceToday,
  useSchoolTeachers,
  usePendingOverrides,
  useApproveOverride,
  useRejectOverride,
} from '@/features/work-attendance/hooks/useTeacherAttendance';
import { typography } from '@/theme/typography';
import { lightTheme, colors, semantic } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

// ─── Teacher Attendance Monitor ──────────────────────────────────────────────

export default function TeacherAttendanceMonitor() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, schoolId } = useAuth();

  const { data: checkins = [], isLoading: checkinsLoading, error: checkinsError, refetch } =
    useSchoolAttendanceToday(schoolId ?? undefined);
  const { data: teachers = [], isLoading: teachersLoading } =
    useSchoolTeachers(schoolId ?? undefined);
  const { data: overrides = [] } = usePendingOverrides(schoolId ?? undefined);

  const approveMutation = useApproveOverride();
  const rejectMutation = useRejectOverride();

  const isLoading = checkinsLoading || teachersLoading;

  // Compute who's checked in, who's missing
  const { checkedIn, missing } = useMemo(() => {
    const checkedInIds = new Set(checkins.map((c: any) => c.teacher_id));
    const checkedInList = checkins;
    const missingList = teachers.filter((t: any) => !checkedInIds.has(t.id));
    return { checkedIn: checkedInList, missing: missingList };
  }, [checkins, teachers]);

  const handleApprove = (checkinId: string) => {
    if (!profile?.id) return;
    Alert.alert(
      t('admin.workAttendance.approveTitle'),
      t('admin.workAttendance.approveMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: () => approveMutation.mutate({ checkinId, adminId: profile.id }),
        },
      ],
    );
  };

  const handleReject = (checkinId: string) => {
    Alert.alert(
      t('admin.workAttendance.rejectTitle'),
      t('admin.workAttendance.rejectMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => rejectMutation.mutate(checkinId),
        },
      ],
    );
  };

  if (isLoading) return <LoadingState />;
  if (checkinsError) return <ErrorState description={checkinsError.message} onRetry={refetch} />;

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Button
          title={t('common.back')}
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
        />

        <Text style={styles.title}>{t('admin.workAttendance.title')}</Text>
        <Text style={styles.subtitle}>{t('admin.workAttendance.subtitle')}</Text>

        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <Card variant="default" style={styles.statCard}>
            <Text style={[styles.statValue, { color: semantic.success }]}>{checkedIn.length}</Text>
            <Text style={styles.statLabel}>{t('admin.workAttendance.present')}</Text>
          </Card>
          <Card variant="default" style={styles.statCard}>
            <Text style={[styles.statValue, { color: semantic.error }]}>{missing.length}</Text>
            <Text style={styles.statLabel}>{t('admin.workAttendance.absent')}</Text>
          </Card>
          <Card variant="default" style={styles.statCard}>
            <Text style={[styles.statValue, { color: semantic.warning }]}>{overrides.length}</Text>
            <Text style={styles.statLabel}>{t('admin.workAttendance.pendingOverrides')}</Text>
          </Card>
        </View>

        {/* Pending Overrides */}
        {overrides.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('admin.workAttendance.overrideRequests')}</Text>
              <Badge label={String(overrides.length)} variant="warning" size="sm" />
            </View>
            {overrides.map((override: any) => (
              <Card key={override.id} variant="outlined" style={styles.overrideCard}>
                <View style={styles.overrideRow}>
                  <View style={[styles.avatar, { backgroundColor: colors.accent.rose[50] }]}>
                    <Text style={styles.avatarText}>
                      {override.teacher?.full_name?.[0]?.toUpperCase() ?? '?'}
                    </Text>
                  </View>
                  <View style={styles.overrideInfo}>
                    <Text style={styles.teacherName}>
                      {override.teacher?.full_name ?? t('common.noResults')}
                    </Text>
                    <Text style={styles.overrideReason} numberOfLines={2}>
                      {override.override_reason}
                    </Text>
                    {override.checkin_distance_meters != null && (
                      <Text style={styles.distanceText}>
                        {Math.round(override.checkin_distance_meters)}m {t('workAttendance.fromSchool')}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.overrideActions}>
                  <Button
                    title={t('admin.workAttendance.reject')}
                    onPress={() => handleReject(override.id)}
                    variant="ghost"
                    size="sm"
                    loading={rejectMutation.isPending}
                  />
                  <Button
                    title={t('admin.workAttendance.approve')}
                    onPress={() => handleApprove(override.id)}
                    variant="primary"
                    size="sm"
                    loading={approveMutation.isPending}
                  />
                </View>
              </Card>
            ))}
          </>
        )}

        {/* Checked-In Teachers */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('admin.workAttendance.checkedInTeachers')}</Text>
          <Badge label={String(checkedIn.length)} variant="success" size="sm" />
        </View>
        {checkedIn.length === 0 ? (
          <Card variant="outlined" style={styles.emptyCard}>
            <Text style={styles.emptyText}>{t('admin.workAttendance.noCheckins')}</Text>
          </Card>
        ) : (
          checkedIn.map((checkin: any) => (
            <Card key={checkin.id} variant="default" style={styles.teacherCard}>
              <View style={styles.teacherRow}>
                <View style={[styles.avatar, { backgroundColor: colors.primary[50] }]}>
                  <Text style={[styles.avatarText, { color: colors.primary[700] }]}>
                    {checkin.teacher?.full_name?.[0]?.toUpperCase() ?? '?'}
                  </Text>
                </View>
                <View style={styles.teacherInfo}>
                  <Text style={styles.teacherName}>
                    {checkin.teacher?.full_name ?? t('common.noResults')}
                  </Text>
                  <Text style={styles.checkinTime}>
                    {new Date(checkin.checked_in_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {checkin.checked_out_at && (
                      <Text>
                        {' → '}
                        {new Date(checkin.checked_out_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    )}
                  </Text>
                </View>
                <View style={styles.verificationStatus}>
                  {checkin.is_verified ? (
                    <Badge label={t('admin.workAttendance.verified')} variant="success" size="sm" />
                  ) : checkin.override_reason ? (
                    <Badge label={t('admin.workAttendance.pendingLabel')} variant="warning" size="sm" />
                  ) : (
                    <Badge label={t('admin.workAttendance.unverified')} variant="default" size="sm" />
                  )}
                </View>
              </View>
            </Card>
          ))
        )}

        {/* Missing Teachers */}
        {missing.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('admin.workAttendance.missingTeachers')}</Text>
              <Badge label={String(missing.length)} variant="error" size="sm" />
            </View>
            {missing.map((teacher: any) => (
              <Card key={teacher.id} variant="default" style={styles.teacherCard}>
                <View style={styles.teacherRow}>
                  <View style={[styles.avatar, { backgroundColor: colors.neutral[100] }]}>
                    <Text style={styles.avatarText}>
                      {teacher.full_name?.[0]?.toUpperCase() ?? '?'}
                    </Text>
                  </View>
                  <View style={styles.teacherInfo}>
                    <Text style={styles.teacherName}>{teacher.full_name}</Text>
                    <Text style={styles.missingLabel}>{t('admin.workAttendance.notCheckedInYet')}</Text>
                  </View>
                </View>
              </Card>
            ))}
          </>
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
    fontSize: normalize(24),
  },
  statLabel: {
    ...typography.textStyles.label,
    color: colors.neutral[500],
    marginTop: spacing.xs,
    textAlign: 'center',
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
  teacherCard: {
    padding: spacing.md,
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[600],
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[900],
  },
  checkinTime: {
    ...typography.textStyles.label,
    color: colors.neutral[500],
    marginTop: normalize(2),
  },
  verificationStatus: {
    alignItems: 'flex-end',
  },
  missingLabel: {
    ...typography.textStyles.label,
    color: colors.accent.rose[500],
    marginTop: normalize(2),
  },
  overrideCard: {
    padding: spacing.md,
    borderColor: semantic.warning,
    gap: spacing.md,
  },
  overrideRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  overrideInfo: {
    flex: 1,
  },
  overrideReason: {
    ...typography.textStyles.body,
    color: colors.neutral[600],
    marginTop: normalize(4),
  },
  distanceText: {
    ...typography.textStyles.label,
    color: colors.neutral[400],
    marginTop: normalize(2),
  },
  overrideActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
