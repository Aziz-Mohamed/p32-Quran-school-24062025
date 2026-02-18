import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { LoadingSpinner } from './LoadingSpinner';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LoadingStateProps {
  message?: string;
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LoadingState({ message, style }: LoadingStateProps) {
  return (
    <View style={[styles.container, style]}>
      <LoadingSpinner size="lg" />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
  },
  message: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
    marginTop: spacing.base,
    textAlign: 'center',
  },
});
