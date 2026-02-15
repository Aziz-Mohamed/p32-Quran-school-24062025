import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CartesianChart, Line } from 'victory-native';
import { useTranslation } from 'react-i18next';

import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { lightTheme } from '@/theme/colors';
import { normalize } from '@/theme/normalize';
import { ChartContainer } from './ChartContainer';
import { ChartLegend, type LegendItem } from './ChartLegend';
import type { ChildScoreTrendPoint } from '../types/reports.types';

// Chart colors per NFR-002
const COLORS = {
  memorization: '#0D9488',
  tajweed: '#F5A623',
  recitation: '#3B82F6',
  classAvg: '#9CA3AF', // neutral gray for reference lines
} as const;

interface ChildScoreTrendChartProps {
  data: ChildScoreTrendPoint[];
  hasClass: boolean;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function ChildScoreTrendChart({
  data,
  hasClass,
  isLoading,
  isError,
  onRetry,
}: ChildScoreTrendChartProps) {
  const { t } = useTranslation();
  const isEmpty = !isLoading && !isError && data.length === 0;
  const isSinglePoint = data.length === 1;

  const chartData = data.map((point) => ({
    date: point.date,
    memorization: point.memorization,
    tajweed: point.tajweed,
    recitation: point.recitation,
    classAvgMem: point.classAvgMemorization,
    classAvgTaj: point.classAvgTajweed,
    classAvgRec: point.classAvgRecitation,
  }));

  // Build legend items — child lines + class avg reference
  const legendItems: LegendItem[] = [
    { label: t('reports.legend.memorization'), color: COLORS.memorization, lineStyle: 'solid' },
    { label: t('reports.legend.tajweed'), color: COLORS.tajweed, lineStyle: 'dashed' },
    { label: t('reports.legend.recitation'), color: COLORS.recitation, lineStyle: 'dotted' },
  ];

  if (hasClass) {
    legendItems.push({
      label: t('reports.legend.classAvg'),
      color: COLORS.classAvg,
      lineStyle: 'dashed',
    });
  }

  const yKeys = hasClass
    ? (['memorization', 'tajweed', 'recitation', 'classAvgMem', 'classAvgTaj', 'classAvgRec'] as const)
    : (['memorization', 'tajweed', 'recitation'] as const);

  return (
    <ChartContainer
      title={t('reports.scoreTrend')}
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
      {/* Edge Case 8: no class note */}
      {!hasClass && (
        <Text style={styles.noClassNote}>
          {t(
            'reports.classComparisonUnavailable',
            'Class comparison unavailable — student is not assigned to a class.',
          )}
        </Text>
      )}

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
            yKeys={[...yKeys]}
            domainPadding={{ top: 20, bottom: 10 }}
          >
            {({ points }) => (
              <>
                {/* Child score lines */}
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
                {/* Class average reference lines (dashed gray) */}
                {hasClass && 'classAvgMem' in points && (
                  <>
                    <Line
                      points={points.classAvgMem}
                      color={COLORS.classAvg}
                      strokeWidth={1.5}
                      curveType="natural"
                    />
                    <Line
                      points={points.classAvgTaj}
                      color={COLORS.classAvg}
                      strokeWidth={1.5}
                      curveType="natural"
                    />
                    <Line
                      points={points.classAvgRec}
                      color={COLORS.classAvg}
                      strokeWidth={1.5}
                      curveType="natural"
                    />
                  </>
                )}
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
    height: normalize(220),
  },
  noClassNote: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: lightTheme.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  singlePointContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: normalize(200),
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
