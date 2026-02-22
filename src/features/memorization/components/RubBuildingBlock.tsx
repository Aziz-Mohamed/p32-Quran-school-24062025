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
import { normalize } from '@/theme/normalize';

// ─── Layout ──────────────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLUMNS = 3;
const HORIZONTAL_PADDING = spacing.lg * 2;
const GAP = spacing.sm;
export const BLOCK_SIZE = Math.floor(
  (SCREEN_WIDTH - HORIZONTAL_PADDING - (COLUMNS - 1) * GAP) / COLUMNS,
);

// Isometric depth — thickness of the top and side faces
const DEPTH = normalize(10);
const FACE_SIZE = BLOCK_SIZE - DEPTH;

// ─── Colors (matches journey tab green palette) ──────────────────────────────

const TOP_FACE = '#4ADE80';    // green-400 — lit from above
const SIDE_FACE = '#16A34A';   // green-600 — in shadow
const FILL = '#22C55E';        // green-500 — same as journey "fresh"
const FILL_EDGE = '#4ADE80';   // green-400 — surface highlight
const FACE_BG = '#F0FDF4';     // green-50  — empty interior
const FACE_BORDER = '#BBF7D0'; // green-200 — subtle front face border

// ─── Component ───────────────────────────────────────────────────────────────

interface RubBuildingBlockProps {
  coverage: RubCoverage;
  isComplete: boolean;
}

function RubBuildingBlockInner({ coverage, isComplete }: RubBuildingBlockProps) {
  const { t } = useTranslation();

  const fillPct = useDerivedValue(() =>
    withSpring(coverage.percentage / 100, { damping: 18, stiffness: 80 }),
  );

  const filledStyle = useAnimatedStyle(() => ({
    height: Math.max(0, fillPct.value * FACE_SIZE),
  }));

  return (
    <View style={styles.wrapper}>
      {/* Top face — lit surface, skewed into a parallelogram */}
      <View style={styles.topFace} />

      {/* Right face — shadow side, skewed into a parallelogram */}
      <View style={styles.rightFace} />

      {/* Front face — main visible face with fill animation */}
      <View style={styles.frontFace}>
        {/* Green fill rising from bottom */}
        <Animated.View style={[styles.fill, filledStyle]}>
          <View style={styles.fillEdge} />
        </Animated.View>

        {/* Content overlay */}
        <View style={styles.content}>
          <View style={styles.rubNumberBadge}>
            <Text style={styles.rubNumber}>{coverage.rubNumber}</Text>
          </View>

          <View style={styles.infoStrip}>
            {isComplete ? (
              <View style={styles.completeRow}>
                <Ionicons name="checkmark-circle" size={normalize(14)} color="#15803D" />
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
  wrapper: {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
  },

  // Isometric top face — parallelogram via skewX, anchored at bottom-left
  topFace: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: FACE_SIZE,
    height: DEPTH,
    backgroundColor: TOP_FACE,
    transform: [{ skewX: '-45deg' }],
    transformOrigin: 'left bottom',
  },

  // Isometric right face — parallelogram via skewY, anchored at top-left
  rightFace: {
    position: 'absolute',
    left: FACE_SIZE,
    top: DEPTH,
    width: DEPTH,
    height: FACE_SIZE,
    backgroundColor: SIDE_FACE,
    transform: [{ skewY: '-45deg' }],
    transformOrigin: 'left top',
  },

  // Front face — the main square where content lives
  frontFace: {
    position: 'absolute',
    left: 0,
    top: DEPTH,
    width: FACE_SIZE,
    height: FACE_SIZE,
    backgroundColor: FACE_BG,
    borderWidth: 1,
    borderColor: FACE_BORDER,
    overflow: 'hidden',
    boxShadow: '1px 2px 4px rgba(0, 0, 0, 0.08)',
  },

  // Animated fill
  fill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: FILL,
  },
  fillEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: normalize(2),
    backgroundColor: FILL_EDGE,
    opacity: 0.7,
  },

  // Content overlay
  content: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: spacing.sm,
    zIndex: 2,
  },
  rubNumberBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: normalize(6),
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: normalize(2),
    alignSelf: 'flex-start',
  },
  rubNumber: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(18),
    color: '#15803D', // green-700
  },
  infoStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: normalize(4),
    paddingHorizontal: spacing.xs,
    paddingVertical: normalize(3),
    marginHorizontal: -spacing.sm,
    marginBottom: -spacing.sm,
  },
  ayahCount: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(12),
    color: '#166534', // green-800
  },
  percentLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(14),
    color: '#15803D', // green-700
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
    color: '#15803D', // green-700
  },
});
