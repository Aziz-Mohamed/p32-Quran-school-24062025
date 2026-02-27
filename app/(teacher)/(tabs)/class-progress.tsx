import React, { useState, useCallback } from 'react';
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
import { useClassAttendanceTrend, useClassScoreTrend } from '@/features/reports/hooks/useTeacherReports';

import { TimePeriodFilter } from '@/features/reports/components/TimePeriodFilter';
import { ClassFilter } from '@/features/reports/components/ClassFilter';
import { PulseCard } from '@/features/reports/components/PulseCard';
import { HealthIndicator } from '@/features/reports/components/HealthIndicator';
import { InsightActionCard } from '@/features/reports/components/InsightActionCard';
import { ScoreSnapshotRow } from '@/features/reports/components/ScoreSnapshotRow';
import { StudentStatusGrid } from '@/features/reports/components/StudentStatusGrid';
import { MetricBottomSheet } from '@/features/reports/components/MetricBottomSheet';
import { Sparkline } from '@/features/reports/components/Sparkline';
import { getTrendDirection, formatTrendLabel } from '@/features/reports/utils/thresholds';

export default function TeacherClassProgressScreen() {
  const { t } = useTranslation();
  const { profile, schoolId } = useAuth();
  const theme = useRoleTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { timePeriod, setTimePeriod, dateRange } = useTimePeriod();
  const [refreshing, setRefreshing] = useState(false);
  const [bottomSheet, setBottomSheet] = useState<'attendance' | 'scores' | null>(null);

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

  // Trend data for bottom sheet sparklines
  const attendanceTrend = useClassAttendanceTrend(schoolId, classId, dateRange);
  const scoreTrend = useClassScoreTrend(schoolId, classId, dateRange);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['teacher-reports'] });
    await queryClient.invalidateQueries({ queryKey: ['period-comparison'] });
    setRefreshing(false);
  }, [queryClient]);

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

  const pulse = classPulse.data;

  // Compute score trend labels for ScoreSnapshotRow
  const compMem = pulse?.scores?.value ?? 0; // This is the composite, we need individual scores
  const analytics = pulse; // pulse contains the health metrics

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

        {/* Section 1: Pulse Card */}
        <View style={styles.section}>
          <PulseCard
            status={pulse?.status ?? 'green'}
            message={pulse?.message ?? t('insights.noData')}
            isLoading={classPulse.isLoading}
          />
        </View>

        {/* Section 2: Health Indicator Row */}
        <View style={styles.healthRow}>
          {pulse && (
            <>
              <HealthIndicator
                metric={pulse.attendance}
                onPress={() => setBottomSheet('attendance')}
              />
              <HealthIndicator
                metric={pulse.scores}
                onPress={() => setBottomSheet('scores')}
              />
              <HealthIndicator metric={pulse.engagement} />
            </>
          )}
        </View>

        {/* Section 3: Insight Action Cards */}
        {pulse && (
          <View style={styles.section}>
            {pulse.insights.map((insight) => (
              <View key={insight.id} style={styles.insightCardWrapper}>
                <InsightActionCard
                  insight={insight}
                  onPress={
                    insight.actionRoute
                      ? () => router.push(insight.actionRoute as any)
                      : undefined
                  }
                />
              </View>
            ))}
          </View>
        )}

        {/* Section 4: Score Snapshot Rings */}
        <View style={styles.section}>
          <ScoreSnapshotRow
            memorization={scoreTrend.data?.[scoreTrend.data.length - 1]?.memorization ?? 0}
            tajweed={scoreTrend.data?.[scoreTrend.data.length - 1]?.tajweed ?? 0}
            recitation={scoreTrend.data?.[scoreTrend.data.length - 1]?.recitation ?? 0}
            memTrend={scoreTrend.data && scoreTrend.data.length >= 2
              ? getTrendDirection(
                  scoreTrend.data[scoreTrend.data.length - 1].memorization,
                  scoreTrend.data[0].memorization,
                  0.3,
                )
              : 'steady'}
            tajTrend={scoreTrend.data && scoreTrend.data.length >= 2
              ? getTrendDirection(
                  scoreTrend.data[scoreTrend.data.length - 1].tajweed,
                  scoreTrend.data[0].tajweed,
                  0.3,
                )
              : 'steady'}
            recTrend={scoreTrend.data && scoreTrend.data.length >= 2
              ? getTrendDirection(
                  scoreTrend.data[scoreTrend.data.length - 1].recitation,
                  scoreTrend.data[0].recitation,
                  0.3,
                )
              : 'steady'}
            memTrendLabel={scoreTrend.data && scoreTrend.data.length >= 2
              ? formatTrendLabel(
                  scoreTrend.data[scoreTrend.data.length - 1].memorization,
                  scoreTrend.data[0].memorization,
                  'score',
                )
              : '--'}
            tajTrendLabel={scoreTrend.data && scoreTrend.data.length >= 2
              ? formatTrendLabel(
                  scoreTrend.data[scoreTrend.data.length - 1].tajweed,
                  scoreTrend.data[0].tajweed,
                  'score',
                )
              : '--'}
            recTrendLabel={scoreTrend.data && scoreTrend.data.length >= 2
              ? formatTrendLabel(
                  scoreTrend.data[scoreTrend.data.length - 1].recitation,
                  scoreTrend.data[0].recitation,
                  'score',
                )
              : '--'}
            isLoading={scoreTrend.isLoading}
          />
        </View>

        {/* Section 5: Students At A Glance */}
        <View style={styles.section}>
          <StudentStatusGrid
            students={pulse?.students ?? []}
            onStudentPress={(id) => router.push(`/(teacher)/students/${id}` as any)}
            isLoading={classPulse.isLoading}
          />
        </View>
      </View>

      {/* Bottom Sheet: Attendance Trend */}
      <MetricBottomSheet
        title={t('insights.metric.attendance')}
        subtitle={pulse?.attendance.displayValue}
        isOpen={bottomSheet === 'attendance'}
        onClose={() => setBottomSheet(null)}
      >
        <Sparkline
          data={(attendanceTrend.data ?? []).map((p) => p.rate)}
          height={normalize(120)}
        />
      </MetricBottomSheet>

      {/* Bottom Sheet: Score Trend */}
      <MetricBottomSheet
        title={t('insights.metric.scores')}
        subtitle={pulse?.scores.displayValue}
        isOpen={bottomSheet === 'scores'}
        onClose={() => setBottomSheet(null)}
      >
        <Sparkline
          data={(scoreTrend.data ?? []).map(
            (p) => (p.memorization + p.tajweed + p.recitation) / 3,
          )}
          color="#14B8A6"
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
  healthRow: {
    flexDirection: 'row',
    gap: spacing.sm,
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
