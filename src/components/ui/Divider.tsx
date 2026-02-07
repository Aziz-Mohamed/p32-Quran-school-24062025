import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { lightTheme } from '@/theme/colors';

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
    height: StyleSheet.hairlineWidth,
    backgroundColor: lightTheme.border,
    width: '100%',
  },
});
