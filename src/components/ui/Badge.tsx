import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { normalize } from '@/theme/normalize';

// ─── Types ───────────────────────────────────────────────────────────────────

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'indigo'
  | 'rose'
  | 'violet'
  | 'sky';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

// ─── Variant Maps ────────────────────────────────────────────────────────────

const variantColors: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  default: {
    bg: colors.neutral[100],
    text: colors.neutral[700],
    border: colors.neutral[200],
  },
  success: {
    bg: '#DCFCE7',
    text: '#15803D',
    border: '#BBF7D0',
  },
  warning: {
    bg: '#FEF3C7',
    text: '#B45309',
    border: '#FDE68A',
  },
  error: {
    bg: '#FEE2E2',
    text: '#B91C1C',
    border: '#FECACA',
  },
  info: {
    bg: '#DBEAFE',
    text: '#1D4ED8',
    border: '#BFDBFE',
  },
  indigo: {
    bg: colors.accent.indigo[50],
    text: colors.accent.indigo[600],
    border: colors.accent.indigo[500] + '20',
  },
  rose: {
    bg: colors.accent.rose[50],
    text: colors.accent.rose[600],
    border: colors.accent.rose[500] + '20',
  },
  violet: {
    bg: colors.accent.violet[50],
    text: colors.accent.violet[600],
    border: colors.accent.violet[500] + '20',
  },
  sky: {
    bg: colors.accent.sky[50],
    text: colors.accent.sky[600],
    border: colors.accent.sky[500] + '20',
  },
};

// ─── Size Maps ───────────────────────────────────────────────────────────────

const sizeConfig: Record<BadgeSize, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: {
      paddingHorizontal: spacing.sm,
      paddingVertical: normalize(2),
    },
    text: {
      fontFamily: typography.fontFamily.bold,
      fontSize: normalize(10),
      lineHeight: normalize(14),
      textTransform: 'uppercase',
    },
  },
  md: {
    container: {
      paddingHorizontal: spacing.md,
      paddingVertical: normalize(4),
    },
    text: {
      fontFamily: typography.fontFamily.semiBold,
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
        {
          backgroundColor: colorConfig.bg,
          borderColor: colorConfig.border,
        },
        shadows.sm,
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
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
