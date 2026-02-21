import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { TOTAL_QURAN_AYAHS } from '@/lib/quran-metadata';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';
import type { MemorizationStats } from '../types/memorization.types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MemorizationHealthCardProps {
  stats: MemorizationStats | null | undefined;
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────────────────
// Hero ayah counter — large "X / 6,236" display with progress bar.
// Centered layout to feel like a motivational milestone tracker.

export function MemorizationHealthCard({ stats, style }: MemorizationHealthCardProps) {
  const { t } = useTranslation();

  const percentage = stats?.quran_percentage ?? 0;
  const memorized = stats?.total_ayahs_memorized ?? 0;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.heroCount}>
        {memorized}
        <Text style={styles.heroTotal}> / {TOTAL_QURAN_AYAHS}</Text>
      </Text>
      <Text style={styles.heroLabel}>{t('memorization.ayahsMemorizedLabel')}</Text>
      <ProgressBar progress={percentage / 100} variant="primary" height={6} />
      <Text style={styles.heroPercent}>{percentage.toFixed(1)}%</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  heroCount: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(32),
    color: colors.primary[700],
  },
  heroTotal: {
    fontFamily: typography.fontFamily.regular,
    fontSize: normalize(22),
    color: colors.neutral[400],
  },
  heroLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(13),
    color: colors.neutral[500],
    marginBottom: spacing.xs,
  },
  heroPercent: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(12),
    color: colors.primary[500],
    marginTop: normalize(2),
  },
});
