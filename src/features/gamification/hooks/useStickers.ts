import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gamificationService } from '../services/gamification.service';
import { mutationTracker } from '@/features/realtime';
import type { AwardedSticker, AwardRecord, StickerCollectionItem, StickerTier } from '../types/gamification.types';

/**
 * Fetch the global heritage sticker catalog (no school scope needed).
 * Stale for 30 min since the catalog rarely changes.
 */
export const useStickers = () => {
  return useQuery({
    queryKey: ['stickers'],
    queryFn: async () => {
      const { data, error } = await gamificationService.getStickers();
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 30,
  });
};

/**
 * Fetch all stickers awarded to a student (raw list, most recent first).
 */
export const useStudentStickers = (studentId: string | undefined) => {
  return useQuery({
    queryKey: ['student-stickers', studentId],
    queryFn: async () => {
      if (!studentId) throw new Error('Student ID is required');
      const { data, error } = await gamificationService.getStudentStickers(studentId);
      if (error) throw error;
      return (data ?? []) as AwardedSticker[];
    },
    enabled: !!studentId,
  });
};

/**
 * Aggregate awarded stickers into a collection grouped by sticker_id.
 * Each item shows the sticker, how many times earned, and whether any are new.
 */
export const useStickerCollection = (studentId: string | undefined) => {
  const query = useStudentStickers(studentId);

  const collection: StickerCollectionItem[] = [];
  if (query.data) {
    const grouped = new Map<string, { items: AwardedSticker[]; hasNew: boolean }>();
    for (const item of query.data) {
      const key = item.sticker_id;
      const existing = grouped.get(key);
      if (existing) {
        existing.items.push(item);
        if (item.is_new) existing.hasNew = true;
      } else {
        grouped.set(key, { items: [item], hasNew: item.is_new });
      }
    }

    for (const [, { items, hasNew }] of grouped) {
      const mostRecent = items[0];
      const earliest = items[items.length - 1];
      if (mostRecent.stickers) {
        const awards: AwardRecord[] = items.map((a) => ({
          id: a.id,
          awardedAt: a.awarded_at,
          awardedBy: a.profiles?.full_name ?? null,
          reason: a.reason ?? null,
        }));

        collection.push({
          sticker: {
            id: mostRecent.stickers.id,
            name_ar: mostRecent.stickers.name_ar,
            name_en: mostRecent.stickers.name_en,
            tier: mostRecent.stickers.tier as StickerTier,
            image_path: mostRecent.stickers.image_path,
            is_active: true,
            created_at: '',
          },
          count: items.length,
          firstAwardedAt: earliest.awarded_at,
          lastAwardedAt: mostRecent.awarded_at,
          lastAwardedBy: mostRecent.profiles?.full_name ?? null,
          isNew: hasNew,
          awards,
        });
      }
    }
  }

  return {
    ...query,
    collection,
  };
};

/**
 * Get stickers that are new (is_new = true) for reveal animation.
 */
export const useNewStickers = (studentId: string | undefined) => {
  const query = useStudentStickers(studentId);
  const newStickers = (query.data ?? []).filter((s) => s.is_new);
  return { ...query, newStickers };
};

/**
 * Award a sticker to a student (teacher/admin use).
 */
export const useAwardSticker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['award-sticker'],
    mutationFn: (input: {
      studentId: string;
      stickerId: string;
      awardedBy: string;
      reason?: string;
    }) => gamificationService.awardSticker(input),
    onSuccess: (data, variables) => {
      if (data?.data?.id) {
        mutationTracker.record('student_stickers', data.data.id);
      }
      queryClient.invalidateQueries({
        queryKey: ['student-stickers', variables.studentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['student-dashboard', variables.studentId],
      });
    },
  });
};

/**
 * Mark a single sticker as seen (dismiss reveal animation).
 */
export const useMarkStickerSeen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['mark-sticker-seen'],
    mutationFn: (input: { studentStickerId: string; studentId: string }) =>
      gamificationService.markStickersAsSeen(input.studentStickerId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['student-stickers', variables.studentId],
      });
    },
  });
};

/**
 * Mark all new stickers as seen for a student.
 */
export const useMarkAllStickersSeen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['mark-all-stickers-seen'],
    mutationFn: (input: { studentId: string }) =>
      gamificationService.markAllStickersAsSeen(input.studentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['student-stickers', variables.studentId],
      });
    },
  });
};
