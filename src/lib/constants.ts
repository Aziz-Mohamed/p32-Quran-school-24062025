import type {
  AttendanceStatus,
  LessonType,
  UserRole,
} from '@/types/common.types';

// ─── App ────────────────────────────────────────────────────────────────────

export const APP_NAME = 'Quran School';

export const MAX_STUDENTS_PER_CLASS = 20;

// ─── Role & Status Enumerations ─────────────────────────────────────────────

export const ROLES: readonly UserRole[] = [
  'student',
  'teacher',
  'parent',
  'admin',
] as const;

export const ATTENDANCE_STATUSES: readonly AttendanceStatus[] = [
  'present',
  'absent',
  'late',
  'excused',
] as const;

export const LESSON_TYPES: readonly LessonType[] = [
  'memorization',
  'revision',
  'tajweed',
  'recitation',
] as const;

// ─── Scoring ────────────────────────────────────────────────────────────────

export const SCORE_RANGE = {
  min: 1,
  max: 5,
} as const;

// ─── Points System ──────────────────────────────────────────────────────────

export const POINTS = {
  session_completed: 10,
  good_score_bonus: 5,
  homework_on_time: 10,
  perfect_attendance_week: 20,
  memorization_milestone: 50,
  sticker_received: 5,
  trophy_received: 25,
  achievement_unlocked: 15,
} as const;

// ─── Level Progression ──────────────────────────────────────────────────────

export interface LevelDefinition {
  readonly level: number;
  readonly points: number;
  readonly title: string;
}

export const LEVELS: readonly LevelDefinition[] = [
  { level: 1, points: 0, title: 'Beginner' },
  { level: 2, points: 100, title: 'Learner' },
  { level: 3, points: 300, title: 'Reciter' },
  { level: 4, points: 600, title: 'Memorizer' },
  { level: 5, points: 1000, title: 'Scholar' },
  { level: 6, points: 1500, title: 'Hafiz in Training' },
  { level: 7, points: 2200, title: 'Hafiz' },
  { level: 8, points: 3000, title: 'Master Hafiz' },
  { level: 9, points: 3500, title: 'Quran Guardian' },
] as const;
