import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useStudentTrophies } from '@/features/gamification/hooks/useTrophies';
import { useRoleTheme } from '@/hooks/useRoleTheme';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

// ─── Trophy Room Screen ──────────────────────────────────────────────────────

export default function TrophyRoomScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  const theme = useRoleTheme();

  const { data, isLoading, error, refetch } = useStudentTrophies(profile?.id);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={(error as Error).message} onRetry={refetch} />;

  const allTrophies = data?.allTrophies ?? [];
  const earnedIds = new Set((data?.earnedTrophies ?? []).map((et: any) => et.trophy_id));
  const earnedMap = new Map((data?.earnedTrophies ?? []).map((et: any) => [et.trophy_id, et.earned_at]));

  const earned = allTrophies.filter((t: any) => earnedIds.has(t.id));
  const locked = allTrophies.filter((t: any) => !earnedIds.has(t.id));

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            title={t('common.back')}
            onPress={() => router.back()}
            variant="ghost"
            size="sm"
            icon={<Ionicons name="arrow-back" size={20} color={theme.primary} />}
          />
          <Text style={styles.title}>{t('student.trophies.title')}</Text>
        </View>

        {allTrophies.length === 0 ? (
          <EmptyState
            icon="trophy-outline"
            title={t('student.trophies.emptyTitle')}
            description={t('student.trophies.emptyDescription')}
          />
        ) : (
          <>
            {/* Earned Trophies */}
            {earned.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{t('student.trophies.earned')}</Text>
                  <Badge label={String(earned.length)} variant={theme.tag} />
                </View>
                <View style={styles.grid}>
                  {earned.map((trophy: any) => (
                    <Card key={trophy.id} variant="primary-glow" style={styles.trophyCard}>
                      <View style={styles.trophyIconContainer}>
                        <Ionicons name="trophy" size={44} color={colors.gamification.gold} />
                      </View>
                      <Text style={styles.trophyName}>{trophy.name}</Text>
                      <View style={styles.earnedBadge}>
                        <Text style={styles.trophyDate}>
                          {earnedMap.get(trophy.id)?.split('T')[0] ?? ''}
                        </Text>
                      </View>
                    </Card>
                  ))}
                </View>
              </>
            )}

            {/* Locked Trophies */}
            {locked.length > 0 && (
              <>
                <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
                  <Text style={styles.sectionTitle}>{t('student.trophies.locked')}</Text>
                  <Badge label={String(locked.length)} variant="default" />
                </View>
                <View style={styles.grid}>
                  {locked.map((trophy: any) => (
                    <Card key={trophy.id} variant="outlined" style={[styles.trophyCard, styles.lockedCard]}>
                      <Ionicons name="lock-closed" size={32} color={colors.neutral[300]} />
                      <Text style={styles.trophyNameLocked}>{trophy.name}</Text>
                      {trophy.description && (
                        <Text style={styles.trophyCriteria}>{trophy.description}</Text>
                      )}
                    </Card>
                  ))}
                </View>
              </>
            )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    fontSize: normalize(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.textStyles.subheading,
    color: colors.neutral[900],
    fontSize: normalize(18),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  trophyCard: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  lockedCard: {
    backgroundColor: colors.neutral[50],
    borderStyle: 'dashed',
  },
  trophyIconContainer: {
    width: normalize(72),
    height: normalize(72),
    borderRadius: normalize(36),
    backgroundColor: '#FFFBEB', // amber 50
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(4),
  },
  trophyName: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  trophyNameLocked: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[400],
    textAlign: 'center',
  },
  earnedBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(2),
    borderRadius: normalize(8),
  },
  trophyDate: {
    fontSize: normalize(10),
    fontFamily: typography.fontFamily.bold,
    color: colors.primary[600],
    textAlign: 'center',
  },
  trophyCriteria: {
    ...typography.textStyles.label,
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: normalize(2),
  },
});
