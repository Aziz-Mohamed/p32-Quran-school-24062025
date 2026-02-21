import type { Tables } from '@/types/database.types';

/** Overview of a single child for the parent dashboard */
export interface ChildOverview {
  student: Tables<'students'>;
  profile: Tables<'profiles'>;
  class: Tables<'classes'> | null;
  currentLevel: number;
  recentSessions: Tables<'sessions'>[];
  attendanceSummary: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    attendanceRate: number;
  };
  gamification: {
    currentStreak: number;
    longestStreak: number;
    stickerCount: number;
  };
}

/** List of children belonging to a parent */
export interface ParentChildrenData {
  parentProfile: Tables<'profiles'>;
  children: ChildOverview[];
}
