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

// ─── Types ───────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
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
      minHeight: 44,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    text: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.sm,
    },
  },
  md: {
    container: {
      minHeight: 48,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    text: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.base,
    },
  },
  lg: {
    container: {
      minHeight: 56,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.base,
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
      backgroundColor: colors.secondary[500],
    },
    text: {
      color: colors.white,
    },
    pressedContainer: {
      backgroundColor: colors.secondary[600],
    },
  },
  secondary: {
    container: {
      backgroundColor: colors.transparent,
      borderWidth: 1.5,
      borderColor: colors.primary[500],
    },
    text: {
      color: colors.primary[500],
    },
    pressedContainer: {
      backgroundColor: colors.primary[50],
    },
  },
  ghost: {
    container: {
      backgroundColor: colors.transparent,
    },
    text: {
      color: colors.primary[500],
    },
    pressedContainer: {
      backgroundColor: colors.neutral[100],
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    borderRadius: radius.md,
    minWidth: 44,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.8,
  },
  textWithIcon: {
    marginStart: spacing.sm,
  },
  loader: {
    marginEnd: 0,
  },
});
