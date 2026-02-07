import React from 'react';
import { ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';

// ─── Types ───────────────────────────────────────────────────────────────────

const SIZE_MAP = {
  sm: 20,
  md: 32,
  lg: 48,
} as const;

type SpinnerSize = keyof typeof SIZE_MAP;

interface LoadingSpinnerProps {
  /** Predefined size preset. Default: `'md'` */
  size?: SpinnerSize;
  /** Override the spinner color. Default: `colors.primary[500]` */
  color?: string;
  /** Optional wrapper style */
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LoadingSpinner({
  size = 'md',
  color = colors.primary[500],
  style,
}: LoadingSpinnerProps) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={SIZE_MAP[size]} color={color} />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
