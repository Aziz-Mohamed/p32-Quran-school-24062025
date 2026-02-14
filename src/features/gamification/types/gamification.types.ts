import type { Tables } from '@/types/database.types';

/** A single entry in the student leaderboard */
export interface LeaderboardEntry {
  rank: number;
  student: Tables<'students'>;
  profile: Tables<'profiles'>;
  totalPoints: number;
  currentLevel: Tables<'levels'> | null;
  currentStreak: number;
}

/** Trophy definition with the student's earned status */
export interface TrophyWithStatus extends Tables<'trophies'> {
  earned: boolean;
  earnedAt: string | null;
}

/** Achievement definition with the student's earned status */
export interface AchievementWithStatus extends Tables<'achievements'> {
  earned: boolean;
  earnedAt: string | null;
}

/** Sticker tier type matching the DB CHECK constraint */
export type StickerTier = 'common' | 'rare' | 'epic' | 'legendary' | 'seasonal' | 'trophy';

/** Aggregated sticker in a student's collection (grouped by sticker_id) */
export interface StickerCollectionItem {
  sticker: Tables<'stickers'>;
  count: number;
  lastAwardedAt: string;
  isNew: boolean;
}

/** A single awarded sticker instance with joined details */
export interface AwardedSticker {
  id: string;
  sticker_id: string;
  awarded_at: string;
  awarded_by: string;
  reason: string | null;
  is_new: boolean;
  stickers: {
    id: string;
    name_ar: string;
    name_en: string;
    tier: string;
    image_path: string;
    points_value: number;
  } | null;
  profiles: {
    full_name: string;
  } | null;
}

/** Summary of a student's gamification progress */
export interface GamificationSummary {
  totalPoints: number;
  currentLevel: Tables<'levels'> | null;
  currentStreak: number;
  longestStreak: number;
  trophiesEarned: number;
  trophiesTotal: number;
  achievementsEarned: number;
  achievementsTotal: number;
  totalStickers: number;
}
