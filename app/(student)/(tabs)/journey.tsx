import React, { useState, useCallback } from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/layout';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { QuranHeatMap } from '@/features/gamification/components/QuranHeatMap';
import {
  useStickerCollection,
  useNewStickers,
  useMarkStickerSeen,
} from '@/features/gamification/hooks/useStickers';
import { StickerGrid } from '@/features/gamification/components/StickerGrid';
import { StickerReveal } from '@/features/gamification/components/StickerReveal';
import { StickerDetailSheet } from '@/features/gamification/components/StickerDetailSheet';
import type { AwardedSticker, StickerCollectionItem } from '@/features/gamification/types/gamification.types';
import { useAuth } from '@/hooks/useAuth';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { normalize } from '@/theme/normalize';

type Segment = 'map' | 'stickers';

export default function JourneyScreen() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [activeSegment, setActiveSegment] = useState<Segment>('map');

  return (
    <Screen hasTabBar>
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>{t('student.journey.title')}</Text>

        {/* Segmented Control */}
        <View style={styles.segmentedControl}>
          <Pressable
            style={[styles.segmentButton, activeSegment === 'map' && styles.segmentButtonActive]}
            onPress={() => setActiveSegment('map')}
          >
            <Text style={[styles.segmentText, activeSegment === 'map' && styles.segmentTextActive]}>
              {t('student.journey.quranMap')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segmentButton, activeSegment === 'stickers' && styles.segmentButtonActive]}
            onPress={() => setActiveSegment('stickers')}
          >
            <Text style={[styles.segmentText, activeSegment === 'stickers' && styles.segmentTextActive]}>
              {t('student.journey.stickers')}
            </Text>
          </Pressable>
        </View>

        {/* Segment Content */}
        {activeSegment === 'map' ? (
          <QuranHeatMap studentId={profile?.id ?? ''} />
        ) : (
          <StickersSegment />
        )}
      </View>
    </Screen>
  );
}

// ─── Stickers Segment ────────────────────────────────────────────────────────

function StickersSegment() {
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
    <View style={styles.stickersContainer}>
      <View style={styles.stickersHeader}>
        <Text style={styles.stickersCount}>
          {t('student.stickers.totalCollected', { count: totalCount })}
        </Text>
        {uniqueCount !== totalCount && (
          <Text style={styles.stickersUniqueCount}>
            {t('student.stickers.uniqueCount', { count: uniqueCount })}
          </Text>
        )}
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
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    fontSize: normalize(24),
    paddingHorizontal: spacing.lg,
  },

  // Segmented Control (matches lessons.tsx pattern)
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.neutral[100],
    borderRadius: radius.full,
    padding: normalize(3),
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  segmentButtonActive: {
    backgroundColor: colors.primary[500],
  },
  segmentText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(13),
    color: colors.neutral[500],
  },
  segmentTextActive: {
    color: colors.white,
  },

  // Stickers
  stickersContainer: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: 0,
  },
  stickersHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  stickersCount: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
  },
  stickersUniqueCount: {
    ...typography.textStyles.caption,
    color: lightTheme.textTertiary,
  },
});
