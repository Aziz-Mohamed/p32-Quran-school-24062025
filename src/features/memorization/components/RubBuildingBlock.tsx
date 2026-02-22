import React, { useMemo } from 'react';
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

// ─── Layout Constants ────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLUMNS = 3;
const HORIZONTAL_PADDING = spacing.lg * 2;
const GAP = spacing.sm;
export const BLOCK_SIZE = Math.floor(
  (SCREEN_WIDTH - HORIZONTAL_PADDING - (COLUMNS - 1) * GAP) / COLUMNS,
);

const COURSES = 5;
const MORTAR = normalize(2);
const EDGE = normalize(3);
const BRICK_BORDER = normalize(1);
const COURSE_HEIGHT = Math.floor(
  (BLOCK_SIZE - (COURSES + 1) * MORTAR) / COURSES,
);

// ─── Running Bond Pattern ────────────────────────────────────────────────────
// Flex values for bricks — flush rows have 3 equal bricks,
// staggered rows have half-full-full-half for the classic offset.

const FLUSH = [1, 1, 1];
const STAGGERED = [0.5, 1, 1, 0.5];

const COURSE_PATTERNS: number[][] = [
  FLUSH,     // course 0 (bottom)
  STAGGERED, // course 1
  FLUSH,     // course 2
  STAGGERED, // course 3
  FLUSH,     // course 4 (top)
];

// Deterministic shade index per brick (0 = base, 1 = darker, 2 = lighter).
// Adjacent bricks never share the same shade for subtle realism.
const SHADE_MAP: number[][] = [
  [0, 2, 1],
  [1, 0, 2, 0],
  [2, 0, 1],
  [0, 1, 0, 2],
  [1, 2, 0],
];

// ─── Palettes ────────────────────────────────────────────────────────────────

// In-progress: warm terracotta / clay tones
const CLAY = {
  shades: ['#C2725B', '#B5654E', '#CF8068'] as const, // base, dark, light
  brickLight: '#D4907D',  // top-left edge highlight
  brickDark: '#A0573F',   // bottom-right edge shadow
  mortar: '#D6CBBD',      // cream mortar
  bg: '#F5F0EB',          // warm neutral background
  ghost: '#DED5CB',       // unfilled brick placeholder
  edgeLight: '#EDE5DC',
  edgeDark: '#B09A88',
  edgeSide: '#BFA992',
};

// Complete: polished emerald stone
const STONE = {
  shades: ['#34D399', '#2BBD89', '#4DE8AA'] as const,
  brickLight: '#6EE7B7',
  brickDark: '#059669',
  mortar: '#A7E8CE',
  bg: '#ECFDF5',
  ghost: '#C3F5DA',
  edgeLight: '#A7F3D0',
  edgeDark: '#047857',
  edgeSide: '#059669',
};

// ─── Component ───────────────────────────────────────────────────────────────

interface RubBuildingBlockProps {
  coverage: RubCoverage;
  isComplete: boolean;
}

function RubBuildingBlockInner({ coverage, isComplete }: RubBuildingBlockProps) {
  const { t } = useTranslation();
  const pal = isComplete ? STONE : CLAY;

  // Pre-compute per-brick background colors from shade map
  const brickColors = useMemo(() => {
    const palette = isComplete ? STONE : CLAY;
    return COURSE_PATTERNS.map((pattern, ci) =>
      pattern.map((_, bi) => palette.shades[SHADE_MAP[ci]![bi]!]!),
    );
  }, [isComplete]);

  // Animate fill 0→1
  const fillPct = useDerivedValue(() =>
    withSpring(coverage.percentage / 100, { damping: 18, stiffness: 80 }),
  );

  const filledStyle = useAnimatedStyle(() => {
    const filled = fillPct.value * COURSES;
    const wholeCourses = Math.floor(filled);
    const partialFraction = filled - wholeCourses;
    const h =
      wholeCourses * (COURSE_HEIGHT + MORTAR) +
      partialFraction * COURSE_HEIGHT;
    return { height: Math.max(0, h) };
  });

  return (
    <View style={[styles.outer, { backgroundColor: pal.mortar }]}>
      {/* 3D beveled edges */}
      <View style={[styles.edgeTop, { backgroundColor: pal.edgeLight }]} />
      <View style={[styles.edgeBottom, { backgroundColor: pal.edgeDark }]} />
      <View style={[styles.edgeRight, { backgroundColor: pal.edgeSide }]} />

      <View style={[styles.inner, { backgroundColor: pal.bg }]}>
        {/* Ghost brick guides — faint outlines showing where bricks will go */}
        {COURSE_PATTERNS.map((pattern, ci) => (
          <View
            key={`g${ci}`}
            style={[
              styles.courseGuide,
              {
                bottom: ci * (COURSE_HEIGHT + MORTAR) + MORTAR,
                height: COURSE_HEIGHT,
              },
            ]}
          >
            {pattern.map((flex, bi) => (
              <View
                key={bi}
                style={[styles.ghostBrick, { flex, backgroundColor: pal.ghost }]}
              />
            ))}
          </View>
        ))}

        {/* Filled courses — animated rise from bottom */}
        <Animated.View style={[styles.fillContainer, filledStyle]}>
          {COURSE_PATTERNS.map((pattern, ci) => (
            <View key={`f${ci}`} style={styles.courseWrapper}>
              {ci > 0 && (
                <View style={[styles.mortarLine, { backgroundColor: pal.mortar }]} />
              )}
              <View style={styles.courseRow}>
                {pattern.map((flex, bi) => (
                  <View
                    key={bi}
                    style={[
                      styles.brick,
                      {
                        flex,
                        backgroundColor: brickColors[ci]![bi]!,
                        borderTopColor: pal.brickLight,
                        borderLeftColor: pal.brickLight,
                        borderBottomColor: pal.brickDark,
                        borderRightColor: pal.brickDark,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          ))}
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
  outer: {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    borderRadius: normalize(4),
    padding: MORTAR,
    boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.06)',
  },
  edgeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: EDGE,
    borderTopStartRadius: normalize(4),
    borderTopEndRadius: normalize(4),
    opacity: 0.7,
  },
  edgeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: EDGE,
    borderBottomStartRadius: normalize(4),
    borderBottomEndRadius: normalize(4),
    opacity: 0.4,
  },
  edgeRight: {
    position: 'absolute',
    top: EDGE,
    right: 0,
    bottom: EDGE,
    width: EDGE,
    opacity: 0.3,
  },
  inner: {
    flex: 1,
    borderRadius: normalize(2),
    overflow: 'hidden',
  },

  // Ghost brick guides
  courseGuide: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: MORTAR,
    opacity: 0.45,
  },
  ghostBrick: {
    height: '100%',
    borderRadius: normalize(1),
  },

  // Filled area
  fillContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    flexDirection: 'column-reverse',
  },
  courseWrapper: {
    width: '100%',
  },
  mortarLine: {
    height: MORTAR,
    width: '100%',
  },
  courseRow: {
    height: COURSE_HEIGHT,
    flexDirection: 'row',
    gap: MORTAR,
  },
  brick: {
    height: '100%',
    borderRadius: normalize(1),
    borderWidth: BRICK_BORDER,
    boxShadow: '0.5px 0.5px 1px rgba(0, 0, 0, 0.1)',
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
