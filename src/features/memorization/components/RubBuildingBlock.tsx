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

// How many brick-course rows fit in the block
const COURSES = 5;
const MORTAR = normalize(2);
const COURSE_HEIGHT = Math.floor(
  (BLOCK_SIZE - (COURSES + 1) * MORTAR) / COURSES,
);

// ─── Palette ─────────────────────────────────────────────────────────────────

// In-progress: warm terracotta / clay tones
const CLAY = {
  brick: '#C2725B',      // warm terracotta
  brickLight: '#D4907D', // lighter face highlight
  brickDark: '#A0573F',  // shadow / side face
  mortar: '#E8DDD4',     // cream mortar between bricks
  bg: '#F5F0EB',         // warm neutral background (empty area)
  empty: '#E5DDD5',      // unfilled course placeholder
  text: '#7C4A36',       // warm brown text
  textLight: '#A0806F',  // secondary text
};

// Complete: polished emerald stone
const STONE = {
  brick: '#34D399',      // emerald-400
  brickLight: '#6EE7B7', // emerald-300 highlight
  brickDark: '#059669',  // emerald-600 shadow
  mortar: '#D1FAE5',     // green-100 mortar
  bg: '#ECFDF5',         // green-50
  empty: '#D1FAE5',      // not used — all filled
  text: '#065F46',       // emerald-900
  textLight: '#047857',  // emerald-700
};

export function RubBuildingBlock({ coverage, isComplete }: RubBuildingBlockProps) {
  const { t } = useTranslation();
  const pal = isComplete ? STONE : CLAY;

  // Animate 0→1
  const fillPct = useDerivedValue(() =>
    withSpring(coverage.percentage / 100, { damping: 18, stiffness: 80 }),
  );

  // How many courses are fully "laid" (integer)
  const filledStyle = useAnimatedStyle(() => {
    const filled = fillPct.value * COURSES;
    const wholeCourses = Math.floor(filled);
    // Height = whole courses * (courseHeight + mortar) + partial course
    const partialFraction = filled - wholeCourses;
    const h =
      wholeCourses * (COURSE_HEIGHT + MORTAR) +
      partialFraction * COURSE_HEIGHT;
    return { height: Math.max(0, h) };
  });

  return (
    <View style={[styles.outer, { backgroundColor: pal.mortar }]}>
      {/* 3D top-left highlight edge */}
      <View style={[styles.edgeTop, { backgroundColor: isComplete ? '#A7F3D0' : '#EDE5DC' }]} />
      {/* 3D bottom-right shadow edge */}
      <View style={[styles.edgeBottom, { backgroundColor: isComplete ? '#047857' : '#B09A88' }]} />
      <View style={[styles.edgeRight, { backgroundColor: isComplete ? '#059669' : '#BFA992' }]} />

      {/* Inner brick area */}
      <View style={[styles.inner, { backgroundColor: pal.bg }]}>
        {/* Empty course guides — faint horizontal lines showing where bricks will go */}
        {Array.from({ length: COURSES }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.courseGuide,
              {
                bottom: i * (COURSE_HEIGHT + MORTAR) + MORTAR,
                height: COURSE_HEIGHT,
                backgroundColor: pal.empty,
              },
            ]}
          />
        ))}

        {/* Filled courses — rise from bottom, clipped */}
        <Animated.View style={[styles.fillContainer, filledStyle]}>
          {Array.from({ length: COURSES }).map((_, i) => (
            <View key={i} style={styles.courseWrapper}>
              {/* Mortar gap between courses */}
              {i > 0 && (
                <View style={[styles.mortarLine, { backgroundColor: pal.mortar }]} />
              )}
              {/* The brick course itself */}
              <View style={[styles.course, { backgroundColor: pal.brick }]}>
                {/* Top highlight — makes it look 3D lit from above */}
                <View style={[styles.courseHighlight, { backgroundColor: pal.brickLight }]} />
                {/* Bottom shadow — depth */}
                <View style={[styles.courseShadow, { backgroundColor: pal.brickDark }]} />
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Content overlay */}
        <View style={styles.content}>
          <Text style={[styles.rubNumber, { color: pal.text }]}>
            {coverage.rubNumber}
          </Text>

          {isComplete ? (
            <View style={styles.completeRow}>
              <Ionicons name="checkmark-circle" size={normalize(14)} color={pal.textLight} />
              <Text style={[styles.completeText, { color: pal.textLight }]}>
                {t('student.blockBuilder.ready')}
              </Text>
            </View>
          ) : (
            <View style={styles.bottomInfo}>
              <Text style={[styles.ayahCount, { color: pal.textLight }]}>
                {coverage.memorizedAyahs}/{coverage.totalAyahs}
              </Text>
              <Text style={[styles.percentLabel, { color: pal.text }]}>
                {coverage.percentage}%
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const EDGE = normalize(3);

const styles = StyleSheet.create({
  outer: {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    borderRadius: normalize(4),
    padding: MORTAR,
    // 3D lifted shadow
    boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.06)',
  },
  // 3D edges — top-left light, bottom-right dark (classic brick bevel)
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
  // Faint empty course placeholders
  courseGuide: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: normalize(1),
    opacity: 0.6,
  },
  // Fill container — grows from bottom
  fillContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    flexDirection: 'column-reverse', // stack courses from bottom
  },
  courseWrapper: {
    width: '100%',
  },
  mortarLine: {
    height: MORTAR,
    width: '100%',
  },
  course: {
    height: COURSE_HEIGHT,
    width: '100%',
    borderRadius: normalize(1),
  },
  // Top 2px lighter — lit from above
  courseHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: normalize(2),
    opacity: 0.5,
  },
  // Bottom 2px darker — shadow underneath
  courseShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: normalize(2),
    opacity: 0.3,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.sm,
    zIndex: 1,
  },
  rubNumber: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(20),
  },
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  ayahCount: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(11),
  },
  percentLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(13),
  },
  completeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(3),
  },
  completeText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(11),
  },
});
