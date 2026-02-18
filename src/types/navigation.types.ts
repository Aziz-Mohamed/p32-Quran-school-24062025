// ─── Route Parameter Types ──────────────────────────────────────────────────
//
// Type-safe route params for dynamic routes used with expo-router.
// These correspond to route segments like /student/[id], /class/[id], etc.
// ─────────────────────────────────────────────────────────────────────────────

export interface StudentParams {
  id: string;
}

export interface TeacherParams {
  id: string;
}

export interface ClassParams {
  id: string;
}

export interface LessonParams {
  id: string;
}

export interface SessionParams {
  id: string;
}

export interface ChildParams {
  id: string;
}

export interface AttendanceParams {
  childId: string;
}

// ─── Aggregate Route Params Map ─────────────────────────────────────────────
//
// Maps route patterns to their expected params.
// Useful for building generic navigation utilities.
// ─────────────────────────────────────────────────────────────────────────────

export interface RouteParamsMap {
  '/student/[id]': StudentParams;
  '/teacher/[id]': TeacherParams;
  '/class/[id]': ClassParams;
  '/lesson/[id]': LessonParams;
  '/session/[id]': SessionParams;
  '/child/[id]': ChildParams;
  '/attendance/[childId]': AttendanceParams;
}

export type AppRoute = keyof RouteParamsMap;
