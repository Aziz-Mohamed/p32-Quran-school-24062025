import React, { useMemo } from 'react';
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

// ─── Types ───────────────────────────────────────────────────────────────────

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: AvatarSize;
  style?: ViewStyle;
}

// ─── Size Maps ───────────────────────────────────────────────────────────────

const sizeMap: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const fontSizeMap: Record<AvatarSize, TextStyle> = {
  sm: {
    fontSize: 12,
    lineHeight: 16,
  },
  md: {
    fontSize: 14,
    lineHeight: 18,
  },
  lg: {
    fontSize: 20,
    lineHeight: 28,
  },
  xl: {
    fontSize: 28,
    lineHeight: 36,
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  colors.primary[500],
  colors.primary[600],
  colors.primary[700],
  colors.secondary[500],
  colors.secondary[600],
  colors.secondary[700],
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
] as const;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    return (parts[0]?.[0] ?? '?').toUpperCase();
  }
  const first = parts[0]?.[0] ?? '';
  const last = parts[parts.length - 1]?.[0] ?? '';
  return (first + last).toUpperCase();
}

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Avatar({
  source,
  name,
  size = 'md',
  style,
}: AvatarProps) {
  const dimension = sizeMap[size];
  const borderRadius = dimension / 2;

  const backgroundColor = useMemo(
    () => (name ? getColorFromName(name) : colors.neutral[400]),
    [name],
  );

  const initials = useMemo(
    () => (name ? getInitials(name) : '?'),
    [name],
  );

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius,
    backgroundColor,
  };

  if (source != null && source.length > 0) {
    return (
      <View style={[styles.base, containerStyle, style]}>
        <Image
          source={{ uri: source }}
          style={{
            width: dimension,
            height: dimension,
            borderRadius,
          }}
          contentFit="cover"
          transition={200}
          accessibilityLabel={name ? `${name}'s avatar` : 'User avatar'}
        />
      </View>
    );
  }

  return (
    <View
      style={[styles.base, containerStyle, style]}
      accessibilityLabel={name ? `${name}'s avatar` : 'User avatar'}
      accessibilityRole="image"
    >
      <Text
        style={[
          styles.initialsText,
          fontSizeMap[size],
        ]}
        numberOfLines={1}
      >
        {initials}
      </Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initialsText: {
    fontFamily: typography.fontFamily.semiBold,
    color: colors.white,
    textAlign: 'center',
  } as TextStyle,
});
