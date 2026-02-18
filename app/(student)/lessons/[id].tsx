import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/feedback';
import { useLessons } from '@/features/lessons/hooks/useLessons';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';

// ─── Lesson Detail Screen ────────────────────────────────────────────────────

export default function LessonDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Get all lessons and find the one we need
  const { data: lessons = [], isLoading, error, refetch } = useLessons();
  const lesson = lessons.find((l: any) => l.id === id);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;
  if (!lesson) return <ErrorState description={t('common.noResults')} onRetry={refetch} />;

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Button
          title={t('common.back')}
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
        />

        <Text style={styles.title}>{(lesson as any).title}</Text>

        {(lesson as any).description && (
          <Text style={styles.description}>{(lesson as any).description}</Text>
        )}

        <Card variant="outlined" style={styles.detailCard}>
          {(lesson as any).lesson_type && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('student.lessons.type')}</Text>
              <Badge label={(lesson as any).lesson_type} variant="default" size="sm" />
            </View>
          )}
          {(lesson as any).surah_name && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('student.lessons.surah')}</Text>
              <Text style={styles.detailValue}>{(lesson as any).surah_name}</Text>
            </View>
          )}
          {(lesson as any).ayah_from != null && (lesson as any).ayah_to != null && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('student.lessons.progress')}</Text>
              <Text style={styles.detailValue}>
                {t('student.lessons.ayahRange', {
                  from: (lesson as any).ayah_from,
                  to: (lesson as any).ayah_to,
                })}
              </Text>
            </View>
          )}
        </Card>
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
  description: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
  },
  detailCard: {
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
  },
  detailValue: {
    ...typography.textStyles.body,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.semiBold,
  },
});
