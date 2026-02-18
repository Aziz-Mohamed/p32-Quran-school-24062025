import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SkeletonLoader } from '@/components/feedback';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { colors, lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';

interface ChartContainerProps {
  children: React.ReactNode;
  title?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyMessage?: string;
  accessibilityLabel?: string;
}

export function ChartContainer({
  children,
  title,
  isLoading,
  isEmpty,
  isError,
  onRetry,
  emptyMessage,
  accessibilityLabel,
}: ChartContainerProps) {
  const { t } = useTranslation();

  return (
    <View
      style={styles.container}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="summary"
    >
      {title && <Text style={styles.title}>{title}</Text>}

      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <SkeletonLoader width="100%" height={200} borderRadius={radius.md} />
        </View>
      ) : isError ? (
        <View style={styles.stateContainer}>
          <Text style={styles.errorText}>
            {t('reports.errorMessage')}
          </Text>
          {onRetry && (
            <Text style={styles.retryButton} onPress={onRetry}>
              {t('reports.retry')}
            </Text>
          )}
        </View>
      ) : isEmpty ? (
        <View style={styles.stateContainer}>
          <Text style={styles.emptyText}>
            {emptyMessage ?? t('reports.noData')}
          </Text>
        </View>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightTheme.surfaceElevated,
    borderRadius: radius.lg,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: lightTheme.border,
  },
  title: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    color: lightTheme.text,
    marginBottom: spacing.md,
  },
  skeletonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.semantic.error,
    textAlign: 'center',
  },
  retryButton: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.primary[500],
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: lightTheme.textSecondary,
    textAlign: 'center',
  },
});
