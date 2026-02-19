import React, { useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  useSharedValue,
} from 'react-native-reanimated';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { normalize } from '@/theme/normalize';
import { rippleConfigs } from '@/theme/ripple';
import { useRTL } from '@/hooks/useRTL';

// ─── Sub-Component: Tab Item ────────────────────────────────────────────────

interface TabItemProps {
  isFocused: boolean;
  label: string;
  icon: any; // Using any for the tabBarIcon function
  onPress: () => void;
  onLongPress: () => void;
}

function TabItem({ isFocused, label, icon, onPress, onLongPress }: TabItemProps) {
  const scale = useSharedValue(1);
  const activeValue = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    activeValue.value = withSpring(isFocused ? 1 : 0, {
      damping: 15,
      stiffness: 120,
    });
  }, [isFocused]);

  const animatedIconContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isFocused ? 1.1 : 1) }],
    backgroundColor: activeValue.value > 0.5 
      ? colors.primary[50] 
      : 'transparent',
  }));

  const animatedLabelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(isFocused ? 0 : 2) }],
    opacity: withTiming(isFocused ? 1 : 0.8),
  }));

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isFocused ? 1 : 0) }],
    opacity: withTiming(isFocused ? 1 : 0),
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => (scale.value = withSpring(0.92))}
      onPressOut={() => (scale.value = withSpring(1))}
      android_ripple={rippleConfigs.dark}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.iconContainer, animatedIconContainerStyle]}>
        {icon && icon({
          focused: isFocused,
          color: isFocused ? colors.primary[600] : colors.neutral[400],
          size: normalize(24),
        })}
      </Animated.View>
      <Animated.Text 
        numberOfLines={1}
        ellipsizeMode="tail"
        allowFontScaling={false}
        style={[
          styles.label,
          { color: isFocused ? colors.primary[700] : colors.neutral[500] },
          isFocused && styles.labelActive,
          animatedLabelStyle
        ]}
      >
        {label}
      </Animated.Text>
      <Animated.View style={[styles.indicator, animatedIndicatorStyle]} />
    </Pressable>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isRTL } = useRTL();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              isFocused={isFocused}
              label={typeof label === 'string' ? label : ''}
              icon={options.tabBarIcon}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.xl,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: radius.xl,
    paddingVertical: normalize(6),
    paddingHorizontal: spacing.xs,
    ...shadows.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(2),
    overflow: 'hidden',
    borderRadius: radius.md,
  },
  iconContainer: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(9),
    marginTop: normalize(1),
  },
  labelActive: {
    fontFamily: typography.fontFamily.bold,
  },
  indicator: {
    position: 'absolute',
    bottom: -normalize(3),
    width: normalize(4),
    height: normalize(4),
    borderRadius: normalize(2),
    backgroundColor: colors.primary[500],
    ...shadows.glow,
  },
});
