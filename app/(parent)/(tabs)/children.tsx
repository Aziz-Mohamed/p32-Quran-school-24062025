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
import { useChildren } from '@/features/children/hooks/useChildren';
import { useRoleTheme } from '@/hooks/useRoleTheme';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

// ─── Children Tab ────────────────────────────────────────────────────────────

export default function ChildrenScreen() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const router = useRouter();
  const theme = useRoleTheme();

  const { data: children = [], isLoading, error, refetch } = useChildren(profile?.id);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={(error as Error).message} onRetry={refetch} />;

  return (
    <Screen scroll hasTabBar>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('parent.myChildren')}</Text>
          <Badge label={String(children.length)} variant={theme.tag} />
        </View>

        {children.length === 0 ? (
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
                    size="lg" 
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
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Ionicons name="sparkles" size={12} color={colors.gamification.gold} />
                        <Text style={styles.statText}>{child.total_points}</Text>
                      </View>
                      {child.current_streak > 0 && (
                        <View style={styles.statItem}>
                          <Ionicons name="flame" size={12} color={colors.accent.rose[500]} />
                          <Text style={styles.statText}>{child.current_streak}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
                </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    fontSize: normalize(24),
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
    gap: normalize(2),
  },
  childName: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[900],
    fontSize: normalize(18),
  },
  childMeta: {
    ...typography.textStyles.caption,
    color: colors.neutral[500],
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: normalize(4),
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  statText: {
    ...typography.textStyles.label,
    color: colors.neutral[600],
    fontFamily: typography.fontFamily.bold,
  },
});
