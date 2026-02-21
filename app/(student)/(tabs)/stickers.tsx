import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/layout';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import {
  useStickerCollection,
  useNewStickers,
  useMarkStickerSeen,
} from '@/features/gamification/hooks/useStickers';
import { StickerGrid } from '@/features/gamification/components/StickerGrid';
import { StickerReveal } from '@/features/gamification/components/StickerReveal';
import { StickerDetailSheet } from '@/features/gamification/components/StickerDetailSheet';
import type { AwardedSticker, StickerCollectionItem } from '@/features/gamification/types/gamification.types';
import { typography } from '@/theme/typography';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

// ─── Stickers Screen ──────────────────────────────────────────────────────────

export default function StickersScreen() {
  const { t } = useTranslation();
  const { profile } = useAuth();

  const {
    collection,
    isLoading,
    error,
    refetch,
    data: rawStickers,
  } = useStickerCollection(profile?.id);

  const { newStickers } = useNewStickers(profile?.id);
  const markSeen = useMarkStickerSeen();

  const [revealSticker, setRevealSticker] = useState<AwardedSticker | null>(
    () => newStickers[0] ?? null,
  );
  const [selectedSticker, setSelectedSticker] = useState<StickerCollectionItem | null>(null);

  const handleDismissReveal = useCallback(() => {
    if (revealSticker) {
      markSeen.mutate({
        studentStickerId: revealSticker.id,
        studentId: profile?.id ?? '',
      });

      const currentIndex = newStickers.findIndex((s) => s.id === revealSticker.id);
      const nextSticker = newStickers[currentIndex + 1] ?? null;
      setRevealSticker(nextSticker);
    }
  }, [revealSticker, newStickers, markSeen, profile?.id]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;

  const totalCount = rawStickers?.length ?? 0;
  const uniqueCount = collection.length;

  return (
    <Screen scroll hasTabBar>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('student.stickers.title')}</Text>
          <View style={styles.counts}>
            <Text style={styles.count}>
              {t('student.stickers.totalCollected', { count: totalCount })}
            </Text>
            {uniqueCount !== totalCount && (
              <Text style={styles.uniqueCount}>
                {t('student.stickers.uniqueCount', { count: uniqueCount })}
              </Text>
            )}
          </View>
        </View>

        {collection.length === 0 ? (
          <EmptyState
            icon="star-outline"
            title={t('student.stickers.emptyTitle')}
            description={t('student.stickers.emptyDescription')}
          />
        ) : (
          <StickerGrid collection={collection} onStickerPress={setSelectedSticker} />
        )}
      </View>

      {revealSticker && (
        <StickerReveal
          sticker={revealSticker}
          onDismiss={handleDismissReveal}
        />
      )}

      <StickerDetailSheet
        item={selectedSticker}
        onClose={() => setSelectedSticker(null)}
      />
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
  },
  counts: {
    alignItems: 'flex-end',
    gap: normalize(2),
  },
  count: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
  },
  uniqueCount: {
    ...typography.textStyles.caption,
    color: lightTheme.textTertiary,
  },
});
