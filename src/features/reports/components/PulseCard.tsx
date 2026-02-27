import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { HealthStatus } from '../types/reports.types';
import { SkeletonLoader } from '@/components/feedback';
import { semantic, semanticSurface, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';

const STATUS_CONFIG: Record<HealthStatus, { color: string; bg: string }> = {
  green: { color: semantic.success, bg: semanticSurface.success },
  yellow: { color: semantic.warning, bg: semanticSurface.warning },
  red: { color: semantic.error, bg: semanticSurface.error },
};

interface PulseCardProps {
  status: HealthStatus;
  message: string;
  isLoading?: boolean;
}

export function PulseCard({ status, message, isLoading }: PulseCardProps) {
  const config = STATUS_CONFIG[status];

  if (isLoading) {
    return (
      <View style={[styles.card, { backgroundColor: lightTheme.surfaceElevated, borderLeftColor: lightTheme.border }]}>
        <SkeletonLoader width="100%" height={20} borderRadius={radius.xs} />
        <SkeletonLoader width="70%" height={16} borderRadius={radius.xs} style={{ marginTop: spacing.sm }} />
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: config.bg, borderLeftColor: config.color }]}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderLeftWidth: 4,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
  },
  message: {
    ...typography.textStyles.bodyMedium,
    color: lightTheme.text,
  },
});
