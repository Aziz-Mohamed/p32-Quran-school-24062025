import React from 'react';
import { I18nManager, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { InsightData } from '../types/reports.types';
import { lightTheme, semantic, semanticSurface } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';

const SEVERITY_CONFIG = {
  success: { color: semantic.success, bg: semanticSurface.success },
  warning: { color: semantic.warning, bg: semanticSurface.warning },
  danger: { color: semantic.error, bg: semanticSurface.error },
  info: { color: semantic.info, bg: semanticSurface.info },
} as const;

interface InsightActionCardProps {
  insight: InsightData;
  onPress?: () => void;
}

export function InsightActionCard({ insight, onPress }: InsightActionCardProps) {
  const config = SEVERITY_CONFIG[insight.severity];

  const content = (
    <View style={[styles.card, { backgroundColor: config.bg, borderLeftColor: config.color }]}>
      <View style={[styles.iconContainer, { backgroundColor: config.color + '1A' }]}>
        <Ionicons name={insight.icon as any} size={20} color={config.color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{insight.title}</Text>
        {insight.description && (
          <Text style={styles.description} numberOfLines={2}>
            {insight.description}
          </Text>
        )}
      </View>
      {onPress && (
        <Ionicons
          name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'}
          size={18}
          color={lightTheme.textTertiary}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={insight.title}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: lightTheme.text,
  },
  description: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: lightTheme.textSecondary,
    marginTop: spacing.xs,
  },
});
