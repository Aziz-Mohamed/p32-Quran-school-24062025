import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useNeedsSupport } from '@/features/teachers/hooks/useTeacherInsights';
import { typography } from '@/theme/typography';
import { lightTheme, colors, semantic } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Needs Support Screen ───────────────────────────────────────────────────

export default function NeedsSupportScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();

  const { data: students = [], isLoading, error, refetch } = useNeedsSupport(profile?.id);

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

        <Text style={styles.title}>{t('teacher.needsSupport')}</Text>
        <Text style={styles.subtitle}>{t('teacher.needsSupportDesc')}</Text>

        {students.length === 0 ? (
          <EmptyState
            icon="heart-outline"
            title={t('teacher.insights.noSupportTitle')}
            description={t('teacher.insights.noSupportDescription')}
          />
        ) : (
          students.map((student: any) => (
            <Card
              key={student.id}
              variant="outlined"
              onPress={() => router.push(`/(teacher)/students/${student.id}`)}
              style={styles.studentCard}
            >
              <View style={styles.studentRow}>
                <View style={styles.iconContainer}>
                  <Ionicons name="alert-circle-outline" size={24} color={semantic.warning} />
                </View>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>
                    {student.profiles?.full_name ?? '—'}
                  </Text>
                  <Text style={styles.studentMeta}>
                    {student.classes?.name ?? ''}
                    {student.levels ? ` · ${student.levels.title}` : ''}
                  </Text>
                </View>
                <View style={styles.statsContainer}>
                  <Text style={styles.pointsValue}>{student.total_points ?? 0} {t('common.pts')}</Text>
                  {student.current_streak === 0 && (
                    <Badge label={t('teacher.insights.noStreak')} variant="warning" size="sm" />
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
  studentCard: {
    marginBottom: spacing.xs,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 36,
    alignItems: 'center',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    ...typography.textStyles.body,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.semiBold,
  },
  studentMeta: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    marginTop: 2,
  },
  statsContainer: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  pointsValue: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
    fontFamily: typography.fontFamily.medium,
  },
});
