import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
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
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

// ─── Parent Dashboard ─────────────────────────────────────────────────────────

export default function ParentDashboard() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const router = useRouter();
  const theme = useRoleTheme();

  const { data: children, isLoading, error, refetch } = useParentDashboard(profile?.id);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={(error as Error).message} onRetry={refetch} />;

  return (
    <Screen scroll hasTabBar>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {t('dashboard.welcome', { name: profile?.full_name?.split(' ')[0] ?? '' })} 👋
          </Text>
          <Text style={styles.subtitle}>{t('parent.dashboard.subtitle')}</Text>
        </View>

        {!children || children.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title={t('parent.children.emptyTitle')}
            description={t('parent.children.emptyDescription')}
          />
        ) : (
          <View style={styles.childrenList}>
            {children.map((child: any) => (
              <Card
                key={child.id}
                variant="default"
                style={styles.childCard}
                onPress={() => router.push(`/(parent)/children/${child.id}`)}
              >
                <View style={styles.childRow}>
                  <Avatar 
                    name={child.profiles?.full_name} 
                    size="md" 
                    ring 
                    variant={theme.tag}
                  />
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>
                      {child.profiles?.full_name ?? '—'}
                    </Text>
                    <Text style={styles.childMeta}>
                      {child.classes?.name ?? t('admin.students.noClass')}
                      {child.levels ? ` · ${child.levels.title}` : ''}
                    </Text>
                  </View>
                  <View style={styles.childStatus}>
                    {child.todayAttendance && (
                      <Badge
                        label={t(`admin.attendance.status.${child.todayAttendance.status}`)}
                        variant={child.todayAttendance.status === 'present' ? 'success' : 'warning'}
                        size="sm"
                      />
                    )}
                    <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} style={{ marginTop: normalize(4) }} />
                  </View>
                </View>

                {child.recentSession && (
                  <View style={[styles.sessionPreview, { backgroundColor: theme.primaryLight }]}>
                    <Ionicons name="book-outline" size={14} color={theme.primary} />
                    <Text style={[styles.sessionLabel, { color: theme.primaryDark }]}>
                      {t('parent.dashboard.lastSession')}:
                    </Text>
                    <Text style={styles.sessionDate}>{child.recentSession.session_date}</Text>
                  </View>
                )}
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
    marginBottom: spacing.sm,
  },
  greeting: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    fontSize: normalize(22),
  },
  subtitle: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
    marginTop: normalize(2),
  },
  childrenList: {
    gap: spacing.md,
  },
  childCard: {
    padding: spacing.md,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[900],
  },
  childMeta: {
    ...typography.textStyles.caption,
    color: colors.neutral[500],
    marginTop: normalize(2),
  },
  childStatus: {
    alignItems: 'flex-end',
  },
  sessionPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: normalize(12),
  },
  sessionLabel: {
    ...typography.textStyles.label,
    fontFamily: typography.fontFamily.semiBold,
  },
  sessionDate: {
    ...typography.textStyles.label,
    color: colors.neutral[600],
  },
});
