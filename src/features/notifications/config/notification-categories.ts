import type { CategoryConfig, UserRole } from '../types/notifications.types';

export const NOTIFICATION_CATEGORIES: CategoryConfig[] = [
  {
    id: 'sticker_awarded',
    labelKey: 'notifications.categories.stickerAwarded',
    roles: ['student', 'parent'],
    preferenceColumn: 'sticker_awarded',
    deepLink: { screen: '/(student)/(tabs)/stickers' },
  },
  {
    id: 'trophy_earned',
    labelKey: 'notifications.categories.trophyEarned',
    roles: ['student', 'parent'],
    preferenceColumn: 'trophy_earned',
    deepLink: { screen: '/(student)/trophy-room' },
  },
  {
    id: 'achievement_unlocked',
    labelKey: 'notifications.categories.achievementUnlocked',
    roles: ['student', 'parent'],
    preferenceColumn: 'achievement_unlocked',
    deepLink: { screen: '/(student)/(tabs)/stickers' },
  },
  {
    id: 'attendance_marked',
    labelKey: 'notifications.categories.attendanceMarked',
    roles: ['parent'],
    preferenceColumn: 'attendance_marked',
    deepLink: { screen: '/(parent)/(tabs)/children' },
  },
  {
    id: 'session_completed',
    labelKey: 'notifications.categories.sessionCompleted',
    roles: ['student', 'parent'],
    preferenceColumn: 'session_completed',
    deepLink: { screen: '/(student)/sessions/index' },
  },
  {
    id: 'daily_summary',
    labelKey: 'notifications.categories.dailySummary',
    roles: ['teacher'],
    preferenceColumn: 'daily_summary',
    deepLink: { screen: '/(teacher)/(tabs)/index' },
  },
  {
    id: 'student_alert',
    labelKey: 'notifications.categories.studentAlert',
    roles: ['teacher'],
    preferenceColumn: 'student_alert',
    deepLink: { screen: '/(teacher)/(tabs)/students' },
  },
];

/**
 * Returns notification categories applicable to a given user role.
 */
export function getCategoriesForRole(role: UserRole): CategoryConfig[] {
  return NOTIFICATION_CATEGORIES.filter((cat) => cat.roles.includes(role));
}

/**
 * Maps a source database table name to its notification category.
 */
export const TABLE_TO_CATEGORY: Record<string, CategoryConfig['id']> = {
  student_stickers: 'sticker_awarded',
  student_trophies: 'trophy_earned',
  student_achievements: 'achievement_unlocked',
  attendance: 'attendance_marked',
  sessions: 'session_completed',
};
