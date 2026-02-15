import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DividerProps {
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Divider({ style }: DividerProps) {
  return <View style={[styles.divider, style]} accessibilityRole="none" />;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    width: '100%',
  },
});
