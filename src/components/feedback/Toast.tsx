import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';

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
    backgroundColor: '#ECFDF5',
    textColor: '#065F46',
    icon: 'checkmark-circle',
  },
  error: {
    backgroundColor: '#FEF2F2',
    textColor: '#991B1B',
    icon: 'close-circle',
  },
  warning: {
    backgroundColor: '#FFFBEB',
    textColor: '#92400E',
    icon: 'warning',
  },
  info: {
    backgroundColor: '#EFF6FF',
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
  const translateY = useRef(new Animated.Value(SLIDE_DISTANCE)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const config = VARIANT_MAP[variant];

  const dismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss
      timerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: SLIDE_DISTANCE,
            duration: ANIMATION_DURATION,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished) {
            dismiss();
          }
        });
      }, duration);
    } else {
      // Immediate hide
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SLIDE_DISTANCE,
          duration: ANIMATION_DURATION,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [visible, duration, translateY, opacity, dismiss]);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { paddingTop: insets.top + spacing.xs },
        { transform: [{ translateY }], opacity },
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
          size={normalize(22)}
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
          size={normalize(18)}
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
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
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
