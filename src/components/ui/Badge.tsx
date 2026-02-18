import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';

// ─── Types ───────────────────────────────────────────────────────────────────

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

// ─── Variant Maps ────────────────────────────────────────────────────────────

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  default: {
    bg: colors.neutral[200],
    text: colors.neutral[700],
  },
  success: {
    bg: '#D1FAE5', // success light bg
    text: '#065F46', // success dark text
  },
  warning: {
    bg: '#FEF3C7', // warning light bg
    text: '#92400E', // warning dark text
  },
  error: {
    bg: '#FEE2E2', // error light bg
    text: '#991B1B', // error dark text
  },
  info: {
    bg: '#DBEAFE', // info light bg
    text: '#1E40AF', // info dark text
  },
};

// ─── Size Maps ───────────────────────────────────────────────────────────────

const sizeConfig: Record<BadgeSize, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    text: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.xs,
      lineHeight: typography.lineHeight.xs,
    },
  },
  md: {
    container: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    text: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.sm,
    },
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function Badge({ label, variant = 'default', size = 'sm' }: BadgeProps) {
  const colorConfig = variantColors[variant];
  const sizeStyle = sizeConfig[size];

  return (
    <View
      style={[
        styles.base,
        sizeStyle.container,
        { backgroundColor: colorConfig.bg },
      ]}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <Text
        style={[sizeStyle.text, { color: colorConfig.text }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
