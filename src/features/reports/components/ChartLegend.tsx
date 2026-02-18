import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/theme/spacing';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';

export type LineStyle = 'solid' | 'dashed' | 'dotted';

export interface LegendItem {
  label: string;
  color: string;
  lineStyle?: LineStyle;
}

interface ChartLegendProps {
  items: LegendItem[];
}

export function ChartLegend({ items }: ChartLegendProps) {
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <View style={styles.indicatorContainer}>
            <View
              style={[
                styles.indicator,
                item.lineStyle === 'dashed' || item.lineStyle === 'dotted'
                  ? {
                      height: 0,
                      borderTopWidth: 3,
                      borderStyle: item.lineStyle,
                      borderTopColor: item.color,
                      backgroundColor: 'transparent',
                    }
                  : { backgroundColor: item.color },
              ]}
            />
          </View>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.base,
    paddingTop: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  indicatorContainer: {
    width: normalize(20),
    height: normalize(12),
    justifyContent: 'center',
  },
  indicator: {
    height: normalize(3),
    width: normalize(20),
    borderRadius: normalize(1.5),
  },
  label: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: lightTheme.textSecondary,
  },
});
