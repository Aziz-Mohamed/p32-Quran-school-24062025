import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { HealthStatus } from '../types/reports.types';
import { SkeletonLoader } from '@/components/feedback';
import { semantic, semanticSurface, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';
import { shadows } from '@/theme/shadows';

const STATUS_CONFIG: Record<HealthStatus, { color: string; bg: string; icon: string }> = {
  green: { color: semantic.success, bg: semanticSurface.success, icon: 'checkmark-circle' },
  yellow: { color: semantic.warning, bg: semanticSurface.warning, icon: 'alert-circle' },
  red: { color: semantic.error, bg: semanticSurface.error, icon: 'warning' },
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
      <View style={[styles.card, { backgroundColor: lightTheme.surfaceElevated, borderColor: lightTheme.border }]}>
        <SkeletonLoader width={44} height={44} borderRadius={22} />
        <View style={{ flex: 1, gap: spacing.sm }}>
          <SkeletonLoader width="100%" height={20} borderRadius={radius.xs} />
          <SkeletonLoader width="70%" height={16} borderRadius={radius.xs} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: config.bg, borderColor: config.color + '33' }]}>
      <View style={[styles.iconCircle, { backgroundColor: config.color + '1A' }]}>
        <Ionicons name={config.icon as any} size={24} color={config.color} />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.base,
    ...shadows.sm,
  },
  iconCircle: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(22),
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    ...typography.textStyles.bodyMedium,
    color: lightTheme.text,
  },
});
