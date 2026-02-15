import React, { useMemo } from 'react';
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { shadows } from '@/theme/shadows';

// ─── Types ───────────────────────────────────────────────────────────────────

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
type AvatarVariant = 'default' | 'primary' | 'secondary' | 'indigo' | 'rose' | 'violet';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: AvatarSize;
  variant?: AvatarVariant;
  ring?: boolean;
  style?: ViewStyle;
}

// ─── Size Maps ───────────────────────────────────────────────────────────────

const sizeMap: Record<AvatarSize, number> = {
  sm: 32,
  md: 44,
  lg: 64,
  xl: 96,
};

const fontSizeMap: Record<AvatarSize, TextStyle> = {
  sm: {
    fontSize: 10,
    lineHeight: 14,
  },
  md: {
    fontSize: 14,
    lineHeight: 18,
  },
  lg: {
    fontSize: 22,
    lineHeight: 30,
  },
  xl: {
    fontSize: 32,
    lineHeight: 44,
  },
};

// ─── Variant Maps ────────────────────────────────────────────────────────────

const variantColors: Record<AvatarVariant, string> = {
  default: colors.neutral[400],
  primary: colors.primary[500],
  secondary: colors.secondary[500],
  indigo: colors.accent.indigo[500],
  rose: colors.accent.rose[500],
  violet: colors.accent.violet[500],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  colors.primary[500],
  colors.accent.indigo[500],
  colors.accent.violet[500],
  colors.accent.rose[500],
  colors.secondary[500],
  colors.accent.sky[500],
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
  return AVATAR_PALETTE[index] as string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Avatar({
  source,
  name,
  size = 'md',
  variant,
  ring = false,
  style,
}: AvatarProps) {
  const dimension = sizeMap[size];
  const borderRadius = dimension / 2;

  const backgroundColor = useMemo(() => {
    if (variant) return variantColors[variant];
    return name ? getColorFromName(name) : colors.neutral[400];
  }, [name, variant]);

  const initials = useMemo(
    () => (name ? getInitials(name) : '?'),
    [name],
  );

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius,
    backgroundColor,
    borderWidth: ring ? (size === 'sm' ? 2 : 3) : 0,
    borderColor: colors.white,
    ...shadows.sm,
  };

  const imageContainerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius,
    overflow: 'hidden',
  };

  if (source != null && source.length > 0) {
    return (
      <View style={[styles.base, containerStyle, style]}>
        <View style={imageContainerStyle}>
          <Image
            source={{ uri: source }}
            style={{
              width: dimension,
              height: dimension,
            }}
            contentFit="cover"
            transition={300}
            accessibilityLabel={name ? `${name}'s avatar` : 'User avatar'}
          />
        </View>
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
  },
  initialsText: {
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
    textAlign: 'center',
  } as TextStyle,
});
