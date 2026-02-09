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

/** Aggregated sticker collection for a student */
export interface StickerCollection {
  sticker: Tables<'stickers'>;
  count: number;
  lastAwardedAt: string;
  lastAwardedBy: Tables<'profiles'> | null;
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
