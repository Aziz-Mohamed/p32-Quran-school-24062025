import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { lightTheme, colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';
import { ChartContainer } from './ChartContainer';
import type { ChildGamificationSummary as ChildGamificationSummaryType } from '../types/reports.types';

interface ChildGamificationSummaryProps {
  data: ChildGamificationSummaryType | undefined;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function ChildGamificationSummary({
  data,
  isLoading,
  isError,
  onRetry,
}: ChildGamificationSummaryProps) {
  const { t } = useTranslation();
  const isEmpty = !isLoading && !isError && !data;

  return (
    <ChartContainer
      title={t('reports.gamification.title')}
      isLoading={isLoading}
      isEmpty={isEmpty}
      isError={isError}
      onRetry={onRetry}
    >
      {data && (
        <View style={styles.grid}>
          <GamificationItem
            icon="star"
            iconColor={colors.secondary[500]}
            label={t('reports.gamification.totalStickers')}
            value={data.totalStickers}
          />
          <GamificationItem
            icon="trophy"
            iconColor={colors.semantic.warning}
            label={t('reports.gamification.achievements')}
            value={data.achievementsUnlocked}
          />
          <GamificationItem
            icon="layers"
            iconColor={colors.primary[500]}
            label={t('reports.gamification.currentLevel')}
            value={data.currentLevelTitle}
          />
          <GamificationItem
            icon="flame"
            iconColor={colors.semantic.error}
            label={t('reports.gamification.currentStreak')}
            value={data.currentStreak}
          />
          <GamificationItem
            icon="ribbon"
            iconColor={colors.primary[600]}
            label={t('reports.gamification.longestStreak')}
            value={data.longestStreak}
          />
          <GamificationItem
            icon="diamond"
            iconColor={colors.secondary[600]}
            label={t('reports.gamification.totalPoints')}
            value={data.totalPoints.toLocaleString()}
          />
        </View>
      )}
    </ChartContainer>
  );
}

function GamificationItem({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: string;
  iconColor: string;
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.item}>
      <Ionicons name={icon as any} size={normalize(20)} color={iconColor} />
      <Text style={styles.itemValue}>{value}</Text>
      <Text style={styles.itemLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  item: {
    flex: 1,
    minWidth: normalize(100),
    alignItems: 'center',
    backgroundColor: lightTheme.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: normalize(4),
  },
  itemValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: lightTheme.text,
  },
  itemLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: lightTheme.textSecondary,
    textAlign: 'center',
  },
});
