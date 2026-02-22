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

// 3D depth — thickness of the visible top and side faces
const DEPTH = normalize(6);

// Front face height (where the fill animation happens)
const FRONT_HEIGHT = BLOCK_SIZE - DEPTH;

// ─── Palettes ────────────────────────────────────────────────────────────────

// In-progress: warm terracotta clay being cast
const CLAY = {
  topFace: '#D9A08F',       // lit top surface (lighter terracotta)
  sideFace: '#A0573F',      // shadow side (darker terracotta)
  corner: '#C2725B',        // top-right corner where faces meet
  fill: '#C2725B',          // main terracotta fill
  fillHighlight: '#D4907D', // wet surface highlight at fill line
  bg: '#F5F0EB',            // empty/unfilled interior
  frame: '#E8DDD4',         // subtle border on front face
};

// Complete: solid emerald stone block
const STONE = {
  topFace: '#6EE7B7',
  sideFace: '#059669',
  corner: '#34D399',
  fill: '#34D399',
  fillHighlight: '#86EFAC',
  bg: '#ECFDF5',
  frame: '#D1FAE5',
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
    height: Math.max(0, fillPct.value * FRONT_HEIGHT),
  }));

  return (
    <View style={[styles.wrapper, { backgroundColor: pal.topFace }]}>
      {/* Corner shade — transition where top face meets side face */}
      <View style={[styles.topCorner, { backgroundColor: pal.corner }]} />

      {/* Side face — 3D shadow side */}
      <View style={[styles.sideFace, { backgroundColor: pal.sideFace }]} />

      {/* Front face — main visible face with fill animation */}
      <View style={[styles.frontFace, { backgroundColor: pal.bg, borderColor: pal.frame }]}>
        {/* Fill — material rising from bottom */}
        <Animated.View style={[styles.fill, { backgroundColor: pal.fill }, filledStyle]}>
          <View style={[styles.fillEdge, { backgroundColor: pal.fillHighlight }]} />
        </Animated.View>

        {/* Content overlay */}
        <View style={styles.content}>
          <View style={styles.rubNumberBadge}>
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
    borderRadius: normalize(3),
    boxShadow: '2px 3px 6px rgba(0, 0, 0, 0.15)',
  },

  // Corner where top face meets side face
  topCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: DEPTH,
    height: DEPTH,
    borderTopEndRadius: normalize(3),
    opacity: 0.6,
  },

  // Right side face — darker, in shadow
  sideFace: {
    position: 'absolute',
    top: DEPTH,
    right: 0,
    bottom: 0,
    width: DEPTH,
    borderBottomEndRadius: normalize(3),
  },

  // Front face — below top face, left of side face
  frontFace: {
    position: 'absolute',
    top: DEPTH,
    left: 0,
    right: DEPTH,
    bottom: 0,
    borderBottomStartRadius: normalize(3),
    borderWidth: normalize(1),
    borderTopWidth: 0,
    borderEndWidth: 0,
    overflow: 'hidden',
  },

  // Animated fill — solid material rising from bottom
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
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: normalize(4),
    paddingHorizontal: spacing.xs,
    paddingVertical: normalize(1),
    alignSelf: 'flex-start',
  },
  rubNumber: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(22),
    color: '#FFFFFF',
  },
  infoStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: normalize(3),
    paddingHorizontal: spacing.xs,
    paddingVertical: normalize(2),
    marginHorizontal: -spacing.sm,
    marginBottom: -spacing.sm,
  },
  ayahCount: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(12),
    color: 'rgba(255, 255, 255, 0.85)',
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
