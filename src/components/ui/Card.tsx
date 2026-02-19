import React, { useRef } from 'react';
import {
  View,
  Pressable,
  Animated,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { shadows } from '@/theme/shadows';
import { rippleConfigs } from '@/theme/ripple';

// ─── Types ───────────────────────────────────────────────────────────────────

type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass' | 'primary-glow';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
}

// ─── Variant Maps ────────────────────────────────────────────────────────────

const variantStyles: Record<CardVariant, ViewStyle> = {
  default: {
    backgroundColor: lightTheme.surfaceElevated,
    ...shadows.md,
  },
  elevated: {
    backgroundColor: lightTheme.surfaceElevated,
    ...shadows.lg,
  },
  outlined: {
    backgroundColor: lightTheme.surfaceElevated,
    borderWidth: 1.5,
    borderColor: lightTheme.border,
    ...shadows.none,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...shadows.sm,
  },
  'primary-glow': {
    backgroundColor: lightTheme.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.primary[100],
    ...shadows.glow,
  },
};

// ─── Ripple Map ─────────────────────────────────────────────────────────────

const variantRipple = {
  default: rippleConfigs.dark,
  elevated: rippleConfigs.dark,
  outlined: rippleConfigs.dark,
  glass: rippleConfigs.dark,
  'primary-glow': rippleConfigs.primary,
} as const;

// ─── Component ───────────────────────────────────────────────────────────────

export function Card({
  children,
  variant = 'default',
  onPress,
  style,
}: CardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 40,
      bounciness: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 8,
    }).start();
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const cardStyle: ViewStyle[] = [
    styles.base,
    variantStyles[variant],
    style as ViewStyle,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={variantRipple[variant]}
        accessibilityRole="button"
        style={cardStyle}
      >
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
        >
          {children}
        </Animated.View>
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    padding: spacing.lg,
    overflow: 'hidden',
  },
});
