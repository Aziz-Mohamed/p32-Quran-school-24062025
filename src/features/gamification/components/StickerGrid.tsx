import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import { useRTL } from '@/hooks/useRTL';
import { getStickerImageUrl } from '@/lib/storage';
import { lightTheme, colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import type { StickerCollectionItem, StickerTier } from '../types/gamification.types';

// ─── Tier Config ──────────────────────────────────────────────────────────────

const TIER_COLORS: Record<StickerTier, string> = {
  common: colors.neutral[400],
  rare: colors.primary[500],
  epic: '#8B5CF6',
  legendary: colors.secondary[500],
  seasonal: colors.semantic.info,
  trophy: colors.gamification.gold,
};

const TIER_BORDER_COLORS: Record<StickerTier, string> = {
  common: colors.neutral[200],
  rare: colors.primary[200],
  epic: '#DDD6FE',
  legendary: colors.secondary[200],
  seasonal: '#BFDBFE',
  trophy: '#FEF3C7',
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
  const borderColor = TIER_BORDER_COLORS[tier] ?? colors.neutral[200];
  const tierColor = TIER_COLORS[tier] ?? colors.neutral[400];
  const name = isRTL ? item.sticker.name_ar : item.sticker.name_en;
  const imageUrl = getStickerImageUrl(item.sticker.image_path);

  return (
    <Pressable
      style={[styles.cell, { borderColor }]}
      onPress={onPress}
      accessibilityLabel={`${name} — ${t('student.stickers.count', { count: item.count })}`}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.stickerImage}
          contentFit="contain"
          cachePolicy="disk"
          transition={200}
        />
        {item.isNew && <View style={styles.newDot} />}
      </View>

      <Text style={styles.stickerName} numberOfLines={2}>
        {name}
      </Text>

      <View style={styles.meta}>
        {item.count > 1 && (
          <View style={[styles.countBadge, { backgroundColor: tierColor }]}>
            <Text style={styles.countText}>×{item.count}</Text>
          </View>
        )}
        <Text style={[styles.tierLabel, { color: tierColor }]}>
          {t(`student.stickers.tier.${tier}`)}
        </Text>
      </View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CELL_SIZE = '30%' as const;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cell: {
    width: CELL_SIZE,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.md,
    backgroundColor: lightTheme.surfaceElevated,
    gap: spacing.xs,
  },
  imageContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerImage: {
    width: 48,
    height: 48,
  },
  newDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.semantic.error,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  stickerName: {
    ...typography.textStyles.caption,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.medium,
    textAlign: 'center',
    minHeight: 32,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  countText: {
    ...typography.textStyles.label,
    color: colors.white,
    fontFamily: typography.fontFamily.bold,
  },
  tierLabel: {
    ...typography.textStyles.label,
    textTransform: 'capitalize',
  },
});
