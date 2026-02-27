import React, { useState, useCallback, useMemo } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

import { Screen } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { useRoleTheme } from '@/hooks/useRoleTheme';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { LoadingState, ErrorState } from '@/components/feedback';

import { useTimePeriod } from '@/features/reports/hooks/useTimePeriod';
import { useTeacherClasses } from '@/features/reports/hooks/useTeacherReports';
import { useClassPulse } from '@/features/reports/hooks/useClassPulse';
import { useClassAttendanceTrend } from '@/features/reports/hooks/useTeacherReports';

import { TimePeriodFilter } from '@/features/reports/components/TimePeriodFilter';
import { ClassFilter } from '@/features/reports/components/ClassFilter';
import { PulseCard } from '@/features/reports/components/PulseCard';
import { InsightActionCard } from '@/features/reports/components/InsightActionCard';
import { StudentStatusGrid } from '@/features/reports/components/StudentStatusGrid';
import { MetricBottomSheet } from '@/features/reports/components/MetricBottomSheet';
import { Sparkline } from '@/features/reports/components/Sparkline';

export default function TeacherClassProgressScreen() {
  const { t } = useTranslation();
  const { profile, schoolId } = useAuth();
  const theme = useRoleTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { timePeriod, setTimePeriod, dateRange } = useTimePeriod();
  const [refreshing, setRefreshing] = useState(false);
  const [showAttendanceTrend, setShowAttendanceTrend] = useState(false);

  const teacherClasses = useTeacherClasses(profile?.id ?? null);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>();

  // Auto-select first class when classes load
  React.useEffect(() => {
    if (teacherClasses.data && teacherClasses.data.length > 0 && !selectedClassId) {
      setSelectedClassId(teacherClasses.data[0].id);
    }
  }, [teacherClasses.data, selectedClassId]);

  const classId = selectedClassId ?? null;
  const classPulse = useClassPulse(schoolId, classId, dateRange);

  // Attendance trend for optional bottom sheet drill-down
  const attendanceTrend = useClassAttendanceTrend(schoolId, classId, dateRange);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['teacher-reports'] });
    await queryClient.invalidateQueries({ queryKey: ['period-comparison'] });
    setRefreshing(false);
  }, [queryClient]);

  const pulse = classPulse.data;

  // Reorder insights: celebrations first, then info, then warnings, then danger
  const orderedInsights = useMemo(() => {
    if (!pulse?.insights) return [];
    const order: Record<string, number> = { success: 0, info: 1, warning: 2, danger: 3 };
    return [...pulse.insights].sort(
      (a, b) => (order[a.severity] ?? 2) - (order[b.severity] ?? 2),
    );
  }, [pulse?.insights]);

  // Edge Case: teacher with zero classes
  if (teacherClasses.isLoading) return <LoadingState />;
  if (teacherClasses.isError) {
    return <ErrorState description={teacherClasses.error?.message} onRetry={() => teacherClasses.refetch()} />;
  }
  if (!teacherClasses.data || teacherClasses.data.length === 0) {
    return (
      <Screen scroll={false} hasTabBar>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('reports.noClassesAssigned')}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      hasTabBar
      padding={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
      }
    >
      <View style={styles.content}>
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

        {/* Health Banner */}
        <View style={styles.section}>
          <PulseCard
            status={pulse?.status ?? 'green'}
            message={pulse?.message ?? t('insights.noData')}
            isLoading={classPulse.isLoading}
          />
        </View>

        {/* Insight Feed — the core content */}
        {orderedInsights.length > 0 && (
          <View style={styles.section}>
            {orderedInsights.map((insight) => (
              <View key={insight.id} style={styles.insightCardWrapper}>
                <InsightActionCard
                  insight={insight}
                  onPress={
                    insight.actionRoute
                      ? () => router.push(insight.actionRoute as any)
                      : insight.id === 'attendance-drop'
                        ? () => setShowAttendanceTrend(true)
                        : undefined
                  }
                />
              </View>
            ))}
          </View>
        )}

        {/* Students at a Glance */}
        <View style={styles.section}>
          <StudentStatusGrid
            students={pulse?.students ?? []}
            onStudentPress={(id) => router.push(`/(teacher)/students/${id}` as any)}
            isLoading={classPulse.isLoading}
          />
        </View>
      </View>

      {/* Bottom Sheet: Attendance Trend (opened by tapping attendance-drop insight) */}
      <MetricBottomSheet
        title={t('insights.metric.attendance')}
        subtitle={pulse?.attendance.displayValue}
        isOpen={showAttendanceTrend}
        onClose={() => setShowAttendanceTrend(false)}
      >
        <Sparkline
          data={(attendanceTrend.data ?? []).map((p) => p.rate)}
          height={normalize(120)}
        />
      </MetricBottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    fontSize: normalize(24),
    marginBottom: spacing.md,
  },
  filterRow: {
    marginBottom: spacing.base,
  },
  section: {
    marginTop: spacing.base,
  },
  insightCardWrapper: {
    marginBottom: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
    textAlign: 'center',
  },
});
