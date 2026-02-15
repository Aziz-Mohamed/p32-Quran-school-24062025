import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/feedback';
import { useLessons } from '@/features/lessons/hooks/useLessons';
import { useRoleTheme } from '@/hooks/useRoleTheme';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Lesson Detail Screen ────────────────────────────────────────────────────

export default function LessonDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useRoleTheme();

  // Get all lessons and find the one we need
  const { data: lessons = [], isLoading, error, refetch } = useLessons();
  const lesson = lessons.find((l: any) => l.id === id);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;
  if (!lesson) return <ErrorState description={t('common.noResults')} onRetry={refetch} />;

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
        </View>

        <View style={styles.contentHeader}>
          <Text style={styles.title}>{(lesson as any).title}</Text>
          {(lesson as any).lesson_type && (
            <Badge label={(lesson as any).lesson_type} variant={theme.tag} size="md" />
          )}
        </View>

        {(lesson as any).description && (
          <Card variant="glass" style={styles.descriptionCard}>
            <Text style={styles.description}>{(lesson as any).description}</Text>
          </Card>
        )}

        <Text style={styles.sectionTitle}>{t('student.lessons.details')}</Text>
        <Card variant="default" style={styles.detailCard}>
          {(lesson as any).surah_name && (
            <View style={styles.detailRow}>
              <View style={styles.labelGroup}>
                <Ionicons name="book-outline" size={18} color={theme.primary} />
                <Text style={styles.detailLabel}>{t('student.lessons.surah')}</Text>
              </View>
              <Text style={styles.detailValue}>{(lesson as any).surah_name}</Text>
            </View>
          )}
          
          <View style={styles.divider} />

          {(lesson as any).ayah_from != null && (lesson as any).ayah_to != null && (
            <View style={styles.detailRow}>
              <View style={styles.labelGroup}>
                <Ionicons name="list-outline" size={18} color={theme.primary} />
                <Text style={styles.detailLabel}>{t('student.lessons.progress')}</Text>
              </View>
              <Text style={styles.detailValue}>
                {t('student.lessons.ayahRange', {
                  from: (lesson as any).ayah_from,
                  to: (lesson as any).ayah_to,
                })}
              </Text>
            </View>
          )}
        </Card>

        <View style={styles.actionFooter}>
          <Button 
            title={t('student.lessons.startLesson')} 
            onPress={() => {}} 
            variant="glow"
            fullWidth
          />
        </View>
      </View>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentHeader: {
    gap: spacing.xs,
  },
  title: {
    ...typography.textStyles.heading,
    color: colors.neutral[900],
    fontSize: 28,
  },
  descriptionCard: {
    padding: spacing.lg,
  },
  description: {
    ...typography.textStyles.body,
    color: colors.neutral[600],
    lineHeight: 24,
  },
  sectionTitle: {
    ...typography.textStyles.subheading,
    color: colors.neutral[800],
    fontSize: 18,
    marginTop: spacing.sm,
  },
  detailCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailLabel: {
    ...typography.textStyles.body,
    color: colors.neutral[500],
  },
  detailValue: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[900],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[100],
  },
  actionFooter: {
    marginTop: spacing.xl,
  },
});
