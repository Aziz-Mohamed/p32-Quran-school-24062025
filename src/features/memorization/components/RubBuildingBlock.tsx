import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedProps,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

import type { RubCoverage } from '../utils/rub-coverage';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { normalize } from '@/theme/normalize';

interface RubBuildingBlockProps {
  coverage: RubCoverage;
  isComplete: boolean;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLUMNS = 3;
const HORIZONTAL_PADDING = spacing.lg * 2;
const GAP = spacing.sm;
export const BLOCK_SIZE = Math.floor(
  (SCREEN_WIDTH - HORIZONTAL_PADDING - (COLUMNS - 1) * GAP) / COLUMNS,
);

const CIRCLE_SIZE = normalize(44);
const STROKE_WIDTH = normalize(4);
const CIRCLE_RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function RubBuildingBlock({ coverage, isComplete }: RubBuildingBlockProps) {
  const { t } = useTranslation();

  const accentColor = isComplete ? colors.primary[500] : colors.accent.indigo[500];
  const bgColor = isComplete ? '#DCFCE7' : colors.neutral[50];
  const borderColor = isComplete ? colors.primary[500] : colors.accent.indigo[100];

  const progress = useDerivedValue(() =>
    withSpring(coverage.percentage / 100, { damping: 20, stiffness: 90 }),
  );

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <View style={[styles.block, { backgroundColor: bgColor, borderColor }]}>
      {/* Circular progress */}
      <View style={styles.circleContainer}>
        {isComplete ? (
          <View style={[styles.completeBadge, { backgroundColor: colors.primary[500] }]}>
            <Ionicons name="checkmark" size={normalize(22)} color="#FFFFFF" />
          </View>
        ) : (
          <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
            {/* Background track */}
            <Circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={CIRCLE_RADIUS}
              stroke={colors.neutral[200]}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            {/* Animated progress arc */}
            <AnimatedCircle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={CIRCLE_RADIUS}
              stroke={accentColor}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              animatedProps={animatedProps}
              strokeLinecap="round"
              rotation={-90}
              origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
            />
          </Svg>
        )}
        {!isComplete && (
          <Text style={[styles.percentText, { color: accentColor }]}>
            {coverage.percentage}%
          </Text>
        )}
      </View>

      {/* Labels */}
      <Text style={styles.rubLabel} numberOfLines={1}>
        {t('gamification.rub')} {coverage.rubNumber}
      </Text>
      <Text style={styles.juzLabel} numberOfLines={1}>
        {isComplete
          ? t('student.blockBuilder.ready')
          : `${coverage.memorizedAyahs}/${coverage.totalAyahs}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(4),
    padding: spacing.xs,
  },
  circleContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBadge: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    position: 'absolute',
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(12),
  },
  rubLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(12),
    color: colors.neutral[900],
    textAlign: 'center',
  },
  juzLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(10),
    color: colors.neutral[500],
    textAlign: 'center',
  },
});
