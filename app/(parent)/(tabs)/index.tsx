import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useParentDashboard } from '@/features/dashboard/hooks/useParentDashboard';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Parent Dashboard ─────────────────────────────────────────────────────────

export default function ParentDashboard() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const router = useRouter();

  const { data: children, isLoading, error, refetch } = useParentDashboard(profile?.id);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={(error as Error).message} onRetry={refetch} />;

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Text style={styles.greeting}>
          {t('dashboard.welcome', { name: profile?.full_name ?? '' })}
        </Text>
        <Text style={styles.subtitle}>{t('parent.dashboard.subtitle')}</Text>

        {!children || children.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title={t('parent.children.emptyTitle')}
            description={t('parent.children.emptyDescription')}
          />
        ) : (
          children.map((child: any) => (
            <Card
              key={child.id}
              variant="outlined"
              style={styles.childCard}
              onPress={() => router.push(`/(parent)/children/${child.id}`)}
            >
              <View style={styles.childRow}>
                <View style={styles.childAvatar}>
                  <Ionicons name="person" size={28} color={colors.primary[500]} />
                </View>
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
                </View>
              </View>

              {child.recentSession && (
                <View style={styles.sessionPreview}>
                  <Text style={styles.sessionLabel}>{t('parent.dashboard.lastSession')}</Text>
                  <Text style={styles.sessionDate}>{child.recentSession.session_date}</Text>
                </View>
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
  greeting: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
  },
  subtitle: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
  },
  childCard: {
    gap: spacing.sm,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    ...typography.textStyles.body,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.semiBold,
  },
  childMeta: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    marginTop: 2,
  },
  childStatus: {
    alignItems: 'flex-end',
  },
  sessionPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: lightTheme.border,
  },
  sessionLabel: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
  },
  sessionDate: {
    ...typography.textStyles.caption,
    color: lightTheme.text,
  },
});
