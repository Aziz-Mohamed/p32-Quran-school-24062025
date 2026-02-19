import React, { useCallback } from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { shadows } from '@/theme/shadows';
import { rippleConfigs } from '@/theme/ripple';

// ─── Types ───────────────────────────────────────────────────────────────────

type IconButtonVariant = 'default' | 'primary' | 'secondary' | 'indigo' | 'rose' | 'violet' | 'ghost' | 'glow';

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
      backgroundColor: colors.white,
      ...shadows.sm,
    },
    pressedContainer: {
      backgroundColor: colors.neutral[100],
    },
  },
  primary: {
    container: {
      backgroundColor: colors.primary[500],
      ...shadows.sm,
    },
    pressedContainer: {
      backgroundColor: colors.primary[600],
    },
  },
  secondary: {
    container: {
      backgroundColor: colors.secondary[500],
      ...shadows.sm,
    },
    pressedContainer: {
      backgroundColor: colors.secondary[600],
    },
  },
  indigo: {
    container: {
      backgroundColor: colors.accent.indigo[500],
      ...shadows.sm,
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
    pressedContainer: {
      backgroundColor: colors.accent.rose[600],
    },
  },
  violet: {
    container: {
      backgroundColor: colors.accent.violet[500],
      ...shadows.sm,
    },
    pressedContainer: {
      backgroundColor: colors.accent.violet[600],
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
  glow: {
    container: {
      backgroundColor: colors.primary[500],
      ...shadows.glow,
    },
    pressedContainer: {
      backgroundColor: colors.primary[600],
      ...shadows.none,
    },
  },
};

// ─── Ripple Map ─────────────────────────────────────────────────────────────

const variantRipple = {
  default: rippleConfigs.iconDark,
  primary: rippleConfigs.iconLight,
  secondary: rippleConfigs.iconLight,
  indigo: rippleConfigs.iconLight,
  rose: rippleConfigs.iconLight,
  violet: rippleConfigs.iconLight,
  ghost: rippleConfigs.iconDark,
  glow: rippleConfigs.iconLight,
} as const;

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
      android_ripple={variantRipple[variant]}
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
