import React, { useState, useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { spacing } from '@/theme/spacing';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { LoadingState, ErrorState } from '@/components/feedback';

import { useTimePeriod } from '@/features/reports/hooks/useTimePeriod';
import {
  useTeacherClasses,
  useClassAnalytics,
  useClassScoreTrend,
  useClassAttendanceTrend,
  useStudentsNeedingAttention,
} from '@/features/reports/hooks/useTeacherReports';

import { TimePeriodFilter } from '@/features/reports/components/TimePeriodFilter';
import { ClassFilter } from '@/features/reports/components/ClassFilter';
import { KPICard } from '@/features/reports/components/KPICard';
import { ScoreTrendChart } from '@/features/reports/components/ScoreTrendChart';
import { AttendanceTrendChart } from '@/features/reports/components/AttendanceTrendChart';
import { LevelDistributionChart } from '@/features/reports/components/LevelDistributionChart';
import { StudentAttentionList } from '@/features/reports/components/StudentAttentionList';

export default function TeacherClassProgressScreen() {
  const { t } = useTranslation();
  const { profile, schoolId } = useAuth();
  const queryClient = useQueryClient();

  const { timePeriod, setTimePeriod, dateRange } = useTimePeriod();
  const [refreshing, setRefreshing] = useState(false);

  const teacherClasses = useTeacherClasses(profile?.id ?? null);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>();

  // Auto-select first class when classes load
  React.useEffect(() => {
    if (teacherClasses.data && teacherClasses.data.length > 0 && !selectedClassId) {
      setSelectedClassId(teacherClasses.data[0].id);
    }
  }, [teacherClasses.data, selectedClassId]);

  const classId = selectedClassId ?? null;

  const classAnalytics = useClassAnalytics(classId, dateRange);
  const scoreTrend = useClassScoreTrend(schoolId, classId, dateRange);
  const attendanceTrend = useClassAttendanceTrend(schoolId, classId, dateRange);
  const attention = useStudentsNeedingAttention(classId, dateRange);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['teacher-reports'] });
    setRefreshing(false);
  }, [queryClient]);

  // Edge Case 7: teacher with zero classes
  if (teacherClasses.isLoading) return <LoadingState />;
  if (teacherClasses.isError) {
    return <ErrorState description={teacherClasses.error?.message} onRetry={() => teacherClasses.refetch()} />;
  }
  if (!teacherClasses.data || teacherClasses.data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {t('reports.noClassesAssigned')}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>{t('reports.classProgress')}</Text>

        {/* Class selector (for teachers with multiple classes) */}
        {teacherClasses.data.length > 1 && (
          <View style={styles.filterRow}>
            <ClassFilter
              classes={teacherClasses.data}
              selectedClassId={selectedClassId}
              onSelect={(id) => setSelectedClassId(id ?? teacherClasses.data![0].id)}
              showAllOption={false}
            />
          </View>
        )}

        <TimePeriodFilter value={timePeriod} onChange={setTimePeriod} />

        {/* Class Summary KPIs */}
        <View style={styles.kpiRow}>
          <KPICard
            label={t('reports.kpi.attendanceRate')}
            value={classAnalytics.data?.attendanceRate ?? 0}
            format="percentage"
            isLoading={classAnalytics.isLoading}
          />
          <KPICard
            label={t('reports.legend.memorization')}
            value={classAnalytics.data?.averageMemorization ?? 0}
            format="score"
            isLoading={classAnalytics.isLoading}
          />
          <KPICard
            label={t('reports.legend.tajweed')}
            value={classAnalytics.data?.averageTajweed ?? 0}
            format="score"
            isLoading={classAnalytics.isLoading}
          />
          <KPICard
            label={t('reports.legend.recitation')}
            value={classAnalytics.data?.averageRecitation ?? 0}
            format="score"
            isLoading={classAnalytics.isLoading}
          />
        </View>

        <ScoreTrendChart
          data={scoreTrend.data ?? []}
          isLoading={scoreTrend.isLoading}
          isError={scoreTrend.isError}
          onRetry={() => scoreTrend.refetch()}
        />

        <AttendanceTrendChart
          data={attendanceTrend.data ?? []}
          isLoading={attendanceTrend.isLoading}
          isError={attendanceTrend.isError}
          onRetry={() => attendanceTrend.refetch()}
        />

        <LevelDistributionChart
          data={classAnalytics.data?.levelDistribution ?? []}
          isLoading={classAnalytics.isLoading}
          isError={classAnalytics.isError}
          onRetry={() => classAnalytics.refetch()}
        />

        <StudentAttentionList
          students={attention.data ?? []}
          isLoading={attention.isLoading}
          isError={attention.isError}
          onRetry={() => attention.refetch()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: lightTheme.background,
  },
  scroll: {
    flex: 1,
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
  filterRow: {
    marginBottom: spacing.base,
  },
  kpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: lightTheme.background,
  },
  emptyText: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
    textAlign: 'center',
  },
});
