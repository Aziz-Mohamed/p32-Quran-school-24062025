import React, { useMemo } from 'react';
import { StyleSheet, View, Text, SectionList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useLessonProgress } from '@/features/lessons/hooks/useLessons';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';

// ─── Lessons Screen ───────────────────────────────────────────────────────────

export default function LessonsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();

  const { data: progressList = [], isLoading, error, refetch } = useLessonProgress(profile?.id);

  // Group by status
  const sections = useMemo(() => {
    const groups: Record<string, any[]> = {
      in_progress: [],
      not_started: [],
      completed: [],
    };

    for (const item of progressList) {
      const status = (item as any).status ?? 'not_started';
      if (groups[status]) {
        groups[status].push(item);
      } else {
        groups.not_started.push(item);
      }
    }

    return [
      { title: t('student.lessons.inProgress'), data: groups.in_progress },
      { title: t('student.lessons.notStarted'), data: groups.not_started },
      { title: t('student.lessons.completed'), data: groups.completed },
    ].filter((s) => s.data.length > 0);
  }, [progressList, t]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;

  if (sections.length === 0) {
    return (
      <Screen scroll={false}>
        <EmptyState
          icon="book-outline"
          title={t('student.lessons.emptyTitle')}
          description={t('student.lessons.emptyDescription')}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('student.lessons.title')}</Text>
        <SectionList
          sections={sections}
          keyExtractor={(item: any) => item.id}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item }: { item: any }) => {
            const lesson = item.lessons;
            const percentage = item.completion_percentage ?? 0;
            return (
              <Card
                variant="outlined"
                onPress={() => router.push(`/(student)/lessons/${lesson?.id ?? item.lesson_id}`)}
                style={styles.lessonCard}
              >
                <View style={styles.lessonRow}>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle}>{lesson?.title ?? '—'}</Text>
                    {lesson?.surah_name && (
                      <Text style={styles.lessonMeta}>
                        {lesson.surah_name}
                        {lesson.ayah_from != null && lesson.ayah_to != null
                          ? ` · ${t('student.lessons.ayahRange', { from: lesson.ayah_from, to: lesson.ayah_to })}`
                          : ''}
                      </Text>
                    )}
                    {lesson?.lesson_type && (
                      <Badge label={lesson.lesson_type} variant="default" size="sm" />
                    )}
                  </View>
                  <Text style={styles.percentage}>{percentage}%</Text>
                </View>
                {/* Progress Bar */}
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                </View>
              </Card>
            );
          }}
        />
      </View>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    ...typography.textStyles.subheading,
    color: lightTheme.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  lessonCard: {
    marginBottom: spacing.sm,
  },
  lessonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  lessonInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  lessonTitle: {
    ...typography.textStyles.body,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.semiBold,
  },
  lessonMeta: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
  },
  percentage: {
    ...typography.textStyles.body,
    color: lightTheme.primary,
    fontFamily: typography.fontFamily.semiBold,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: radius.full,
  },
});
