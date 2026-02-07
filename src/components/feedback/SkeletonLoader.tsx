import React, { useEffect } from 'react';
import { StyleSheet, type DimensionValue, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SkeletonLoaderProps {
  /** Width of the skeleton element. Default: `'100%'` */
  width?: DimensionValue;
  /** Height in pixels. Default: `16` */
  height?: number;
  /** Corner radius. Default: `radius.sm` */
  borderRadius?: number;
  /** Additional styles */
  style?: ViewStyle;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const BASE_COLOR = colors.neutral[200];
const SHIMMER_COLOR = colors.neutral[100];
const ANIMATION_DURATION = 1200;

// ─── Component ───────────────────────────────────────────────────────────────

export function SkeletonLoader({
  width = '100%',
  height = 16,
  borderRadius = radius.sm,
  style,
}: SkeletonLoaderProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: ANIMATION_DURATION, easing: Easing.inOut(Easing.ease) }),
      -1, // infinite
      true, // reverse
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(${interpolate(
      progress.value,
      [0, 1],
      [229, 245], // neutral[200] → neutral[100] red channel approximation
    )}, ${interpolate(
      progress.value,
      [0, 1],
      [229, 245],
    )}, ${interpolate(
      progress.value,
      [0, 1],
      [229, 245],
    )}, 1)`,
    // We interpolate all three RGB channels identically because both
    // neutral[200] (#E5E5E5 = 229,229,229) and neutral[100] (#F5F5F5 = 245,245,245)
    // are grey tones.
  }));

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius },
        animatedStyle,
        style,
      ]}
    />
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    backgroundColor: BASE_COLOR,
    overflow: 'hidden',
  },
});
