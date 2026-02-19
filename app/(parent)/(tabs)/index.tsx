import React from 'react';
import { I18nManager, StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge, Avatar } from '@/components/ui';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useParentDashboard } from '@/features/dashboard/hooks/useParentDashboard';
import { useRoleTheme } from '@/hooks/useRoleTheme';
import { typography } from '@/theme/typography';
import { lightTheme, colors, semantic } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';
import type { ChildQuickStatus } from '@/features/dashboard/types/dashboard.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ATTENDANCE_BADGE_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  present: 'success',
  late: 'warning',
  absent: 'error',
  excused: 'info',
};

function formatRate(rate: number): string {
  return rate >= 0 ? `${rate}%` : 'N/A';
}

// ─── Parent Dashboard ─────────────────────────────────────────────────────────

export default function ParentDashboard() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const router = useRouter();
  const theme = useRoleTheme();

  const { data, isLoading, error, refetch } = useParentDashboard(profile?.id);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={(error as Error).message} onRetry={refetch} />;

  const children = data?.children ?? [];
  const stats = data?.aggregateStats;
  const recentSessions = data?.recentSessions ?? [];

  if (children.length === 0) {
    return (
      <Screen scroll hasTabBar>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.greeting}>
                {t('dashboard.welcome', { name: profile?.full_name?.split(' ')[0] ?? '' })} 👋
              </Text>
              <Text style={styles.subtitle}>{t('parent.dashboard.subtitle')}</Text>
            </View>
            <Badge label={t('roles.parent')} variant={theme.tag} size="md" />
          </View>
          <EmptyState
            icon="people-outline"
            title={t('parent.children.emptyTitle')}
            description={t('parent.children.emptyDescription')}
          />
        </View>
      </Screen>
    );
  }

  const absentChildren = children.filter((c) => c.todayStatus === 'absent');

  return (
    <Screen scroll hasTabBar>
      <View style={styles.container}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>
              {t('dashboard.welcome', { name: profile?.full_name?.split(' ')[0] ?? '' })} 👋
            </Text>
            <Text style={styles.subtitle}>{t('parent.dashboard.subtitle')}</Text>
          </View>
          <Badge label={t('roles.parent')} variant={theme.tag} size="md" />
        </View>

        {/* ── Today at a Glance ── */}
        <Card variant="primary-glow" style={styles.glanceCard}>
          <Text style={styles.glanceTitle}>{t('parent.dashboard.todayAtAGlance')}</Text>
          <View style={styles.glancePills}>
            <View style={styles.pill}>
              <Ionicons name="checkmark-circle" size={16} color={semantic.success} />
              <Text style={[styles.pillText, { color: semantic.success }]}>
                {stats?.presentToday ?? 0} {t('parent.dashboard.present')}
              </Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name="close-circle" size={16} color={semantic.error} />
              <Text style={[styles.pillText, { color: semantic.error }]}>
                {stats?.absentToday ?? 0} {t('parent.dashboard.absent')}
              </Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name="time-outline" size={16} color={colors.neutral[400]} />
              <Text style={[styles.pillText, { color: colors.neutral[500] }]}>
                {stats?.notMarkedToday ?? 0} {t('parent.dashboard.notMarked')}
              </Text>
            </View>
          </View>
          {absentChildren.length > 0 ? (
            <View style={styles.alertRow}>
              <Ionicons name="alert-circle" size={14} color={semantic.error} />
              <Text style={styles.alertText}>
                {absentChildren.map((c) => t('parent.dashboard.absentAlert', { name: c.name.split(' ')[0] })).join(' · ')}
              </Text>
            </View>
          ) : stats?.presentToday && stats.presentToday > 0 ? (
            <View style={styles.alertRow}>
              <Ionicons name="checkmark-done" size={14} color={semantic.success} />
              <Text style={[styles.alertText, { color: semantic.success }]}>
                {t('parent.dashboard.allPresent')}
              </Text>
            </View>
          ) : null}
        </Card>

        {/* ── Stats Grid ── */}
        <View style={styles.statsGrid}>
          <Card variant="default" style={styles.statCard}>
            <Text style={[styles.statValue, { color: semantic.success }]}>
              {formatRate(stats?.averageAttendanceRate ?? -1)}
            </Text>
            <Text style={styles.statLabel}>{t('parent.dashboard.averageAttendance')}</Text>
          </Card>
          <Card variant="default" style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.gamification.gold }]}>
              {(stats?.totalPoints ?? 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>{t('parent.dashboard.totalPoints')}</Text>
          </Card>
          <Card variant="default" style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.accent.violet[500] }]}>
              {stats?.totalStickers ?? 0}
            </Text>
            <Text style={styles.statLabel}>{t('parent.dashboard.totalStickers')}</Text>
          </Card>
          <Card variant="default" style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.accent.rose[500] }]}>
              {stats?.totalStreakDays ?? 0}
            </Text>
            <Text style={styles.statLabel}>{t('parent.dashboard.activeStreaks')}</Text>
          </Card>
        </View>

        {/* ── Children Quick Status ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('parent.dashboard.childrenStatus')}</Text>
          <Badge label={String(children.length)} variant={theme.tag} />
        </View>
        <View style={styles.childrenList}>
          {children.map((child) => (
            <ChildStatusRow
              key={child.id}
              child={child}
              theme={theme}
              onPress={() => router.push(`/(parent)/children/${child.id}`)}
            />
          ))}
        </View>

        {/* ── Recent Activity ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('dashboard.recentActivity')}</Text>
          <Badge label={String(recentSessions.length)} variant="sky" />
        </View>
        {recentSessions.length === 0 ? (
          <Card variant="outlined" style={styles.emptyCard}>
            <Text style={styles.emptyText}>{t('parent.dashboard.noRecentSessions')}</Text>
          </Card>
        ) : (
          recentSessions.map((session) => (
            <Card key={session.id} variant="default" style={styles.sessionCard}>
              <View style={styles.sessionRow}>
                <View style={[styles.sessionAvatar, { backgroundColor: colors.neutral[100] }]}>
                  <Text style={styles.avatarText}>
                    {session.childName?.[0]?.toUpperCase() ?? '?'}
                  </Text>
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionName} numberOfLines={1}>
                    {session.childName}
                  </Text>
                  <Text style={styles.sessionDate}>{session.sessionDate}</Text>
                </View>
                <View style={styles.sessionScores}>
                  {session.memorizationScore != null && (
                    <Badge
                      label={`${session.memorizationScore}/5`}
                      variant={session.memorizationScore >= 4 ? 'success' : 'warning'}
                      size="sm"
                    />
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

// ─── Child Status Row ─────────────────────────────────────────────────────────

function ChildStatusRow({
  child,
  theme,
  onPress,
}: {
  child: ChildQuickStatus;
  theme: ReturnType<typeof useRoleTheme>;
  onPress: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Card variant="default" style={styles.childCard} onPress={onPress}>
      <View style={styles.childRow}>
        <Avatar name={child.name} size="sm" ring variant={theme.tag} />
        <View style={styles.childInfo}>
          <Text style={styles.childName} numberOfLines={1}>{child.name}</Text>
          <Text style={styles.childMeta} numberOfLines={1}>
            {child.className ?? '—'}
            {child.levelTitle ? ` · ${child.levelTitle}` : ''}
          </Text>
        </View>
        <View style={styles.childBadges}>
          {child.todayStatus ? (
            <Badge
              label={t(`admin.attendance.status.${child.todayStatus}`)}
              variant={ATTENDANCE_BADGE_VARIANT[child.todayStatus] ?? 'default'}
              size="sm"
            />
          ) : (
            <Badge label="—" variant="default" size="sm" />
          )}
          <Text style={styles.rateText}>{formatRate(child.attendanceRate)}</Text>
        </View>
        <Ionicons name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"} size={18} color={colors.neutral[300]} />
      </View>
    </Card>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },

  // Header
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

  // Today at a Glance
  glanceCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  glanceTitle: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
  },
  glancePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  pillText: {
    ...typography.textStyles.label,
    fontFamily: typography.fontFamily.semiBold,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    marginTop: normalize(2),
  },
  alertText: {
    ...typography.textStyles.label,
    color: semantic.error,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    width: '48%' as any,
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
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

  // Section headers
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

  // Children quick status
  childrenList: {
    gap: spacing.sm,
  },
  childCard: {
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  childInfo: {
    flex: 1,
    minWidth: 0,
  },
  childName: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[900],
  },
  childMeta: {
    ...typography.textStyles.caption,
    color: colors.neutral[500],
    marginTop: normalize(1),
  },
  childBadges: {
    alignItems: 'flex-end',
    gap: normalize(2),
  },
  rateText: {
    ...typography.textStyles.caption,
    color: colors.neutral[500],
    fontFamily: typography.fontFamily.semiBold,
  },

  // Recent Activity
  sessionCard: {
    padding: spacing.md,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sessionAvatar: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
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
  sessionName: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[900],
  },
  sessionDate: {
    ...typography.textStyles.label,
    color: colors.neutral[500],
    marginTop: normalize(2),
  },
  sessionScores: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  // Empty
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
