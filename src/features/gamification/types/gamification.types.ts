import type { Tables } from '@/types/database.types';

/** A single entry in the student leaderboard */
export interface LeaderboardEntry {
  rank: number;
  student: Tables<'students'>;
  profile: Tables<'profiles'>;
  totalPoints: number;
  currentLevel: number;
  currentStreak: number;
}

/** Sticker tier type matching the DB CHECK constraint */
export type StickerTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'seasonal';

/** A single award record shown in the detail view */
export interface AwardRecord {
  id: string;
  awardedAt: string;
  awardedBy: string | null;
  reason: string | null;
}

/** Aggregated sticker in a student's collection (grouped by sticker_id) */
export interface StickerCollectionItem {
  sticker: Tables<'stickers'>;
  count: number;
  firstAwardedAt: string;
  lastAwardedAt: string;
  lastAwardedBy: string | null;
  isNew: boolean;
  awards: AwardRecord[];
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
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  totalStickers: number;
  activeCertifications: number;
}

/** Rubʿ certification row with teacher name join */
export type RubCertification = Tables<'student_rub_certifications'> & {
  profiles: { full_name: string } | null;
};

/** Rubʿ reference row (static 240-row table) */
export type RubReference = Tables<'quran_rub_reference'>;

/** Freshness state derived from client-side computation */
export type FreshnessState = 'fresh' | 'fading' | 'warning' | 'critical' | 'dormant' | 'uncertified';

/** Computed freshness info for a certification */
export interface FreshnessInfo {
  percentage: number;
  state: FreshnessState;
  daysUntilDormant: number;
  intervalDays: number;
}

/** Certification enriched with client-side computed freshness */
export interface EnrichedCertification extends RubCertification {
  freshness: FreshnessInfo;
}

/** A single rubʿ slot in the progress map (reference + optional certification) */
export interface RubProgressItem {
  reference: RubReference;
  certification: EnrichedCertification | null;
  state: FreshnessState;
}

/** Input for certifying a new rubʿ */
export interface CertificationInput {
  studentId: string;
  rubNumber: number;
  certifiedBy: string;
}
