import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { HealthMetric } from '../types/reports.types';
import { StatusDot } from './StatusDot';
import { TrendArrow } from './TrendArrow';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';

interface HealthIndicatorProps {
  metric: HealthMetric;
  onPress?: () => void;
}

export function HealthIndicator({ metric, onPress }: HealthIndicatorProps) {
  const content = (
    <View style={styles.pill}>
      <StatusDot status={metric.status} />
      <View style={styles.textContainer}>
        <Text style={styles.label} numberOfLines={1}>{metric.label}</Text>
        <Text style={styles.value} numberOfLines={1}>{metric.displayValue}</Text>
      </View>
      <TrendArrow direction={metric.trend} label={metric.trendLabel} />
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.pressable} accessibilityRole="button">
        {content}
      </Pressable>
    );
  }

  return <View style={styles.pressable}>{content}</View>;
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: lightTheme.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: lightTheme.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: lightTheme.textSecondary,
  },
  value: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: lightTheme.text,
  },
});
