import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';
import { TOTAL_QURAN_AYAHS } from '@/lib/quran-metadata';
import type { MemorizationStats } from '../types/memorization.types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MemorizationProgressBarProps {
  stats: MemorizationStats | null;
  compact?: boolean;
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MemorizationProgressBar({ stats, compact = false, style }: MemorizationProgressBarProps) {
  const { t } = useTranslation();

  if (!stats) return null;

  const progress = stats.quran_percentage / 100;
  const memorizedAyahs = stats.total_ayahs_memorized;
  const inProgressAyahs = stats.total_ayahs_in_progress;

  if (compact) {
    return (
      <View style={[styles.compactRoot, style]}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactLabel}>{t('memorization.quranProgress')}</Text>
          <Text style={styles.compactPercent}>{stats.quran_percentage.toFixed(1)}%</Text>
        </View>
        <ProgressBar progress={progress} variant="primary" height={6} />
      </View>
    );
  }

  return (
    <View style={[styles.root, style]}>
      {/* Main Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>{t('memorization.quranMemorization')}</Text>
          <Text style={styles.progressPercent}>{stats.quran_percentage.toFixed(1)}%</Text>
        </View>
        <ProgressBar progress={progress} variant="primary" height={10} />
        <Text style={styles.progressDetail}>
          {t('memorization.ayahsMemorized', { memorized: memorizedAyahs.toLocaleString(), total: TOTAL_QURAN_AYAHS.toLocaleString() })}
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatItem
          icon="book-outline"
          iconColor={colors.accent.indigo[500]}
          label={t('memorization.surahsStartedLabel')}
          value={stats.surahs_started}
        />
        <StatItem
          icon="checkmark-done-outline"
          iconColor={colors.semantic.success}
          label={t('memorization.surahsComplete')}
          value={stats.surahs_completed}
        />
        <StatItem
          icon="hourglass-outline"
          iconColor={colors.secondary[500]}
          label={t('memorization.inProgress')}
          value={inProgressAyahs}
        />
        <StatItem
          icon="mic-outline"
          iconColor={colors.primary[500]}
          label={t('memorization.totalRecitations')}
          value={stats.total_recitations}
        />
      </View>

      {/* Average Accuracy */}
      {stats.avg_overall_accuracy != null && (
        <View style={styles.accuracyRow}>
          <Ionicons name="star" size={normalize(16)} color={colors.secondary[500]} />
          <Text style={styles.accuracyLabel}>{t('memorization.averageAccuracy')}</Text>
          <Text style={styles.accuracyValue}>{stats.avg_overall_accuracy.toFixed(1)} / 5</Text>
        </View>
      )}
    </View>
  );
}

// ─── Stat Item ───────────────────────────────────────────────────────────────

function StatItem({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: number;
}) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statIconContainer, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={normalize(18)} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    width: '100%',
    gap: spacing.lg,
  },
  compactRoot: {
    width: '100%',
    gap: spacing.xs,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: lightTheme.textSecondary,
  },
  compactPercent: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
  },
  progressSection: {
    gap: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  progressTitle: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
  },
  progressPercent: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.primary[600],
  },
  progressDetail: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: lightTheme.textTertiary,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: lightTheme.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: lightTheme.border,
  },
  statIconContainer: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: lightTheme.text,
  },
  statLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: lightTheme.textSecondary,
    textAlign: 'center',
  },
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.secondary[50],
    borderRadius: radius.md,
  },
  accuracyLabel: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.secondary[700],
  },
  accuracyValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
    color: colors.secondary[700],
  },
});
