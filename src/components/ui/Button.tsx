import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { shadows } from '@/theme/shadows';

// ─── Types ───────────────────────────────────────────────────────────────────

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'glow'
  | 'indigo'
  | 'rose'
  | 'violet';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

// ─── Size Maps ───────────────────────────────────────────────────────────────

const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: {
      minHeight: 40,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    text: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.sm,
    },
  },
  md: {
    container: {
      minHeight: 52,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    text: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.base,
    },
  },
  lg: {
    container: {
      minHeight: 60,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
    },
    text: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      lineHeight: typography.lineHeight.md,
    },
  },
};

// ─── Variant Maps ────────────────────────────────────────────────────────────

const variantStyles: Record<
  ButtonVariant,
  { container: ViewStyle; text: TextStyle; pressedContainer: ViewStyle }
> = {
  primary: {
    container: {
      backgroundColor: colors.primary[500],
      ...shadows.sm,
    },
    text: {
      color: colors.white,
    },
    pressedContainer: {
      backgroundColor: colors.primary[600],
      transform: [{ scale: 0.98 }],
    },
  },
  glow: {
    container: {
      backgroundColor: colors.primary[500],
      ...shadows.glow,
    },
    text: {
      color: colors.white,
    },
    pressedContainer: {
      backgroundColor: colors.primary[600],
      ...shadows.none,
    },
  },
  secondary: {
    container: {
      backgroundColor: colors.white,
      borderWidth: 2,
      borderColor: colors.primary[500],
    },
    text: {
      color: colors.primary[500],
    },
    pressedContainer: {
      backgroundColor: colors.primary[50],
    },
  },
  indigo: {
    container: {
      backgroundColor: colors.accent.indigo[500],
      ...shadows.sm,
    },
    text: {
      color: colors.white,
    },
    pressedContainer: {
      backgroundColor: colors.accent.indigo[600],
    },
  },
  rose: {
    container: {
      backgroundColor: colors.accent.rose[500],
      ...shadows.sm,
    },
    text: {
      color: colors.white,
    },
    pressedContainer: {
      backgroundColor: colors.accent.rose[600],
    },
  },
  violet: {
    container: {
      backgroundColor: colors.accent.violet[500],
      ...shadows.sm,
    },
    text: {
      color: colors.white,
    },
    pressedContainer: {
      backgroundColor: colors.accent.violet[600],
    },
  },
  ghost: {
    container: {
      backgroundColor: colors.transparent,
    },
    text: {
      color: colors.primary[600],
    },
    pressedContainer: {
      backgroundColor: colors.primary[50],
    },
  },
  danger: {
    container: {
      backgroundColor: lightTheme.error,
    },
    text: {
      color: colors.white,
    },
    pressedContainer: {
      backgroundColor: '#DC2626',
    },
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const handlePress = useCallback(() => {
    if (isDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [isDisabled, onPress]);

  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.base,
        sizeStyle.container,
        variantStyle.container,
        pressed && !isDisabled && variantStyle.pressedContainer,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyle.text.color}
          style={styles.loader}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              sizeStyle.text,
              variantStyle.text,
              icon != null && styles.textWithIcon,
              isDisabled && styles.disabledText,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    minWidth: 44,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: colors.neutral[200],
  },
  disabledText: {
    color: colors.neutral[500],
  },
  textWithIcon: {
    marginStart: spacing.sm,
  },
  loader: {
    marginEnd: 0,
  },
});
