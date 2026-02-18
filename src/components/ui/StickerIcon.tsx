import React from 'react';
import { Text, StyleSheet } from 'react-native';
import type { ColorValue } from 'react-native';
import {
  ISLAMIC_ICON_REGISTRY,
  DEFAULT_STICKER_ICON,
  isEmojiValue,
} from '@/lib/islamicIcons';

interface StickerIconProps {
  value: string | null | undefined;
  size?: number;
  color?: ColorValue;
}

export function StickerIcon({ value, size = 32, color = '#0D9488' }: StickerIconProps) {
  if (!value) {
    const DefaultIcon = ISLAMIC_ICON_REGISTRY[DEFAULT_STICKER_ICON];
    return <DefaultIcon size={size} color={color} />;
  }

  const IconComponent = ISLAMIC_ICON_REGISTRY[value as keyof typeof ISLAMIC_ICON_REGISTRY];
  if (IconComponent) {
    return <IconComponent size={size} color={color} />;
  }

  // Legacy emoji fallback
  if (isEmojiValue(value)) {
    return <Text style={[styles.emoji, { fontSize: size }]}>{value}</Text>;
  }

  const FallbackIcon = ISLAMIC_ICON_REGISTRY[DEFAULT_STICKER_ICON];
  return <FallbackIcon size={size} color={color} />;
}

const styles = StyleSheet.create({
  emoji: {
    textAlign: 'center',
  },
});
