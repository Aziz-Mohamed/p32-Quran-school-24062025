import React from 'react';
import { I18nManager, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { HealthStatus } from '../types/reports.types';
import { StatusDot } from './StatusDot';
import { TrendArrow } from './TrendArrow';
import type { TrendDirection } from '../types/reports.types';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';

interface PillarMetric {
  label: string;
  value?: string;
  trend?: TrendDirection;
  trendLabel?: string;
}

interface PillarCardProps {
  title: string;
  icon: string;
  status: HealthStatus;
  headline: string;
  metrics: PillarMetric[];
  onPress?: () => void;
}

export function PillarCard({ title, icon, status, headline, metrics, onPress }: PillarCardProps) {
  const content = (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name={icon as any} size={20} color={lightTheme.textSecondary} />
        <Text style={styles.title}>{title}</Text>
        <StatusDot status={status} size={normalize(8)} />
        {onPress && (
          <Ionicons
            name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'}
            size={16}
            color={lightTheme.textTertiary}
          />
        )}
      </View>
      <Text style={styles.headline}>{headline}</Text>
      <View style={styles.metricsRow}>
        {metrics.map((metric, index) => (
          <View key={index} style={styles.metric}>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <View style={styles.metricValueRow}>
              {metric.value && <Text style={styles.metricValue}>{metric.value}</Text>}
              {metric.trend && (
                <TrendArrow
                  direction={metric.trend}
                  label={metric.trendLabel}
                  size={normalize(12)}
                />
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: lightTheme.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: lightTheme.border,
    padding: spacing.base,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: lightTheme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headline: {
    ...typography.textStyles.bodyMedium,
    color: lightTheme.text,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.base,
    marginTop: spacing.xs,
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: lightTheme.textTertiary,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  metricValue: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: lightTheme.text,
  },
});
