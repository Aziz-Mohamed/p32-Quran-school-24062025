import React from 'react';
import { I18nManager, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { lightTheme, primary } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';

interface QuickReportLinkProps {
  title: string;
  icon: string;
  metricLabel: string;
  onPress: () => void;
}

export function QuickReportLink({ title, icon, metricLabel, onPress }: QuickReportLinkProps) {
  return (
    <Pressable onPress={onPress} style={styles.card} accessibilityRole="button" accessibilityLabel={title}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={20} color={primary[500]} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.metric}>{metricLabel}</Text>
      </View>
      <Ionicons
        name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'}
        size={18}
        color={lightTheme.textTertiary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: lightTheme.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: lightTheme.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...typography.textStyles.bodyMedium,
    color: lightTheme.text,
  },
  metric: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: lightTheme.textSecondary,
    marginTop: 1,
  },
});
