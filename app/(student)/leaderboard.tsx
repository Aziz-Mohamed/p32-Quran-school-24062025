import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useLeaderboard } from '@/features/gamification/hooks/useLeaderboard';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';

// ─── Leaderboard Screen ──────────────────────────────────────────────────────

export default function LeaderboardScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  const [period, setPeriod] = useState<'weekly' | 'all-time'>('all-time');

  // For now, use profile's class_id (from student record). The hook needs a classId.
  // We pass undefined and handle the empty state gracefully.
  const { data: entries = [], isLoading, error, refetch } = useLeaderboard(
    undefined, // TODO: get student's class_id
    period,
  );

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={(error as Error).message} onRetry={refetch} />;

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <Button
          title={t('common.back')}
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
        />

        <Text style={styles.title}>{t('student.leaderboard.title')}</Text>

        {/* Period Toggle */}
        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => setPeriod('weekly')}
            style={[styles.toggleButton, period === 'weekly' && styles.toggleActive]}
          >
            <Text style={[styles.toggleText, period === 'weekly' && styles.toggleTextActive]}>
              {t('student.leaderboard.weekly')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setPeriod('all-time')}
            style={[styles.toggleButton, period === 'all-time' && styles.toggleActive]}
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
            renderItem={({ item, index }: { item: any; index: number }) => {
              const rank = index + 1;
              const isCurrentUser = item.user_id === profile?.id;
              return (
                <Card
                  variant={isCurrentUser ? 'elevated' : 'outlined'}
                  style={styles.entryCard}
                >
                  <View style={styles.entryRow}>
                    <Text style={[styles.rank, rank <= 3 && styles.topRank]}>
                      {t('student.leaderboard.rank', { rank })}
                    </Text>
                    <View style={styles.entryInfo}>
                      <Text style={styles.entryName}>
                        {item.profiles?.full_name ?? '—'}
                      </Text>
                      {item.levels && (
                        <Text style={styles.entryLevel}>
                          {item.levels.title ?? `Lvl ${item.levels.level_number}`}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.entryPoints}>{item.total_points ?? 0}</Text>
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
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: lightTheme.border,
  },
  toggleActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  toggleText: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
    fontFamily: typography.fontFamily.medium,
  },
  toggleTextActive: {
    color: colors.white,
  },
  entryCard: {
    marginBottom: spacing.sm,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rank: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
    fontFamily: typography.fontFamily.semiBold,
    width: 40,
  },
  topRank: {
    color: colors.primary[500],
    fontSize: typography.fontSize.md,
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    ...typography.textStyles.body,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.semiBold,
  },
  entryLevel: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
  },
  entryPoints: {
    ...typography.textStyles.body,
    color: lightTheme.primary,
    fontFamily: typography.fontFamily.semiBold,
  },
});
