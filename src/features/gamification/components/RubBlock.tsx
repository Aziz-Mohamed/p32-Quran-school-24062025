import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { FreshnessState } from '../types/gamification.types';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

interface RubBlockProps {
  rubNumber: number;
  state: FreshnessState;
  onPress?: () => void;
}

const STATE_COLORS: Record<FreshnessState, { bg: string; border: string; text: string }> = {
  fresh: { bg: '#DCFCE7', border: '#22C55E', text: '#166534' },
  fading: { bg: '#FEF9C3', border: '#EAB308', text: '#854D0E' },
  warning: { bg: '#FFEDD5', border: '#F97316', text: '#9A3412' },
  critical: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' },
  dormant: { bg: '#F3F4F6', border: '#9CA3AF', text: '#6B7280' },
  uncertified: { bg: '#FFFFFF', border: '#E5E7EB', text: '#D1D5DB' },
};

export function RubBlock({ rubNumber, state, onPress }: RubBlockProps) {
  const colorSet = STATE_COLORS[state];
  const isDashed = state === 'uncertified';

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const blockStyle = [
    styles.block,
    {
      backgroundColor: colorSet.bg,
      borderColor: colorSet.border,
      borderStyle: isDashed ? ('dashed' as const) : ('solid' as const),
    },
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Rubʿ ${rubNumber}`}
      >
        <View style={blockStyle}>
          <Text style={[styles.number, { color: colorSet.text }]}>{rubNumber}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={blockStyle} accessibilityLabel={`Rubʿ ${rubNumber}`}>
      <Text style={[styles.number, { color: colorSet.text }]}>{rubNumber}</Text>
    </View>
  );
}

const BLOCK_SIZE = normalize(38);

const styles = StyleSheet.create({
  block: {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    borderRadius: radius.xs,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.04)',
  },
  number: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(12),
  },
});
