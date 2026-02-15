import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import { useRTL } from '@/hooks/useRTL';
import { getStickerImageUrl } from '@/lib/storage';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { shadows } from '@/theme/shadows';
import { normalize } from '@/theme/normalize';
import type { StickerCollectionItem, StickerTier } from '../types/gamification.types';

// ─── Tier Config ──────────────────────────────────────────────────────────────

export const TIER_COLORS: Record<StickerTier, string> = {
  bronze: colors.neutral[400],
  silver: colors.primary[500],
  gold: colors.accent.violet[500],
  diamond: colors.secondary[500],
  seasonal: colors.accent.sky[500],
  trophy: colors.gamification.gold,
};

export const TIER_BG_COLORS: Record<StickerTier, string> = {
  bronze: colors.neutral[50],
  silver: colors.primary[50],
  gold: colors.accent.violet[50],
  diamond: colors.secondary[50],
  seasonal: colors.accent.sky[50],
  trophy: '#FFFBEB', // amber 50
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface StickerGridProps {
  collection: StickerCollectionItem[];
  onStickerPress?: (item: StickerCollectionItem) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StickerGrid({ collection, onStickerPress }: StickerGridProps) {
  const { isRTL } = useRTL();

  const renderItem = useCallback(
    (item: StickerCollectionItem) => (
      <StickerCell
        key={item.sticker.id}
        item={item}
        isRTL={isRTL}
        onPress={onStickerPress ? () => onStickerPress(item) : undefined}
      />
    ),
    [isRTL, onStickerPress],
  );

  return <View style={styles.grid}>{collection.map(renderItem)}</View>;
}

// ─── Cell ─────────────────────────────────────────────────────────────────────

interface StickerCellProps {
  item: StickerCollectionItem;
  isRTL: boolean;
  onPress?: () => void;
}

function StickerCell({ item, isRTL, onPress }: StickerCellProps) {
  const { t } = useTranslation();
  const tier = item.sticker.tier as StickerTier;
  const tierColor = TIER_COLORS[tier] ?? colors.neutral[400];
  const bgColor = TIER_BG_COLORS[tier] ?? colors.white;
  const name = isRTL ? item.sticker.name_ar : item.sticker.name_en;
  const imageUrl = getStickerImageUrl(item.sticker.image_path);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cell,
        { backgroundColor: bgColor },
        pressed && styles.cellPressed
      ]}
      onPress={onPress}
      accessibilityLabel={`${name} — ${t('student.stickers.count', { count: item.count })}`}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.stickerImage}
        contentFit="contain"
        cachePolicy="disk"
        transition={300}
      />
      {item.isNew && <View style={styles.newDot} />}

      <View style={styles.footer}>
        <Text style={styles.stickerName} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.meta}>
          <View style={[styles.tierBadge, { backgroundColor: tierColor + '20' }]}>
            <Text style={[styles.tierLabel, { color: tierColor }]}>
              {t(`student.stickers.tier.${tier}`)}
            </Text>
          </View>
          {item.count > 1 && (
            <View style={[styles.countBadge, { backgroundColor: tierColor }]}>
              <Text style={styles.countText}>{item.count}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CELL_SIZE = '47%' as const;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'flex-start',
  },
  cell: {
    width: CELL_SIZE,
    borderRadius: radius.lg,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  cellPressed: {
    transform: [{ scale: 0.97 }],
    ...shadows.none,
  },
  stickerImage: {
    width: '100%',
    aspectRatio: 1,
  },
  newDot: {
    position: 'absolute',
    top: normalize(8),
    right: normalize(8),
    width: normalize(14),
    height: normalize(14),
    borderRadius: normalize(7),
    backgroundColor: colors.accent.rose[500],
    borderWidth: 2,
    borderColor: colors.white,
    zIndex: 1,
  },
  footer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: normalize(4),
    alignItems: 'center',
  },
  stickerName: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[800],
    fontFamily: typography.fontFamily.semiBold,
    textAlign: 'center',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },
  tierBadge: {
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(3),
    borderRadius: normalize(8),
  },
  tierLabel: {
    fontSize: normalize(10),
    fontFamily: typography.fontFamily.bold,
    textTransform: 'uppercase',
  },
  countBadge: {
    minWidth: normalize(22),
    height: normalize(22),
    borderRadius: normalize(11),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: normalize(5),
  },
  countText: {
    fontSize: normalize(10),
    color: colors.white,
    fontFamily: typography.fontFamily.bold,
  },
});
