import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedProps, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import type { TrendDirection } from '../types/reports.types';
import { TrendArrow } from './TrendArrow';
import { SkeletonLoader } from '@/components/feedback';
import { lightTheme, accent } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_SIZE = normalize(80);
const STROKE_WIDTH = normalize(6);
const RING_RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const SCORE_COLORS = {
  memorization: accent.teal[500],
  tajweed: accent.orange[500],
  recitation: accent.blue[500],
} as const;

interface ScoreRingProps {
  value: number; // 0-5 scale
  label: string;
  color: string;
  trend: TrendDirection;
  trendLabel: string;
}

function ScoreRing({ value, label, color, trend, trendLabel }: ScoreRingProps) {
  const progress = Math.min(value / 5, 1);
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: withTiming(strokeDashoffset, { duration: 800 }),
  }));

  return (
    <View style={styles.ringContainer}>
      <View style={styles.ringWrapper}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          {/* Background track */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={lightTheme.border}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          {/* Progress arc */}
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedProps}
            strokeLinecap="round"
            fill="none"
            rotation="-90"
            origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
          />
        </Svg>
        <View style={styles.valueOverlay}>
          <Text style={styles.valueText}>{value.toFixed(1)}</Text>
        </View>
      </View>
      <Text style={styles.ringLabel} numberOfLines={1}>{label}</Text>
      <TrendArrow direction={trend} label={trendLabel} size={normalize(12)} />
    </View>
  );
}

interface ScoreSnapshotRowProps {
  memorization: number;
  tajweed: number;
  recitation: number;
  memTrend: TrendDirection;
  tajTrend: TrendDirection;
  recTrend: TrendDirection;
  memTrendLabel: string;
  tajTrendLabel: string;
  recTrendLabel: string;
  isLoading?: boolean;
}

export function ScoreSnapshotRow({
  memorization,
  tajweed,
  recitation,
  memTrend,
  tajTrend,
  recTrend,
  memTrendLabel,
  tajTrendLabel,
  recTrendLabel,
  isLoading,
}: ScoreSnapshotRowProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <View style={styles.row}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.ringContainer}>
            <SkeletonLoader width={RING_SIZE} height={RING_SIZE} borderRadius={RING_SIZE / 2} />
            <SkeletonLoader width={60} height={12} borderRadius={radius.xs} style={{ marginTop: spacing.sm }} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('insights.scoreSnapshot')}</Text>
      <View style={styles.row}>
        <ScoreRing
          value={memorization}
          label={t('insights.dimension.memorization')}
          color={SCORE_COLORS.memorization}
          trend={memTrend}
          trendLabel={memTrendLabel}
        />
        <ScoreRing
          value={tajweed}
          label={t('insights.dimension.tajweed')}
          color={SCORE_COLORS.tajweed}
          trend={tajTrend}
          trendLabel={tajTrendLabel}
        />
        <ScoreRing
          value={recitation}
          label={t('insights.dimension.recitation')}
          color={SCORE_COLORS.recitation}
          trend={recTrend}
          trendLabel={recTrendLabel}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightTheme.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: lightTheme.border,
    padding: spacing.base,
  },
  sectionTitle: {
    ...typography.textStyles.bodyMedium,
    color: lightTheme.text,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  ringContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  ringWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    position: 'relative',
  },
  valueOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    color: lightTheme.text,
  },
  ringLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: lightTheme.textSecondary,
  },
});
