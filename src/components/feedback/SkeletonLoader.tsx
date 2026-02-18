import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, type DimensionValue, type ViewStyle } from 'react-native';

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
const ANIMATION_DURATION = 1200;

// ─── Component ───────────────────────────────────────────────────────────────

export function SkeletonLoader({
  width = '100%',
  height = 16,
  borderRadius = radius.sm,
  style,
}: SkeletonLoaderProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius, opacity },
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
