import React from 'react';
import { I18nManager, StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/feedback';
import { useHomeworkById, useCompleteHomework } from '@/features/homework/hooks/useHomework';
import { useRoleTheme } from '@/hooks/useRoleTheme';
import { formatDate } from '@/lib/helpers';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getHomeworkStatus(homework: { is_completed: boolean; due_date: string | null }) {
  if (homework.is_completed) return 'completed';
  if (!homework.due_date) return 'pending';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(homework.due_date + 'T00:00:00');
  return due < today ? 'overdue' : 'pending';
}

function getStatusBadgeVariant(status: string): 'success' | 'warning' | 'error' {
  if (status === 'completed') return 'success';
  if (status === 'overdue') return 'error';
  return 'warning';
}

// ─── Student Homework Detail ─────────────────────────────────────────────────

export default function StudentHomeworkDetailScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useRoleTheme();

  const { data: homework, isLoading, error, refetch } = useHomeworkById(id);
  const { mutate: completeHomework, isPending: isCompleting } = useCompleteHomework();

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;
  if (!homework) return <ErrorState description={t('common.noResults')} onRetry={refetch} />;

  const status = getHomeworkStatus(homework);
  const session = (homework as any).sessions;
  const teacherName = session?.profiles?.full_name;
  const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';

  const handleComplete = () => {
    completeHomework(homework.id, {
      onSuccess: () => router.back(),
    });
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Button
          title={t('common.back')}
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
          icon={<Ionicons name={I18nManager.isRTL ? "arrow-forward" : "arrow-back"} size={20} color={theme.primary} />}
        />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('student.homeworkDetail.title')}</Text>
        </View>

        {/* Description */}
        <Card variant="default" style={styles.section}>
          <Text style={styles.sectionTitle}>{t('student.homeworkDetail.description')}</Text>
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>{homework.description}</Text>
          </View>
        </Card>

        {/* Due Date */}
        <Card variant="default" style={styles.section}>
          <Text style={styles.sectionTitle}>{t('student.homeworkDetail.dueDate')}</Text>
          <View style={styles.dueDateRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.neutral[400]} />
            <Text style={styles.dueDateText}>
              {homework.due_date
                ? formatDate(homework.due_date, locale)
                : t('student.homeworkDetail.noDueDate')}
            </Text>
            <Badge
              label={t(`student.homeworkDetail.${status}`)}
              variant={getStatusBadgeVariant(status)}
              size="sm"
            />
          </View>
        </Card>

        {/* Session Info */}
        {session && (
          <Card variant="default" style={styles.section}>
            <Text style={styles.sectionTitle}>{t('student.homeworkDetail.session')}</Text>
            <View style={styles.sessionInfoRow}>
              <Ionicons name="book-outline" size={18} color={colors.neutral[400]} />
              <Text style={styles.sessionInfoText}>
                {formatDate(session.session_date, locale)}
              </Text>
            </View>
            {teacherName && (
              <View style={styles.sessionInfoRow}>
                <Ionicons name="person-outline" size={18} color={colors.neutral[400]} />
                <Text style={styles.sessionInfoLabel}>{t('student.homeworkDetail.teacher')}:</Text>
                <Text style={styles.sessionInfoText}>{teacherName}</Text>
              </View>
            )}
          </Card>
        )}

        {/* Mark Complete Button */}
        {!homework.is_completed && (
          <Button
            title={t('student.homeworkDetail.markComplete')}
            onPress={handleComplete}
            variant="primary"
            loading={isCompleting}
            fullWidth
            icon={<Ionicons name="checkmark-circle-outline" size={20} color={colors.white} />}
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
  header: {
    gap: normalize(4),
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    fontSize: normalize(24),
  },
  section: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
    fontSize: normalize(16),
  },
  descriptionContainer: {
    backgroundColor: colors.neutral[50],
    padding: spacing.md,
    borderRadius: normalize(10),
    borderLeftWidth: 3,
    borderLeftColor: colors.neutral[200],
  },
  descriptionText: {
    ...typography.textStyles.body,
    color: colors.neutral[700],
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dueDateText: {
    ...typography.textStyles.body,
    color: colors.neutral[600],
    flex: 1,
  },
  sessionInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sessionInfoLabel: {
    ...typography.textStyles.label,
    color: colors.neutral[500],
  },
  sessionInfoText: {
    ...typography.textStyles.body,
    color: colors.neutral[700],
  },
});
