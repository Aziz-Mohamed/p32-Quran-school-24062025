import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { useStudentById } from '@/features/students/hooks/useStudents';
import { useClassStanding } from '@/features/children/hooks/useChildren';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

// ─── Class Standing Screen ───────────────────────────────────────────────────

export default function ClassStandingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { childId } = useLocalSearchParams<{ childId: string }>();

  const { data: student } = useStudentById(childId);
  const classId = student?.class_id ?? undefined;

  const { data: standings, isLoading, error, refetch } = useClassStanding(
    childId,
    classId,
  );

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={(error as Error).message} onRetry={refetch} />;

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Button
          title={t('common.back')}
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
        />

        <Text style={styles.title}>{t('parent.classStanding')}</Text>
        <Text style={styles.subtitle}>{t('parent.classStandingDesc')}</Text>

        {!standings || standings.length === 0 ? (
          <EmptyState
            icon="podium-outline"
            title={t('student.leaderboard.emptyTitle')}
            description={t('student.leaderboard.emptyDescription')}
          />
        ) : (
          standings.map((entry: any, index: number) => (
            <Card
              key={index}
              variant={entry.isCurrentStudent ? 'elevated' : 'outlined'}
              style={entry.isCurrentStudent ? { ...styles.standingCard, ...styles.currentStudentCard } : styles.standingCard}
            >
              <View style={styles.standingRow}>
                <View style={styles.rankContainer}>
                  <Text
                    style={[
                      styles.rankText,
                      entry.rank <= 3 && styles.topRank,
                    ]}
                  >
                    #{entry.rank}
                  </Text>
                </View>
                <View style={styles.standingInfo}>
                  {entry.isCurrentStudent ? (
                    <Text style={styles.currentLabel}>{t('parent.yourChild')}</Text>
                  ) : (
                    <Text style={styles.anonymousLabel}>
                      {t('student.leaderboard.rank', { rank: entry.rank })}
                    </Text>
                  )}
                </View>
                <Text style={styles.pointsValue}>{entry.points} {t('common.pts')}</Text>
              </View>
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
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
  },
  subtitle: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
  },
  standingCard: {
    marginBottom: spacing.xs,
  },
  currentStudentCard: {
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rankContainer: {
    width: normalize(40),
    alignItems: 'center',
  },
  rankText: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
  },
  topRank: {
    color: colors.secondary[500],
    fontFamily: typography.fontFamily.bold,
  },
  standingInfo: {
    flex: 1,
  },
  currentLabel: {
    ...typography.textStyles.body,
    color: colors.primary[600],
    fontFamily: typography.fontFamily.semiBold,
  },
  anonymousLabel: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
  },
  pointsValue: {
    ...typography.textStyles.body,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.medium,
  },
});
