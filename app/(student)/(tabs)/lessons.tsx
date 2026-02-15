import React, { useMemo } from 'react';
import { StyleSheet, View, Text, SectionList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge, ProgressBar } from '@/components/ui';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useLessonProgress } from '@/features/lessons/hooks/useLessons';
import { useRoleTheme } from '@/hooks/useRoleTheme';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

// ─── Lessons Screen ───────────────────────────────────────────────────────────

export default function LessonsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  const theme = useRoleTheme();

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
      { title: t('student.lessons.inProgress'), data: groups.in_progress, icon: 'time' },
      { title: t('student.lessons.notStarted'), data: groups.not_started, icon: 'play-circle' },
      { title: t('student.lessons.completed'), data: groups.completed, icon: 'checkmark-circle' },
    ].filter((s) => s.data.length > 0);
  }, [progressList, t]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;

  if (sections.length === 0) {
    return (
      <Screen scroll={false} hasTabBar>
        <EmptyState
          icon="book-outline"
          title={t('student.lessons.emptyTitle')}
          description={t('student.lessons.emptyDescription')}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll={false} hasTabBar>
      <View style={styles.container}>
        <Text style={styles.title}>{t('student.lessons.title')}</Text>
        <SectionList
          sections={sections}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeaderContainer}>
              <Ionicons name={(section as any).icon} size={18} color={theme.primary} />
              <Text style={styles.sectionHeader}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item }: { item: any }) => {
            const lesson = item.lessons;
            const percentage = (item.completion_percentage ?? 0) / 100;
            return (
              <Card
                variant="default"
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
                    <View style={styles.badgeRow}>
                      {lesson?.lesson_type && (
                        <Badge label={lesson.lesson_type} variant={theme.tag} size="sm" />
                      )}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
                </View>
                
                <ProgressBar 
                  progress={percentage} 
                  variant={theme.tag} 
                  height={6} 
                  showLabel 
                  style={styles.progressBar}
                />
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
  },
  listContent: {
    padding: spacing.lg,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    fontSize: normalize(24),
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
    fontSize: normalize(16),
  },
  lessonCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  lessonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  lessonInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  lessonTitle: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[900],
    fontSize: normalize(17),
  },
  lessonMeta: {
    ...typography.textStyles.caption,
    color: colors.neutral[500],
  },
  badgeRow: {
    marginTop: spacing.xs,
  },
  progressBar: {
    marginTop: spacing.xs,
  },
});
