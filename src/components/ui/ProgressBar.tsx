import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text, type ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { shadows } from '@/theme/shadows';

// ─── Types ───────────────────────────────────────────────────────────────────

type ProgressBarVariant = 'primary' | 'secondary' | 'indigo' | 'rose' | 'violet' | 'sky';

interface ProgressBarProps {
  progress: number; // 0 to 1
  variant?: ProgressBarVariant;
  showLabel?: boolean;
  label?: string;
  height?: number;
  animated?: boolean;
  style?: ViewStyle;
}

// ─── Variant Maps ────────────────────────────────────────────────────────────

const variantColors: Record<ProgressBarVariant, string> = {
  primary: colors.primary[500],
  secondary: colors.secondary[500],
  indigo: colors.accent.indigo[500],
  rose: colors.accent.rose[500],
  violet: colors.accent.violet[500],
  sky: colors.accent.sky[500],
};

const variantBackgrounds: Record<ProgressBarVariant, string> = {
  primary: colors.primary[100],
  secondary: colors.secondary[100],
  indigo: colors.accent.indigo[50],
  rose: colors.accent.rose[50],
  violet: colors.accent.violet[50],
  sky: colors.accent.sky[50],
};

// ─── Component ───────────────────────────────────────────────────────────────

export function ProgressBar({
  progress,
  variant = 'primary',
  showLabel = false,
  label,
  height = 8,
  animated = true,
  style,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.spring(progressAnim, {
        toValue: clampedProgress,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
      }).start();
    } else {
      progressAnim.setValue(clampedProgress);
    }
  }, [clampedProgress, animated, progressAnim]);

  const width = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.root, style]}>
      {(showLabel || label) && (
        <View style={styles.labelContainer}>
          {label && <Text style={styles.labelText}>{label}</Text>}
          {showLabel && (
            <Text style={styles.percentageText}>
              {Math.round(clampedProgress * 100)}%
            </Text>
          )}
        </View>
      )}

      <View
        style={[
          styles.track,
          { height, backgroundColor: variantBackgrounds[variant], borderRadius: height / 2 },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              width,
              backgroundColor: variantColors[variant],
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  labelText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    color: colors.neutral[700],
  },
  percentageText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xs,
    color: colors.primary[600],
  },
  track: {
    width: '100%',
    overflow: 'hidden',
    ...shadows.sm,
  },
  fill: {
    height: '100%',
  },
});
