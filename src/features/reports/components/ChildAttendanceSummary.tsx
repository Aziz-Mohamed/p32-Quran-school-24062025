import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { lightTheme, colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { ChartContainer } from './ChartContainer';
import type { ChildAttendanceSummary as ChildAttendanceSummaryType } from '../types/reports.types';

interface ChildAttendanceSummaryProps {
  data: ChildAttendanceSummaryType | undefined;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function ChildAttendanceSummary({
  data,
  isLoading,
  isError,
  onRetry,
}: ChildAttendanceSummaryProps) {
  const { t } = useTranslation();
  const isEmpty = !isLoading && !isError && !data;

  // Edge Case 12: rate === -1 means zero denominator → "N/A"
  const rateDisplay =
    data && data.rate >= 0
      ? `${data.rate}%`
      : t('reports.childAttendance.notAvailable', 'N/A');

  const rateColor =
    data && data.rate >= 0
      ? data.rate >= 80
        ? colors.semantic.success
        : data.rate >= 60
          ? colors.semantic.warning
          : colors.semantic.error
      : lightTheme.textSecondary;

  return (
    <ChartContainer
      title={t('reports.childAttendance.rate', 'Attendance Rate')}
      isLoading={isLoading}
      isEmpty={isEmpty}
      isError={isError}
      onRetry={onRetry}
      emptyMessage={t(
        'reports.empty.attendanceTrend',
        'No attendance data yet — start marking attendance to see trends.',
      )}
    >
      {data && (
        <>
          {/* Rate display */}
          <View style={styles.rateContainer}>
            <Text style={[styles.rateValue, { color: rateColor }]}>
              {rateDisplay}
            </Text>
          </View>

          {/* Stat grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{data.totalDays}</Text>
              <Text style={styles.statLabel}>
                {t('reports.childAttendance.totalDays', 'Total Days')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.semantic.success }]}>
                {data.presentDays}
              </Text>
              <Text style={styles.statLabel}>
                {t('reports.childAttendance.present', 'Present')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.semantic.error }]}>
                {data.absentDays}
              </Text>
              <Text style={styles.statLabel}>
                {t('reports.childAttendance.absent', 'Absent')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.semantic.warning }]}>
                {data.lateDays}
              </Text>
              <Text style={styles.statLabel}>
                {t('reports.childAttendance.late', 'Late')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{data.excusedDays}</Text>
              <Text style={styles.statLabel}>
                {t('reports.childAttendance.excused', 'Excused')}
              </Text>
            </View>
          </View>
        </>
      )}
    </ChartContainer>
  );
}

const styles = StyleSheet.create({
  rateContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rateValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize['3xl'],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statItem: {
    flex: 1,
    minWidth: 60,
    alignItems: 'center',
    backgroundColor: lightTheme.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  statValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: lightTheme.text,
  },
  statLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: lightTheme.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
});
