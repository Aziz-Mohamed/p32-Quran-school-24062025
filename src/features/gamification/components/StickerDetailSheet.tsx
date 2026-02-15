import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useRTL } from '@/hooks/useRTL';
import { getStickerImageUrl } from '@/lib/storage';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { shadows } from '@/theme/shadows';
import { normalize } from '@/theme/normalize';
import { TIER_COLORS } from './StickerGrid';
import type { StickerCollectionItem, StickerTier } from '../types/gamification.types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface StickerDetailSheetProps {
  item: StickerCollectionItem | null;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StickerDetailSheet({ item, onClose }: StickerDetailSheetProps) {
  const { t } = useTranslation();
  const { isRTL } = useRTL();

  if (!item) return null;

  const tier = item.sticker.tier as StickerTier;
  const tierColor = TIER_COLORS[tier] ?? colors.neutral[400];
  const name = isRTL ? item.sticker.name_ar : item.sticker.name_en;
  const imageUrl = getStickerImageUrl(item.sticker.image_path);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isRTL ? 'ar' : 'en', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Close button */}
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={12}
            accessibilityLabel={t('common.close')}
          >
            <Ionicons name="close" size={normalize(22)} color={colors.neutral[400]} />
          </Pressable>

          {/* Sticker image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.stickerImage}
              contentFit="contain"
              cachePolicy="disk"
            />
          </View>

          {/* Name */}
          <Text style={styles.stickerName}>{name}</Text>

          {/* Tier badge + Points */}
          <View style={styles.badgeRow}>
            <View style={styles.tierBadge}>
              <Text style={[styles.tierLabel, { color: tierColor }]}>
                {t(`student.stickers.tier.${tier}`)}
              </Text>
            </View>
            <View style={styles.pointsBadge}>
              <Ionicons name="star" size={normalize(14)} color={colors.gamification.gold} />
              <Text style={styles.pointsText}>
                {item.sticker.points_value} {t('student.stickers.points')}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <StatItem
              label={t('student.stickers.detail.timesEarned')}
              value={`${item.count}x`}
            />
            <View style={styles.statDivider} />
            <StatItem
              label={t('student.stickers.detail.firstEarned')}
              value={formatDate(item.firstAwardedAt)}
            />
            <View style={styles.statDivider} />
            <StatItem
              label={t('student.stickers.detail.lastEarned')}
              value={formatDate(item.lastAwardedAt)}
            />
          </View>

          {/* Awarded by */}
          {item.lastAwardedBy && (
            <View style={styles.awardedByRow}>
              <Ionicons name="person-outline" size={normalize(16)} color={colors.neutral[400]} />
              <Text style={styles.awardedByLabel}>
                {t('student.stickers.detail.awardedBy')}:
              </Text>
              <Text style={styles.awardedByValue}>{item.lastAwardedBy}</Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Stat Item ────────────────────────────────────────────────────────────────

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + normalize(16),
    paddingTop: spacing.sm,
    alignItems: 'center',
    ...shadows.lg,
  },
  handleBar: {
    width: normalize(40),
    height: normalize(4),
    borderRadius: normalize(2),
    backgroundColor: colors.neutral[200],
    marginBottom: spacing.lg,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
    padding: spacing.xs,
  },
  imageContainer: {
    width: normalize(180),
    height: normalize(180),
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  stickerImage: {
    width: normalize(150),
    height: normalize(150),
  },
  stickerName: {
    ...typography.textStyles.subheading,
    color: colors.neutral[800],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tierBadge: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(5),
    borderRadius: normalize(12),
    backgroundColor: colors.neutral[50],
  },
  tierLabel: {
    fontSize: normalize(12),
    fontFamily: typography.fontFamily.semiBold,
    letterSpacing: 0.5,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  pointsText: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[600],
    fontFamily: typography.fontFamily.semiBold,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    width: '100%',
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: normalize(2),
  },
  statValue: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[800],
    fontFamily: typography.fontFamily.bold,
  },
  statLabel: {
    fontSize: normalize(11),
    color: colors.neutral[500],
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: normalize(30),
    backgroundColor: colors.neutral[200],
  },
  awardedByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
    paddingVertical: spacing.sm,
  },
  awardedByLabel: {
    ...typography.textStyles.caption,
    color: colors.neutral[500],
  },
  awardedByValue: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[700],
    fontFamily: typography.fontFamily.semiBold,
  },
});
