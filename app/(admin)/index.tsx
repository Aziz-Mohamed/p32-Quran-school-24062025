import React, { useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useAdminDashboard } from '@/features/dashboard/hooks/useAdminDashboard';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const router = useRouter();
  const { logout, isPending: isLoggingOut } = useLogout();

  const { data, isLoading, error, refetch } = useAdminDashboard(profile?.school_id);

  const handleSignOut = useCallback(() => {
    logout();
  }, [logout]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Text style={styles.greeting}>
          {t('dashboard.welcome', { name: profile?.full_name ?? '' })}
        </Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statValue}>{data?.totalStudents ?? 0}</Text>
            <Text style={styles.statLabel}>{t('admin.dashboard.totalStudents')}</Text>
          </Card>
          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statValue}>{data?.totalTeachers ?? 0}</Text>
            <Text style={styles.statLabel}>{t('admin.dashboard.totalTeachers')}</Text>
          </Card>
          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statValue}>{data?.totalClasses ?? 0}</Text>
            <Text style={styles.statLabel}>{t('admin.dashboard.totalClasses')}</Text>
          </Card>
          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statValue}>{data?.todayAttendanceRate ?? 0}%</Text>
            <Text style={styles.statLabel}>{t('admin.dashboard.attendanceRate')}</Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
        <View style={styles.actionsRow}>
          <Button
            title={t('admin.addStudent')}
            onPress={() => router.push('/(admin)/students/create')}
            variant="secondary"
            size="sm"
            icon={<Ionicons name="person-add-outline" size={18} color={colors.primary[500]} />}
            style={styles.actionButton}
          />
          <Button
            title={t('admin.addTeacher')}
            onPress={() => router.push('/(admin)/teachers/create')}
            variant="secondary"
            size="sm"
            icon={<Ionicons name="school-outline" size={18} color={colors.primary[500]} />}
            style={styles.actionButton}
          />
          <Button
            title={t('admin.addClass')}
            onPress={() => router.push('/(admin)/classes/create')}
            variant="secondary"
            size="sm"
            icon={<Ionicons name="albums-outline" size={18} color={colors.primary[500]} />}
            style={styles.actionButton}
          />
        </View>
        <View style={styles.actionsRow}>
          <Button
            title={t('admin.bulkAttendance')}
            onPress={() => router.push('/(admin)/attendance')}
            variant="secondary"
            size="sm"
            icon={<Ionicons name="checkmark-done-outline" size={18} color={colors.primary[500]} />}
            style={styles.actionButton}
          />
          <Button
            title={t('admin.dashboard.resetPassword')}
            onPress={() => router.push('/(admin)/members/reset-password')}
            variant="secondary"
            size="sm"
            icon={<Ionicons name="key-outline" size={18} color={colors.primary[500]} />}
            style={styles.actionButton}
          />
        </View>

        {/* Navigation */}
        <Text style={styles.sectionTitle}>{t('admin.dashboard.manage')}</Text>
        <Card variant="outlined" style={styles.navCard} onPress={() => router.push('/(admin)/students')}>
          <View style={styles.navRow}>
            <Ionicons name="people-outline" size={24} color={colors.primary[500]} />
            <Text style={styles.navText}>{t('admin.students.title')}</Text>
            <Ionicons name="chevron-forward" size={20} color={lightTheme.textTertiary} />
          </View>
        </Card>
        <Card variant="outlined" style={styles.navCard} onPress={() => router.push('/(admin)/teachers')}>
          <View style={styles.navRow}>
            <Ionicons name="school-outline" size={24} color={colors.primary[500]} />
            <Text style={styles.navText}>{t('admin.teachers.title')}</Text>
            <Ionicons name="chevron-forward" size={20} color={lightTheme.textTertiary} />
          </View>
        </Card>
        <Card variant="outlined" style={styles.navCard} onPress={() => router.push('/(admin)/classes')}>
          <View style={styles.navRow}>
            <Ionicons name="albums-outline" size={24} color={colors.primary[500]} />
            <Text style={styles.navText}>{t('admin.classes.title')}</Text>
            <Ionicons name="chevron-forward" size={20} color={lightTheme.textTertiary} />
          </View>
        </Card>
        <Card variant="outlined" style={styles.navCard} onPress={() => router.push('/(admin)/stickers')}>
          <View style={styles.navRow}>
            <Ionicons name="star-outline" size={24} color={colors.primary[500]} />
            <Text style={styles.navText}>{t('admin.stickers.title')}</Text>
            <Ionicons name="chevron-forward" size={20} color={lightTheme.textTertiary} />
          </View>
        </Card>
        <Card variant="outlined" style={styles.navCard} onPress={() => router.push('/(admin)/reports')}>
          <View style={styles.navRow}>
            <Ionicons name="bar-chart-outline" size={24} color={colors.primary[500]} />
            <Text style={styles.navText}>{t('reports.title')}</Text>
            <Ionicons name="chevron-forward" size={20} color={lightTheme.textTertiary} />
          </View>
        </Card>

        {/* Sign Out */}
        <Button
          title={t('common.signOut')}
          onPress={handleSignOut}
          variant="ghost"
          size="md"
          disabled={isLoggingOut}
        />
      </View>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  greeting: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    marginBottom: spacing.sm,
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
  navCard: {
    marginBottom: spacing.xs,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  navText: {
    ...typography.textStyles.body,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.medium,
    flex: 1,
  },
});
