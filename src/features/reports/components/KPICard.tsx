import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SkeletonLoader } from '@/components/feedback';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';

interface KPICardProps {
  label: string;
  value: number | string;
  format?: 'number' | 'percentage' | 'score';
  isLoading?: boolean;
}

function formatValue(value: number | string, format?: string): string {
  if (typeof value === 'string') return value;
  switch (format) {
    case 'percentage':
      return `${Math.round(value)}%`;
    case 'score':
      return value.toFixed(1);
    default:
      return value.toLocaleString();
  }
}

export function KPICard({ label, value, format, isLoading }: KPICardProps) {
  return (
    <View style={styles.card}>
      {isLoading ? (
        <>
          <SkeletonLoader width={48} height={28} borderRadius={radius.xs} />
          <SkeletonLoader width={64} height={14} borderRadius={radius.xs} style={styles.labelSkeleton} />
        </>
      ) : (
        <>
          <Text style={styles.value}>{formatValue(value, format)}</Text>
          <Text style={styles.label} numberOfLines={2}>{label}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
    backgroundColor: lightTheme.surfaceElevated,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: lightTheme.border,
    alignItems: 'center',
  },
  value: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    lineHeight: typography.lineHeight.xl,
    color: lightTheme.text,
  },
  label: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: lightTheme.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  labelSkeleton: {
    marginTop: spacing.xs,
  },
});
