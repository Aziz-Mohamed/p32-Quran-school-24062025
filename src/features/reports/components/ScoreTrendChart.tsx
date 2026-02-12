import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CartesianChart, Line } from 'victory-native';
import { useTranslation } from 'react-i18next';

import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { lightTheme } from '@/theme/colors';
import { ChartContainer } from './ChartContainer';
import { ChartLegend } from './ChartLegend';
import type { ScoreTrendPoint } from '../types/reports.types';

// Chart colors per NFR-002 and research.md
const COLORS = {
  memorization: '#0D9488', // teal - solid
  tajweed: '#F5A623', // gold - dashed
  recitation: '#3B82F6', // blue - dotted
} as const;

interface ScoreTrendChartProps {
  data: ScoreTrendPoint[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function ScoreTrendChart({
  data,
  isLoading,
  isError,
  onRetry,
}: ScoreTrendChartProps) {
  const { t } = useTranslation();
  const isEmpty = !isLoading && !isError && data.length === 0;
  const isSinglePoint = data.length === 1;

  const chartData = data.map((point) => ({
    date: point.date,
    memorization: point.memorization,
    tajweed: point.tajweed,
    recitation: point.recitation,
  }));

  const legendItems = [
    { label: t('reports.legend.memorization', 'Memorization'), color: COLORS.memorization, lineStyle: 'solid' as const },
    { label: t('reports.legend.tajweed', 'Tajweed'), color: COLORS.tajweed, lineStyle: 'dashed' as const },
    { label: t('reports.legend.recitation', 'Recitation'), color: COLORS.recitation, lineStyle: 'dotted' as const },
  ];

  return (
    <ChartContainer
      title={t('reports.scoreTrend', 'Score Trend')}
      isLoading={isLoading}
      isEmpty={isEmpty}
      isError={isError}
      onRetry={onRetry}
      emptyMessage={t(
        'reports.empty.scoreTrend',
        'No sessions logged yet — scores will appear after sessions are recorded.',
      )}
      accessibilityLabel={t(
        'reports.a11y.scoreTrend',
        'Score trend chart showing memorization, tajweed, and recitation scores over {{count}} periods',
        { count: data.length },
      )}
    >
      {isSinglePoint ? (
        <View style={styles.singlePointContainer}>
          <View style={styles.singlePointScores}>
            <Text style={[styles.singlePointValue, { color: COLORS.memorization }]}>
              {data[0].memorization.toFixed(1)}
            </Text>
            <Text style={[styles.singlePointValue, { color: COLORS.tajweed }]}>
              {data[0].tajweed.toFixed(1)}
            </Text>
            <Text style={[styles.singlePointValue, { color: COLORS.recitation }]}>
              {data[0].recitation.toFixed(1)}
            </Text>
          </View>
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
            yKeys={['memorization', 'tajweed', 'recitation']}
            domainPadding={{ top: 20, bottom: 10 }}
          >
            {({ points }) => (
              <>
                <Line
                  points={points.memorization}
                  color={COLORS.memorization}
                  strokeWidth={2}
                  curveType="natural"
                />
                <Line
                  points={points.tajweed}
                  color={COLORS.tajweed}
                  strokeWidth={2}
                  curveType="natural"
                />
                <Line
                  points={points.recitation}
                  color={COLORS.recitation}
                  strokeWidth={2}
                  curveType="natural"
                />
              </>
            )}
          </CartesianChart>
        </View>
      )}
      <ChartLegend items={legendItems} />
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
  singlePointScores: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  singlePointValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize['2xl'],
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
