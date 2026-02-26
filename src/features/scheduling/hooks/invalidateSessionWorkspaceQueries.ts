import type { QueryClient } from '@tanstack/react-query';

const SESSION_WORKSPACE_QUERY_KEYS = [
  'scheduled-sessions',
  'teacher-upcoming-sessions',
  'teacher-session-history',
  'sessions',
  'attendance',
  'class-attendance',
  'teacher-dashboard',
  'student-dashboard',
  'scheduled-session',
  'recitations',
  'memorization-progress',
  'memorization-stats',
  'revision-schedule',
  'recitation-plans',
  'assignments',
] as const;

/** Invalidates all queries affected by completing a session. */
export function invalidateSessionWorkspaceQueries(queryClient: QueryClient): void {
  for (const key of SESSION_WORKSPACE_QUERY_KEYS) {
    queryClient.invalidateQueries({ queryKey: [key] });
  }
}
