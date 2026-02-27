import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { HealthStatus } from '../types/reports.types';
import { semantic } from '@/theme/colors';
import { normalize } from '@/theme/normalize';

const STATUS_COLORS: Record<HealthStatus, string> = {
  green: semantic.success,
  yellow: semantic.warning,
  red: semantic.error,
};

interface StatusDotProps {
  status: HealthStatus;
  size?: number;
}

export function StatusDot({ status, size = normalize(10) }: StatusDotProps) {
  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: STATUS_COLORS[status],
        },
      ]}
      accessible
      accessibilityLabel={status}
      accessibilityRole="image"
    />
  );
}

const styles = StyleSheet.create({
  dot: {},
});
