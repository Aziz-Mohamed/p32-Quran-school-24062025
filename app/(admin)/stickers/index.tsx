import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { useStickers } from '@/features/gamification/hooks/useStickers';
import { useRTL } from '@/hooks/useRTL';
import { getStickerImageUrl } from '@/lib/storage';
import { typography } from '@/theme/typography';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { StickerTier } from '@/features/gamification/types/gamification.types';

// ─── Tier Badge Variants ──────────────────────────────────────────────────────

const TIER_VARIANT: Record<StickerTier, 'default' | 'success' | 'warning' | 'info'> = {
  common: 'default',
  rare: 'info',
  epic: 'info',
  legendary: 'warning',
  seasonal: 'info',
  trophy: 'warning',
};

// ─── Sticker Catalog Screen ──────────────────────────────────────────────────

export default function StickerCatalogScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isRTL } = useRTL();

  const { data: stickers = [], isLoading, error, refetch } = useStickers();

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={(error as Error).message} onRetry={refetch} />;

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            title={t('common.back')}
            onPress={() => router.back()}
            variant="ghost"
            size="sm"
          />
          <Text style={styles.title}>{t('admin.stickers.title')}</Text>
          <View style={{ width: 70 }} />
        </View>

        <Text style={styles.subtitle}>
          {t('admin.stickers.catalogCount', { count: stickers.length })}
        </Text>

        {stickers.length === 0 ? (
          <EmptyState
            icon="star-outline"
            title={t('admin.stickers.emptyTitle')}
            description={t('admin.stickers.emptyDescription')}
          />
        ) : (
          <FlashList
            data={stickers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const tier = item.tier as StickerTier;
              const name = isRTL ? item.name_ar : item.name_en;
              const imageUrl = getStickerImageUrl(item.image_path);

              return (
                <Card variant="outlined" style={styles.stickerCard}>
                  <View style={styles.stickerRow}>
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.stickerImage}
                      contentFit="contain"
                      cachePolicy="disk"
                    />
                    <View style={styles.stickerInfo}>
                      <Text style={styles.stickerName}>{name}</Text>
                      <Text style={styles.stickerMeta}>
                        {item.points_value} {t('common.pts')}
                      </Text>
                    </View>
                    <Badge
                      label={t(`student.stickers.tier.${tier}`)}
                      variant={TIER_VARIANT[tier] ?? 'default'}
                      size="sm"
                    />
                  </View>
                </Card>
              );
            }}
          />
        )}
      </View>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    flex: 1,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    textAlign: 'center',
  },
  stickerCard: {
    marginBottom: spacing.sm,
  },
  stickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stickerImage: {
    width: 40,
    height: 40,
  },
  stickerInfo: {
    flex: 1,
  },
  stickerName: {
    ...typography.textStyles.body,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.semiBold,
  },
  stickerMeta: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    marginTop: 2,
  },
});
