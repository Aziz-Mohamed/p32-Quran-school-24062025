import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import type { RubCoverage } from '../utils/rub-coverage';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { normalize } from '@/theme/normalize';

// ─── Layout ──────────────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLUMNS = 3;
const HORIZONTAL_PADDING = spacing.lg * 2;
const GAP = spacing.sm;
export const BLOCK_SIZE = Math.floor(
  (SCREEN_WIDTH - HORIZONTAL_PADDING - (COLUMNS - 1) * GAP) / COLUMNS,
);

// Usable fill height (block minus top + bottom border)
const BORDER_W = 1.5;
const FILL_HEIGHT = BLOCK_SIZE - BORDER_W * 2;

// ─── Palettes ────────────────────────────────────────────────────────────────

// In-progress: warm terracotta — block being cast
const CLAY = {
  border: '#C2725B',
  bg: '#FDF6F3',
  fill: '#C2725B',
  fillHighlight: '#D4907D',
};

// Complete: emerald — block ready for the wall
const STONE = {
  border: '#22C55E',
  bg: '#F0FDF4',
  fill: '#22C55E',
  fillHighlight: '#4ADE80',
};

// ─── Component ───────────────────────────────────────────────────────────────

interface RubBuildingBlockProps {
  coverage: RubCoverage;
  isComplete: boolean;
}

function RubBuildingBlockInner({ coverage, isComplete }: RubBuildingBlockProps) {
  const { t } = useTranslation();
  const pal = isComplete ? STONE : CLAY;

  const fillPct = useDerivedValue(() =>
    withSpring(coverage.percentage / 100, { damping: 18, stiffness: 80 }),
  );

  const filledStyle = useAnimatedStyle(() => ({
    height: Math.max(0, fillPct.value * FILL_HEIGHT),
  }));

  return (
    <View style={[styles.block, { borderColor: pal.border, backgroundColor: pal.bg }]}>
      {/* Fill — material rising from bottom */}
      <Animated.View style={[styles.fill, { backgroundColor: pal.fill }, filledStyle]}>
        <View style={[styles.fillEdge, { backgroundColor: pal.fillHighlight }]} />
      </Animated.View>

      {/* Content overlay */}
      <View style={styles.content}>
        <View style={[styles.rubNumberBadge, { backgroundColor: pal.border }]}>
          <Text style={styles.rubNumber}>{coverage.rubNumber}</Text>
        </View>

        <View style={styles.infoStrip}>
          {isComplete ? (
            <View style={styles.completeRow}>
              <Ionicons name="checkmark-circle" size={normalize(14)} color="#FFFFFF" />
              <Text style={styles.completeText}>
                {t('student.blockBuilder.ready')}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.ayahCount}>
                {coverage.memorizedAyahs}/{coverage.totalAyahs}
              </Text>
              <Text style={styles.percentLabel}>{coverage.percentage}%</Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

export const RubBuildingBlock = React.memo(
  RubBuildingBlockInner,
  (prev, next) =>
    prev.coverage.rubNumber === next.coverage.rubNumber &&
    prev.coverage.percentage === next.coverage.percentage &&
    prev.isComplete === next.isComplete,
);

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  block: {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    borderRadius: radius.xs,
    borderWidth: BORDER_W,
    overflow: 'hidden',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
  },

  // Animated fill — rises from bottom
  fill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  fillEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: normalize(2),
    opacity: 0.6,
  },

  // Content overlay
  content: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: spacing.sm,
    zIndex: 2,
  },
  rubNumberBadge: {
    borderRadius: normalize(6),
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: normalize(2),
    alignSelf: 'flex-start',
  },
  rubNumber: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(18),
    color: '#FFFFFF',
  },
  infoStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: normalize(4),
    paddingHorizontal: spacing.xs,
    paddingVertical: normalize(3),
    marginHorizontal: -spacing.sm,
    marginBottom: -spacing.sm,
  },
  ayahCount: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(12),
    color: 'rgba(255, 255, 255, 0.9)',
  },
  percentLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(14),
    color: '#FFFFFF',
  },
  completeRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(3),
  },
  completeText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(12),
    color: '#FFFFFF',
  },
});
