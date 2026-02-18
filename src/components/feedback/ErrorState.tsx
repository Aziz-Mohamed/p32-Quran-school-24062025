import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ErrorStateProps {
  /** Heading text. Defaults to `common.error` from i18n. */
  title?: string;
  /** Supporting description text */
  description?: string;
  /** Callback when the retry button is pressed */
  onRetry?: () => void;
  /** Optional wrapper style */
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ErrorState({ title, description, onRetry, style }: ErrorStateProps) {
  const { t } = useTranslation();

  const resolvedTitle = title ?? t('common.error');

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconWrapper}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={colors.semantic.error}
        />
      </View>

      <Text style={styles.title}>{resolvedTitle}</Text>

      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}

      {onRetry ? (
        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.retryButtonPressed,
          ]}
          onPress={onRetry}
          accessibilityRole="button"
        >
          <Ionicons
            name="refresh-outline"
            size={18}
            color={colors.semantic.error}
            style={styles.retryIcon}
          />
          <Text style={styles.retryLabel}>{t('common.retry')}</Text>
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
    backgroundColor: '#FEF2F2', // very light red tint
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
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.semantic.error,
    marginTop: spacing.sm,
  },
  retryButtonPressed: {
    opacity: 0.7,
    backgroundColor: '#FEF2F2',
  },
  retryIcon: {
    marginEnd: spacing.xs,
  },
  retryLabel: {
    ...typography.textStyles.bodyMedium,
    color: colors.semantic.error,
  },
});
