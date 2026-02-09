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
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Trophy Room Screen ──────────────────────────────────────────────────────

export default function TrophyRoomScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();

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
        <Button
          title={t('common.back')}
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
        />

        <Text style={styles.title}>{t('student.trophies.title')}</Text>

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
                <Text style={styles.sectionTitle}>{t('student.trophies.earned')}</Text>
                <View style={styles.grid}>
                  {earned.map((trophy: any) => (
                    <Card key={trophy.id} variant="elevated" style={styles.trophyCard}>
                      <Ionicons name="trophy" size={40} color={colors.primary[500]} />
                      <Text style={styles.trophyName}>{trophy.title}</Text>
                      <Text style={styles.trophyDate}>
                        {t('student.trophies.earnedOn', {
                          date: earnedMap.get(trophy.id)?.split('T')[0] ?? '',
                        })}
                      </Text>
                    </Card>
                  ))}
                </View>
              </>
            )}

            {/* Locked Trophies */}
            {locked.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>{t('student.trophies.locked')}</Text>
                <View style={styles.grid}>
                  {locked.map((trophy: any) => (
                    <Card key={trophy.id} variant="outlined" style={styles.trophyCard}>
                      <Ionicons name="lock-closed-outline" size={40} color={lightTheme.textTertiary} />
                      <Text style={styles.trophyNameLocked}>{trophy.title}</Text>
                      {trophy.criteria && (
                        <Text style={styles.trophyCriteria}>{trophy.criteria}</Text>
                      )}
                      <Text style={styles.trophyPoints}>
                        {trophy.points_required} {t('common.pts')}
                      </Text>
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
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
  },
  sectionTitle: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
    marginTop: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  trophyCard: {
    width: '45%',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  trophyName: {
    ...typography.textStyles.body,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.semiBold,
    textAlign: 'center',
  },
  trophyNameLocked: {
    ...typography.textStyles.body,
    color: lightTheme.textTertiary,
    fontFamily: typography.fontFamily.medium,
    textAlign: 'center',
  },
  trophyDate: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    textAlign: 'center',
  },
  trophyCriteria: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    textAlign: 'center',
  },
  trophyPoints: {
    ...typography.textStyles.caption,
    color: lightTheme.textTertiary,
    fontSize: typography.fontSize.xs,
  },
});
