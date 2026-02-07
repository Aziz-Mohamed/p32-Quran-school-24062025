import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';

// ─── Types ───────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  /** Ionicons icon name. Default: `'file-tray-outline'` */
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Primary message */
  title: string;
  /** Supporting description text */
  description?: string;
  /** Label for the optional CTA button */
  actionLabel?: string;
  /** Callback when the CTA button is pressed */
  onAction?: () => void;
  /** Optional wrapper style */
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EmptyState({
  icon = 'file-tray-outline',
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={48} color={colors.neutral[400]} />
      </View>

      <Text style={styles.title}>{title}</Text>

      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}

      {actionLabel && onAction ? (
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed,
          ]}
          onPress={onAction}
          accessibilityRole="button"
        >
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
  },
  iconWrapper: {
    marginBottom: spacing.base,
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.base,
  },
  actionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary[500],
    marginTop: spacing.sm,
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
  actionLabel: {
    ...typography.textStyles.bodyMedium,
    color: colors.white,
    textAlign: 'center',
  },
});
