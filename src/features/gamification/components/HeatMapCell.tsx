import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { getHeatMapColor } from '../utils/heatmap-colors';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';
import { radius } from '@/theme/radius';

interface HeatMapCellProps {
  rubNumber: number;
  /** Pass null for uncertified rub' */
  reviewCount: number | null;
  size: number;
  onPress?: () => void;
}

export const HeatMapCell = memo(function HeatMapCell({
  rubNumber,
  reviewCount,
  size,
  onPress,
}: HeatMapCellProps) {
  const bgColor = getHeatMapColor(reviewCount);
  const isCertified = reviewCount !== null;

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const cellStyle = [
    styles.cell,
    {
      width: size,
      height: size,
      backgroundColor: bgColor,
      borderColor: isCertified ? bgColor : '#D1D5DB',
      borderStyle: isCertified ? ('solid' as const) : ('dashed' as const),
    },
  ];

  const textColor = isCertified && reviewCount! >= 3 ? '#FFFFFF' : '#6B7280';
  const fontSize = size > 30 ? normalize(10) : normalize(8);

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Rub' ${rubNumber}${isCertified ? `, ${reviewCount} reviews` : ', uncertified'}`}
      >
        <View style={cellStyle}>
          <Text style={[styles.number, { color: textColor, fontSize }]}>
            {rubNumber}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={cellStyle} accessibilityLabel={`Rub' ${rubNumber}`}>
      <Text style={[styles.number, { color: textColor, fontSize }]}>
        {rubNumber}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  cell: {
    borderRadius: radius.xs,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontFamily: typography.fontFamily.semiBold,
  },
});
