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
import type { StickerCollectionItem, StickerTier } from '../types/gamification.types';

// ─── Tier Config ──────────────────────────────────────────────────────────────

const TIER_COLORS: Record<StickerTier, string> = {
  common: colors.neutral[400],
  rare: colors.primary[500],
  epic: colors.accent.violet[500],
  legendary: colors.secondary[500],
  seasonal: colors.accent.sky[500],
  trophy: colors.gamification.gold,
};

const TIER_BG_COLORS: Record<StickerTier, string> = {
  common: colors.neutral[50],
  rare: colors.primary[50],
  epic: colors.accent.violet[50],
  legendary: colors.secondary[50],
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
  item: StickerCellProps['item']; // Fixed type issue
  isRTL: boolean;
  onPress?: () => void;
}

// Re-defining internal props for clarity
function StickerCell({ item, isRTL, onPress }: { item: StickerCollectionItem, isRTL: boolean, onPress?: () => void }) {
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
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.stickerImage}
          contentFit="contain"
          cachePolicy="disk"
          transition={300}
        />
        {item.isNew && <View style={styles.newDot} />}
      </View>

      <Text style={styles.stickerName} numberOfLines={2}>
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
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CELL_SIZE = '31%' as const;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'flex-start',
  },
  cell: {
    width: CELL_SIZE,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  cellPressed: {
    transform: [{ scale: 0.96 }],
    ...shadows.none,
  },
  imageContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerImage: {
    width: 52,
    height: 52,
  },
  newDot: {
    position: 'absolute',
    top: 0,
    end: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent.rose[500],
    borderWidth: 2,
    borderColor: colors.white,
  },
  stickerName: {
    ...typography.textStyles.label,
    color: colors.neutral[800],
    fontFamily: typography.fontFamily.semiBold,
    textAlign: 'center',
    minHeight: 28,
    paddingHorizontal: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  tierBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tierLabel: {
    fontSize: 9,
    fontFamily: typography.fontFamily.bold,
    textTransform: 'uppercase',
  },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    fontSize: 9,
    color: colors.white,
    fontFamily: typography.fontFamily.bold,
  },
});
