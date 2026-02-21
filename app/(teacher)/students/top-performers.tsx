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
import { useTopPerformers } from '@/features/teachers/hooks/useTeacherInsights';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

// ─── Top Performers Screen ──────────────────────────────────────────────────

export default function TopPerformersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();

  const { data: students = [], isLoading, error, refetch } = useTopPerformers(profile?.id);

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

        <Text style={styles.title}>{t('teacher.topPerformers')}</Text>
        <Text style={styles.subtitle}>{t('teacher.topPerformersDesc')}</Text>

        {students.length === 0 ? (
          <EmptyState
            icon="trophy-outline"
            title={t('teacher.insights.emptyTitle')}
            description={t('teacher.insights.emptyDescription')}
          />
        ) : (
          students.map((student: any, index: number) => (
            <Card
              key={student.id}
              variant="outlined"
              onPress={() => router.push(`/(teacher)/students/${student.id}`)}
              style={styles.studentCard}
            >
              <View style={styles.studentRow}>
                <View style={styles.rankContainer}>
                  <Text
                    style={index < 3 ? { ...styles.rankText, ...styles.topRank } : styles.rankText}
                  >
                    #{index + 1}
                  </Text>
                </View>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>
                    {student.profiles?.full_name ?? '—'}
                  </Text>
                  <Text style={styles.studentMeta}>
                    {student.classes?.name ?? ''}
                    {` · ${t('common.level')} ${student.current_level ?? 0}`}
                  </Text>
                </View>
                <Badge
                  label={`${t('common.level')} ${student.current_level ?? 0}`}
                  variant="indigo"
                  size="md"
                />
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
  rankContainer: {
    width: normalize(36),
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
    marginTop: normalize(2),
  },
});
