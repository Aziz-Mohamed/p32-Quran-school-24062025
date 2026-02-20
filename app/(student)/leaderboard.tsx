import React, { useState } from 'react';
import { I18nManager, StyleSheet, View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge, Avatar } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useLeaderboard } from '@/features/gamification/hooks/useLeaderboard';
import { useRoleTheme } from '@/hooks/useRoleTheme';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

// ─── Leaderboard Screen ──────────────────────────────────────────────────────

export default function LeaderboardScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  const theme = useRoleTheme();
  const [period, setPeriod] = useState<'weekly' | 'all-time'>('all-time');

  const { data: entries = [], isLoading, error, refetch } = useLeaderboard(
    undefined,
    period,
  );

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={(error as Error).message} onRetry={refetch} />;

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            title={t('common.back')}
            onPress={() => router.back()}
            variant="ghost"
            size="sm"
            icon={<Ionicons name={I18nManager.isRTL ? "arrow-forward" : "arrow-back"} size={20} color={theme.primary} />}
          />
          <Text style={styles.title}>{t('student.leaderboard.title')}</Text>
        </View>

        {/* Period Toggle */}
        <View style={styles.toggleContainer}>
          <Pressable
            onPress={() => setPeriod('weekly')}
            style={[styles.toggleButton, period === 'weekly' && { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.toggleText, period === 'weekly' && styles.toggleTextActive]}>
              {t('student.leaderboard.weekly')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setPeriod('all-time')}
            style={[styles.toggleButton, period === 'all-time' && { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.toggleText, period === 'all-time' && styles.toggleTextActive]}>
              {t('student.leaderboard.allTime')}
            </Text>
          </Pressable>
        </View>

        {entries.length === 0 ? (
          <EmptyState
            icon="podium-outline"
            title={t('student.leaderboard.emptyTitle')}
            description={t('student.leaderboard.emptyDescription')}
          />
        ) : (
          <FlashList
            data={entries}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={styles.listContent}
            estimatedItemSize={80}
            renderItem={({ item, index }: { item: any; index: number }) => {
              const rank = index + 1;
              const isCurrentUser = item.user_id === profile?.id;
              
              return (
                <Card
                  variant={isCurrentUser ? 'primary-glow' : 'default'}
                  style={[styles.entryCard, isCurrentUser && { borderColor: theme.primary }]}
                >
                  <View style={styles.entryRow}>
                    <View style={styles.rankContainer}>
                      {rank <= 3 ? (
                        <Ionicons 
                          name="trophy" 
                          size={24} 
                          color={rank === 1 ? colors.gamification.gold : rank === 2 ? colors.gamification.silver : colors.gamification.bronze} 
                        />
                      ) : (
                        <Text style={styles.rankText}>{rank}</Text>
                      )}
                    </View>
                    
                    <Avatar 
                      name={item.profiles?.full_name} 
                      size="md" 
                      ring={isCurrentUser}
                      variant={isCurrentUser ? theme.tag : 'default'}
                    />

                    <View style={styles.entryInfo}>
                      <Text style={styles.entryName} numberOfLines={1}>
                        {item.profiles?.full_name ?? '—'}
                      </Text>
                      <Text style={styles.entryLevel}>
                        {t('common.level')} {item.current_level ?? 0}
                      </Text>
                    </View>
                    
                    <View style={styles.pointsContainer}>
                      <Text style={[styles.entryPoints, { color: theme.primary }]}>
                        {item.total_points ?? 0}
                      </Text>
                      <Text style={styles.pointsLabel}>{t('student.points')}</Text>
                    </View>
                  </View>
                </Card>
              );
            }}
          />
        )}
      </View>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    fontSize: normalize(22),
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    padding: normalize(4),
    borderRadius: normalize(16),
    marginHorizontal: spacing.lg,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: normalize(10),
    alignItems: 'center',
    borderRadius: normalize(12),
  },
  toggleText: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[500],
    fontSize: normalize(14),
  },
  toggleTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.lg,
  },
  entryCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rankContainer: {
    width: normalize(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[400],
    fontSize: normalize(18),
  },
  entryInfo: {
    flex: 1,
    gap: normalize(2),
  },
  entryName: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[900],
  },
  entryLevel: {
    ...typography.textStyles.label,
    color: colors.neutral[500],
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  entryPoints: {
    ...typography.textStyles.bodyMedium,
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(18),
  },
  pointsLabel: {
    ...typography.textStyles.label,
    fontSize: normalize(10),
    color: colors.neutral[400],
  },
});
