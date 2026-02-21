import React from 'react';
import { I18nManager, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { SURAHS } from '@/lib/quran-metadata';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';
import type { RevisionScheduleItem } from '../types/memorization.types';

// ─── Status Colors ───────────────────────────────────────────────────────────

const STATUS_DOT_COLORS: Record<string, string> = {
  new: colors.accent.indigo[500],
  learning: colors.secondary[500],
  memorized: '#22C55E',
  needs_review: '#F97316',
};

const STATUS_BG_COLORS: Record<string, string> = {
  new: colors.accent.indigo[50],
  learning: colors.secondary[50],
  memorized: '#DCFCE7',
  needs_review: '#FFEDD5',
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface MemorizationRowProps {
  item: RevisionScheduleItem;
  onPress?: () => void;
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MemorizationRow({ item, onPress, style }: MemorizationRowProps) {
  const { t } = useTranslation();

  const surah = SURAHS[item.surah_number - 1];
  const isRTL = I18nManager.isRTL;
  const surahName = surah
    ? (isRTL ? surah.nameArabic : surah.nameEnglish)
    : `Surah ${item.surah_number}`;
  const dotColor = STATUS_DOT_COLORS[item.status] ?? colors.neutral[400];
  const bgColor = STATUS_BG_COLORS[item.status] ?? colors.neutral[50];
  const chevron = isRTL ? 'chevron-back' : 'chevron-forward';

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed, style]}
      onPress={onPress}
    >
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {surahName}
          {' \u00B7 '}
          {t('memorization.ayahRange', { from: item.from_ayah, to: item.to_ayah })}
        </Text>
        <View style={[styles.chip, { backgroundColor: bgColor }]}>
          <Text style={[styles.chipText, { color: dotColor }]}>
            {t(`memorization.status.${item.status}`)}
          </Text>
        </View>
      </View>
      <Ionicons name={chevron} size={16} color={colors.neutral[300]} />
    </Pressable>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.06)',
  },
  pressed: {
    opacity: 0.7,
  },
  dot: {
    width: normalize(10),
    height: normalize(10),
    borderRadius: normalize(5),
  },
  info: {
    flex: 1,
    gap: normalize(4),
  },
  title: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(14),
    color: colors.neutral[900],
  },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: normalize(2),
    borderRadius: radius.full,
  },
  chipText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(11),
  },
});
