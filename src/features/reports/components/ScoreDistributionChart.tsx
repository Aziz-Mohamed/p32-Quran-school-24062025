import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CartesianChart, Bar } from 'victory-native';
import { useTranslation } from 'react-i18next';

import { normalize } from '@/theme/normalize';
import { ChartContainer } from './ChartContainer';
import { ChartLegend, type LegendItem } from './ChartLegend';
import type { ScoreDistributionBucket } from '../types/reports.types';

const RANGE_COLORS: Record<string, string> = {
  '1-2': '#EF4444', // red
  '2-3': '#F59E0B', // amber
  '3-4': '#3B82F6', // blue
  '4-5': '#22C55E', // green
};

interface ScoreDistributionChartProps {
  data: ScoreDistributionBucket[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function ScoreDistributionChart({
  data,
  isLoading,
  isError,
  onRetry,
}: ScoreDistributionChartProps) {
  const { t } = useTranslation();
  const isEmpty = !isLoading && !isError && data.every((b) => b.count === 0);

  const chartData = data.map((bucket) => ({
    range: bucket.range,
    count: bucket.count,
    color: RANGE_COLORS[bucket.range] ?? '#9CA3AF',
  }));

  const legendItems: LegendItem[] = data.map((bucket) => ({
    label: bucket.label,
    color: RANGE_COLORS[bucket.range] ?? '#9CA3AF',
  }));

  const totalStudents = data.reduce((sum, b) => sum + b.count, 0);

  return (
    <ChartContainer
      title={t('reports.scoreDistribution')}
      isLoading={isLoading}
      isEmpty={isEmpty}
      isError={isError}
      onRetry={onRetry}
      emptyMessage={t(
        'reports.empty.scoreDistribution',
        'No session scores recorded in this period.',
      )}
      accessibilityLabel={t(
        'reports.a11y.scoreDistribution',
        'Score distribution chart showing {{count}} students across 4 performance ranges',
        { count: totalStudents },
      )}
    >
      <View style={styles.chartWrapper}>
        <CartesianChart
          data={chartData}
          xKey="range"
          yKeys={['count']}
          domainPadding={{ top: 20, bottom: 10 }}
        >
          {({ points, chartBounds }) => (
            <Bar
              points={points.count}
              chartBounds={chartBounds}
              color={RANGE_COLORS['3-4']}
              roundedCorners={{ topLeft: 4, topRight: 4 }}
            />
          )}
        </CartesianChart>
      </View>
      <ChartLegend items={legendItems} />
    </ChartContainer>
  );
}

const styles = StyleSheet.create({
  chartWrapper: {
    height: normalize(200),
  },
});
