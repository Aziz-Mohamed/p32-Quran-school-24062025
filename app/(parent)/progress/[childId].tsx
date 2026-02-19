import React, { useState, useCallback } from 'react';
import { RefreshControl, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import { spacing } from '@/theme/spacing';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { LoadingState, ErrorState } from '@/components/feedback';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'expo-router';

import { useTimePeriod } from '@/features/reports/hooks/useTimePeriod';
import {
  useChildProgressReport,
} from '@/features/reports/hooks/useParentReports';
import { TimePeriodFilter } from '@/features/reports/components/TimePeriodFilter';
import { ChildScoreTrendChart } from '@/features/reports/components/ChildScoreTrendChart';
import { ChildAttendanceSummary } from '@/features/reports/components/ChildAttendanceSummary';
import { ChildGamificationSummary } from '@/features/reports/components/ChildGamificationSummary';

import { useChildDetail } from '@/features/children/hooks/useChildren';

export default function ParentProgressScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const queryClient = useQueryClient();

  const { timePeriod, setTimePeriod, dateRange } = useTimePeriod();
  const [refreshing, setRefreshing] = useState(false);

  // Get child detail to know classId
  const childDetail = useChildDetail(childId);
  const classId = (childDetail.data?.student as any)?.class_id ?? null;

  const progressReport = useChildProgressReport(childId ?? null, classId, dateRange);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['parent-reports'] });
    setRefreshing(false);
  }, [queryClient]);

  if (childDetail.isLoading) return <LoadingState />;
  if (childDetail.error) {
    return <ErrorState description={(childDetail.error as Error).message} onRetry={() => childDetail.refetch()} />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={lightTheme.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Button
            title={t('common.back')}
            onPress={() => router.back()}
            variant="ghost"
            size="sm"
          />

          <Text style={styles.title}>{t('reports.childProgress')}</Text>

          <TimePeriodFilter value={timePeriod} onChange={setTimePeriod} />

          <ChildScoreTrendChart
            data={progressReport.data?.scoreTrend ?? []}
            hasClass={!!classId}
            isLoading={progressReport.isLoading}
            isError={progressReport.isError}
            onRetry={() => progressReport.refetch()}
          />

          <ChildAttendanceSummary
            data={progressReport.data?.attendanceSummary}
            isLoading={progressReport.isLoading}
            isError={progressReport.isError}
            onRetry={() => progressReport.refetch()}
          />

          <ChildGamificationSummary
            data={progressReport.data?.gamification}
            isLoading={progressReport.isLoading}
            isError={progressReport.isError}
            onRetry={() => progressReport.refetch()}
          />
        </View>
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
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  container: {
    padding: spacing.lg,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    marginBottom: spacing.sm,
  },
});
