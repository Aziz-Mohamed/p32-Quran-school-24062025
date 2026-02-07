import React, { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';

// ─── Types ───────────────────────────────────────────────────────────────────

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  /** The text to display */
  message: string;
  /** Color theme of the toast. Default: `'info'` */
  variant?: ToastVariant;
  /** Controls visibility */
  visible: boolean;
  /** Called when the toast should be dismissed */
  onDismiss: () => void;
  /** Auto-dismiss delay in ms. Default: `3000` */
  duration?: number;
}

// ─── Variant Config ──────────────────────────────────────────────────────────

interface VariantConfig {
  backgroundColor: string;
  textColor: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}

const VARIANT_MAP: Record<ToastVariant, VariantConfig> = {
  success: {
    backgroundColor: '#ECFDF5', // light green tint
    textColor: '#065F46',
    icon: 'checkmark-circle',
  },
  error: {
    backgroundColor: '#FEF2F2', // light red tint
    textColor: '#991B1B',
    icon: 'close-circle',
  },
  warning: {
    backgroundColor: '#FFFBEB', // light amber tint
    textColor: '#92400E',
    icon: 'warning',
  },
  info: {
    backgroundColor: '#EFF6FF', // light blue tint
    textColor: '#1E40AF',
    icon: 'information-circle',
  },
} as const;

// ─── Constants ───────────────────────────────────────────────────────────────

const SLIDE_DISTANCE = -120;
const ANIMATION_DURATION = 300;
const DEFAULT_DURATION = 3000;

// ─── Component ───────────────────────────────────────────────────────────────

export function Toast({
  message,
  variant = 'info',
  visible,
  onDismiss,
  duration = DEFAULT_DURATION,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SLIDE_DISTANCE);
  const opacity = useSharedValue(0);

  const config = VARIANT_MAP[variant];

  const dismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    if (visible) {
      // Slide in
      translateY.value = withTiming(0, {
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, { duration: ANIMATION_DURATION });

      // Auto-dismiss: slide out, then call dismiss
      translateY.value = withDelay(
        duration,
        withTiming(SLIDE_DISTANCE, {
          duration: ANIMATION_DURATION,
          easing: Easing.in(Easing.cubic),
        }),
      );
      opacity.value = withDelay(
        duration,
        withTiming(0, { duration: ANIMATION_DURATION }, (finished) => {
          if (finished) {
            runOnJS(dismiss)();
          }
        }),
      );
    } else {
      // Immediate hide
      translateY.value = withTiming(SLIDE_DISTANCE, {
        duration: ANIMATION_DURATION,
        easing: Easing.in(Easing.cubic),
      });
      opacity.value = withTiming(0, { duration: ANIMATION_DURATION });
    }
  }, [visible, duration, translateY, opacity, dismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { paddingTop: insets.top + spacing.xs },
        animatedStyle,
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Pressable
        style={[styles.container, { backgroundColor: config.backgroundColor }]}
        onPress={dismiss}
        accessibilityRole="alert"
      >
        <Ionicons
          name={config.icon}
          size={22}
          color={config.textColor}
          style={styles.icon}
        />
        <Text
          style={[styles.message, { color: config.textColor }]}
          numberOfLines={2}
        >
          {message}
        </Text>
        <Ionicons
          name="close"
          size={18}
          color={config.textColor}
        />
      </Pressable>
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    start: 0,
    end: 0,
    zIndex: 9999,
    paddingHorizontal: spacing.base,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingStart: spacing.md,
    paddingEnd: spacing.md,
    borderRadius: radius.md,
    // Subtle shadow
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    marginEnd: spacing.sm,
  },
  message: {
    ...typography.textStyles.bodyMedium,
    flex: 1,
    marginEnd: spacing.sm,
  },
});
