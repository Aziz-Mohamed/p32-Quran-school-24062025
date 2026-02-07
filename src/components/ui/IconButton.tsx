import React, { useCallback } from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, lightTheme } from '@/theme/colors';
import { radius } from '@/theme/radius';

// ─── Types ───────────────────────────────────────────────────────────────────

type IconButtonVariant = 'default' | 'filled' | 'ghost';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: number;
  variant?: IconButtonVariant;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

// ─── Variant Maps ────────────────────────────────────────────────────────────

const variantStyles: Record<
  IconButtonVariant,
  { container: ViewStyle; pressedContainer: ViewStyle }
> = {
  default: {
    container: {
      backgroundColor: lightTheme.surface,
    },
    pressedContainer: {
      backgroundColor: colors.neutral[200],
    },
  },
  filled: {
    container: {
      backgroundColor: colors.primary[500],
    },
    pressedContainer: {
      backgroundColor: colors.primary[600],
    },
  },
  ghost: {
    container: {
      backgroundColor: colors.transparent,
    },
    pressedContainer: {
      backgroundColor: colors.neutral[100],
    },
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function IconButton({
  icon,
  onPress,
  size = 44,
  variant = 'default',
  disabled = false,
  accessibilityLabel,
  style,
}: IconButtonProps) {
  const handlePress = useCallback(() => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [disabled, onPress]);

  const variantStyle = variantStyles[variant];

  // Ensure minimum 44x44 touch target
  const touchSize = Math.max(size, 44);

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      hitSlop={
        size < 44
          ? {
              top: (44 - size) / 2,
              bottom: (44 - size) / 2,
              left: (44 - size) / 2,
              right: (44 - size) / 2,
            }
          : undefined
      }
      style={({ pressed }) => [
        styles.base,
        {
          width: touchSize,
          height: touchSize,
          borderRadius: touchSize / 2,
        },
        variantStyle.container,
        pressed && !disabled && variantStyle.pressedContainer,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon}
    </Pressable>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  disabled: {
    opacity: 0.4,
  },
});
