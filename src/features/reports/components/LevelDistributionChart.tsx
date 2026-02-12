import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CartesianChart, Bar } from 'victory-native';
import { useTranslation } from 'react-i18next';

import { colors } from '@/theme/colors';
import { ChartContainer } from './ChartContainer';
import type { LevelDistributionBucket } from '../types/reports.types';

interface LevelDistributionChartProps {
  data: LevelDistributionBucket[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function LevelDistributionChart({
  data,
  isLoading,
  isError,
  onRetry,
}: LevelDistributionChartProps) {
  const { t } = useTranslation();
  const isEmpty = !isLoading && !isError && data.length === 0;

  const chartData = data.map((bucket) => ({
    level: bucket.title,
    count: bucket.count,
  }));

  const totalStudents = data.reduce((sum, b) => sum + b.count, 0);

  return (
    <ChartContainer
      title={t('reports.levelDistribution', 'Level Distribution')}
      isLoading={isLoading}
      isEmpty={isEmpty}
      isError={isError}
      onRetry={onRetry}
      emptyMessage={t(
        'reports.empty.levelDistribution',
        'No students enrolled yet.',
      )}
      accessibilityLabel={t(
        'reports.a11y.levelDistribution',
        'Level distribution chart showing {{count}} students across {{levels}} levels',
        { count: totalStudents, levels: data.length },
      )}
    >
      <View style={styles.chartWrapper}>
        <CartesianChart
          data={chartData}
          xKey="level"
          yKeys={['count']}
          domainPadding={{ top: 20, bottom: 10 }}
        >
          {({ points, chartBounds }) => (
            <Bar
              points={points.count}
              chartBounds={chartBounds}
              color={colors.primary[500]}
              roundedCorners={{ topLeft: 4, topRight: 4 }}
            />
          )}
        </CartesianChart>
      </View>
    </ChartContainer>
  );
}

const styles = StyleSheet.create({
  chartWrapper: {
    height: 200,
  },
});
