import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CartesianChart, Line } from 'victory-native';
import { useTranslation } from 'react-i18next';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { lightTheme } from '@/theme/colors';
import { ChartContainer } from './ChartContainer';
import type { AttendanceTrendPoint } from '../types/reports.types';

interface AttendanceTrendChartProps {
  data: AttendanceTrendPoint[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function AttendanceTrendChart({
  data,
  isLoading,
  isError,
  onRetry,
}: AttendanceTrendChartProps) {
  const { t } = useTranslation();
  const isEmpty = !isLoading && !isError && data.length === 0;
  const isSinglePoint = data.length === 1;

  const chartData = data.map((point) => ({
    date: point.date,
    rate: point.rate,
  }));

  const avgRate = data.length > 0
    ? Math.round(data.reduce((sum, p) => sum + p.rate, 0) / data.length)
    : 0;

  return (
    <ChartContainer
      title={t('reports.attendanceTrend')}
      isLoading={isLoading}
      isEmpty={isEmpty}
      isError={isError}
      onRetry={onRetry}
      emptyMessage={t(
        'reports.empty.attendanceTrend',
        'No attendance data yet — start marking attendance to see trends.',
      )}
      accessibilityLabel={t(
        'reports.a11y.attendanceTrend',
        'Attendance trend chart showing {{rate}}% average attendance over {{count}} periods',
        { rate: avgRate, count: data.length },
      )}
    >
      {isSinglePoint ? (
        <View style={styles.singlePointContainer}>
          <Text style={styles.singlePointValue}>{data[0].rate}%</Text>
          <Text style={styles.singlePointNote}>
            {t(
              'reports.singleDataPoint',
              'Only one data point — more data is needed for trend analysis.',
            )}
          </Text>
        </View>
      ) : (
        <View style={styles.chartWrapper}>
          <CartesianChart
            data={chartData}
            xKey="date"
            yKeys={['rate']}
            domainPadding={{ top: 20, bottom: 10 }}
          >
            {({ points }) => (
              <Line
                points={points.rate}
                color={colors.semantic.success}
                strokeWidth={2}
                curveType="natural"
              />
            )}
          </CartesianChart>
        </View>
      )}
    </ChartContainer>
  );
}

const styles = StyleSheet.create({
  chartWrapper: {
    height: 200,
  },
  singlePointContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  singlePointValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize['2xl'],
    color: colors.semantic.success,
  },
  singlePointNote: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: lightTheme.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
});
