import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { rippleConfigs } from '@/theme/ripple';
import type { RecitationType } from '@/types/common.types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RecitationTypeChipProps {
  type: RecitationType;
  selected?: boolean;
  onPress?: (type: RecitationType) => void;
  style?: ViewStyle;
}

interface RecitationTypeChipsProps {
  value: RecitationType;
  onChange: (type: RecitationType) => void;
  style?: ViewStyle;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<RecitationType, { key: string; bg: string; text: string; border: string }> = {
  new_hifz: {
    key: 'memorization.recitationType.new_hifz',
    bg: colors.accent.indigo[50],
    text: colors.accent.indigo[600],
    border: colors.accent.indigo[500] + '30',
  },
  recent_review: {
    key: 'memorization.recitationType.recent_review',
    bg: colors.secondary[50],
    text: colors.secondary[700],
    border: colors.secondary[500] + '30',
  },
  old_review: {
    key: 'memorization.recitationType.old_review',
    bg: colors.primary[50],
    text: colors.primary[700],
    border: colors.primary[500] + '30',
  },
};

// ─── Single Chip ─────────────────────────────────────────────────────────────

export function RecitationTypeChip({ type, selected, onPress, style }: RecitationTypeChipProps) {
  const { t } = useTranslation();
  const config = TYPE_CONFIG[type];
  const isInteractive = onPress != null;
  const label = t(config.key);

  const chipStyle = selected
    ? [styles.chip, styles.chipSelected, style]
    : [styles.chip, { backgroundColor: config.bg, borderColor: config.border }, style];

  const textStyle = selected
    ? [styles.chipText, styles.chipTextSelected]
    : [styles.chipText, { color: config.text }];

  if (isInteractive) {
    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress(type);
        }}
        style={chipStyle}
        android_ripple={selected ? rippleConfigs.light : rippleConfigs.dark}
        accessibilityRole="radio"
        accessibilityState={{ selected: selected ?? false }}
        accessibilityLabel={label}
      >
        <Text style={textStyle}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <View style={chipStyle} accessibilityRole="text" accessibilityLabel={label}>
      <Text style={textStyle}>{label}</Text>
    </View>
  );
}

// ─── Chip Group ──────────────────────────────────────────────────────────────

export function RecitationTypeChips({ value, onChange, style }: RecitationTypeChipsProps) {
  const { t } = useTranslation();
  return (
    <View style={[styles.chipGroup, style]}>
      <Text style={styles.label}>{t('memorization.recitationType.title')}</Text>
      <View style={styles.chipRow}>
        <RecitationTypeChip
          type="new_hifz"
          selected={value === 'new_hifz'}
          onPress={onChange}
        />
        <RecitationTypeChip
          type="recent_review"
          selected={value === 'recent_review'}
          onPress={onChange}
        />
        <RecitationTypeChip
          type="old_review"
          selected={value === 'old_review'}
          onPress={onChange}
        />
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  chipSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  chipText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipTextSelected: {
    color: colors.white,
  },
  chipGroup: {
    width: '100%',
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: lightTheme.text,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
});
