import React, { useState, useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/hooks/useAuth';
import { spacing } from '@/theme/spacing';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';

import { useTimePeriod } from '@/features/reports/hooks/useTimePeriod';
import { useTeacherActivity } from '@/features/reports/hooks/useAdminReports';
import { TimePeriodFilter } from '@/features/reports/components/TimePeriodFilter';
import { TeacherActivityList } from '@/features/reports/components/TeacherActivityList';

export default function TeacherActivityScreen() {
  const { t } = useTranslation();
  const { schoolId } = useAuth();
  const queryClient = useQueryClient();

  const { timePeriod, setTimePeriod, dateRange } = useTimePeriod();
  const [refreshing, setRefreshing] = useState(false);

  const teacherActivity = useTeacherActivity(schoolId, dateRange);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['admin-reports', 'teacher-activity'] });
    setRefreshing(false);
  }, [queryClient]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>
        {t('reports.teacherActivity', 'Teacher Activity')}
      </Text>

      <TimePeriodFilter value={timePeriod} onChange={setTimePeriod} />

      <TeacherActivityList
        teachers={teacherActivity.data ?? []}
        isLoading={teacherActivity.isLoading}
        isError={teacherActivity.isError}
        onRetry={() => teacherActivity.refetch()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: lightTheme.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    marginBottom: spacing.sm,
  },
});
