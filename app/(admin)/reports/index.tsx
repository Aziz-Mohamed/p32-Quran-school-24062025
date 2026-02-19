import React, { useState, useCallback } from 'react';
import { I18nManager, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { spacing } from '@/theme/spacing';
import { lightTheme, colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

import { useTimePeriod } from '@/features/reports/hooks/useTimePeriod';
import {
  useSchoolKPIs,
  useAttendanceTrend,
  useScoreDistribution,
  useLevelDistribution,
} from '@/features/reports/hooks/useAdminReports';

import { TimePeriodFilter } from '@/features/reports/components/TimePeriodFilter';
import { ClassFilter } from '@/features/reports/components/ClassFilter';
import { KPIGrid } from '@/features/reports/components/KPIGrid';
import { AttendanceTrendChart } from '@/features/reports/components/AttendanceTrendChart';
import { ScoreDistributionChart } from '@/features/reports/components/ScoreDistributionChart';
import { LevelDistributionChart } from '@/features/reports/components/LevelDistributionChart';

import { supabase } from '@/lib/supabase';

export default function AdminReportsScreen() {
  const { t } = useTranslation();
  const { schoolId } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { timePeriod, setTimePeriod, dateRange } = useTimePeriod();
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>();
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load classes for filter
  React.useEffect(() => {
    if (!schoolId) return;
    supabase
      .from('classes')
      .select('id, name')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        if (data) setClasses(data);
      });
  }, [schoolId]);

  const kpis = useSchoolKPIs(schoolId, dateRange);
  const attendanceTrend = useAttendanceTrend(schoolId, dateRange, selectedClassId);
  const scoreDistribution = useScoreDistribution(schoolId, dateRange, selectedClassId);
  const levelDistribution = useLevelDistribution(schoolId, selectedClassId);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    setRefreshing(false);
  }, [queryClient]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Button
          title={t('common.back')}
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
        />

        <Text style={styles.title}>{t('reports.title')}</Text>

        <TimePeriodFilter value={timePeriod} onChange={setTimePeriod} />

        <KPIGrid data={kpis.data} isLoading={kpis.isLoading} />

        <View style={styles.filterRow}>
          <ClassFilter
            classes={classes}
            selectedClassId={selectedClassId}
            onSelect={setSelectedClassId}
          />
        </View>

        <AttendanceTrendChart
          data={attendanceTrend.data ?? []}
          isLoading={attendanceTrend.isLoading}
          isError={attendanceTrend.isError}
          onRetry={() => attendanceTrend.refetch()}
        />

        <ScoreDistributionChart
          data={scoreDistribution.data ?? []}
          isLoading={scoreDistribution.isLoading}
          isError={scoreDistribution.isError}
          onRetry={() => scoreDistribution.refetch()}
        />

        <LevelDistributionChart
          data={levelDistribution.data ?? []}
          isLoading={levelDistribution.isLoading}
          isError={levelDistribution.isError}
          onRetry={() => levelDistribution.refetch()}
        />

        {/* Teacher Activity Navigation Link */}
        <Card
          variant="outlined"
          style={styles.navCard}
          onPress={() => router.push('/(admin)/reports/teacher-activity')}
        >
          <View style={styles.navRow}>
            <Ionicons name="people-outline" size={24} color={colors.primary[500]} />
            <Text style={styles.navText}>
              {t('reports.teacherActivity')}
            </Text>
            <Ionicons name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"} size={20} color={lightTheme.textTertiary} />
          </View>
        </Card>

        {/* Teacher Attendance Report */}
        <Card
          variant="outlined"
          style={styles.navCard}
          onPress={() => router.push('/(admin)/reports/teacher-attendance')}
        >
          <View style={styles.navRow}>
            <Ionicons name="time-outline" size={24} color={colors.primary[500]} />
            <Text style={styles.navText}>
              {t('reports.teacherAttendanceReport.title')}
            </Text>
            <Ionicons name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"} size={20} color={lightTheme.textTertiary} />
          </View>
        </Card>

        {/* Session Completion Report */}
        <Card
          variant="outlined"
          style={styles.navCard}
          onPress={() => router.push('/(admin)/reports/session-completion')}
        >
          <View style={styles.navRow}>
            <Ionicons name="checkmark-done-outline" size={24} color={colors.primary[500]} />
            <Text style={styles.navText}>
              {t('reports.sessionCompletion.title')}
            </Text>
            <Ionicons name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"} size={20} color={lightTheme.textTertiary} />
          </View>
        </Card>

        {/* Memorization Report */}
        <Card
          variant="outlined"
          style={styles.navCard}
          onPress={() => router.push('/(admin)/reports/memorization')}
        >
          <View style={styles.navRow}>
            <Ionicons name="book-outline" size={24} color={colors.primary[500]} />
            <Text style={styles.navText}>
              {t('reports.memorization.title')}
            </Text>
            <Ionicons name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"} size={20} color={lightTheme.textTertiary} />
          </View>
        </Card>
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
  navCard: {
    marginTop: spacing.sm,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  navText: {
    ...typography.textStyles.body,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.medium,
    flex: 1,
  },
});
