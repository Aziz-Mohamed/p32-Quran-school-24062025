import React, { useEffect, useCallback } from 'react';
import { Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import type { NotificationPayload } from '../types/notifications.types';

const AUTO_DISMISS_MS = 4000;
const SLIDE_DURATION = 300;

interface InAppBannerProps {
  notification: NotificationPayload | null;
  onPress?: (notification: NotificationPayload) => void;
  onDismiss?: () => void;
}

export function InAppBanner({ notification, onPress, onDismiss }: InAppBannerProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-150);
  const opacity = useSharedValue(0);

  const dismiss = useCallback(() => {
    'worklet';
    translateY.value = withTiming(-150, { duration: SLIDE_DURATION, easing: Easing.in(Easing.ease) });
    opacity.value = withTiming(0, { duration: SLIDE_DURATION }, (finished) => {
      if (finished && onDismiss) {
        runOnJS(onDismiss)();
      }
    });
  }, [translateY, opacity, onDismiss]);

  // Show/auto-dismiss when notification changes
  useEffect(() => {
    if (!notification) return;

    // Slide in then auto-dismiss after delay (chained to avoid overwrite)
    translateY.value = withSequence(
      withTiming(0, { duration: SLIDE_DURATION, easing: Easing.out(Easing.ease) }),
      withDelay(
        AUTO_DISMISS_MS,
        withTiming(-150, { duration: SLIDE_DURATION, easing: Easing.in(Easing.ease) }),
      ),
    );
    opacity.value = withSequence(
      withTiming(1, { duration: SLIDE_DURATION }),
      withDelay(
        AUTO_DISMISS_MS,
        withTiming(0, { duration: SLIDE_DURATION }, (finished) => {
          if (finished && onDismiss) {
            runOnJS(onDismiss)();
          }
        }),
      ),
    );
  }, [notification, translateY, opacity, onDismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  // Swipe-up to dismiss gesture
  const swipeGesture = Gesture.Pan()
    .onEnd((event) => {
      if (event.translationY < -20) {
        dismiss();
      }
    });

  const handlePress = useCallback(() => {
    if (notification && onPress) {
      onPress(notification);
    }
    // Dismiss immediately on tap
    translateY.value = withTiming(-150, { duration: SLIDE_DURATION });
    opacity.value = withTiming(0, { duration: SLIDE_DURATION });
  }, [notification, onPress, translateY, opacity]);

  if (!notification) return null;

  return (
    <GestureDetector gesture={swipeGesture}>
      <Animated.View
        style={[
          styles.container,
          { paddingTop: insets.top + 8 },
          animatedStyle,
        ]}
      >
        <Pressable style={styles.content} onPress={handlePress}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {notification.body}
          </Text>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    insetInlineStart: 0,
    insetInlineEnd: 0,
    zIndex: 9999,
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
    borderBottomStartRadius: 16,
    borderBottomEndRadius: 16,
  },
  content: {
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1B1B1B',
    marginBlockEnd: 2,
  },
  body: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
});
