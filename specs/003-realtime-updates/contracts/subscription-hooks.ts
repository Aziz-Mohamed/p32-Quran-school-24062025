/**
 * Contracts: Realtime Subscription Hooks
 *
 * These interfaces define the public API of the realtime feature module.
 * Implementation files will conform to these contracts.
 */

// ─── Types ──────────────────────────────────────────────────────────

type PostgresChangesEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface SubscriptionConfig {
  /** Database table name */
  table: string;
  /** Which event types to listen for */
  event: PostgresChangesEvent;
  /** Supabase filter string, e.g., 'student_id=eq.abc-123' */
  filter?: string;
  /** TanStack Query keys to invalidate when event fires */
  queryKeys: readonly (readonly string[])[];
}

interface RoleSubscriptionProfile {
  /** Unique channel name for this user session */
  channelName: string;
  /** Array of table subscriptions for this role */
  subscriptions: SubscriptionConfig[];
  /** Debounce window in milliseconds for event coalescing */
  debounceMs: number;
}

interface RealtimeStatus {
  /** Whether the channel is currently connected and receiving events */
  isConnected: boolean;
  /** Last error message, if any */
  lastError: string | null;
  /** Timestamp of last received event */
  lastEventAt: number | null;
}

// ─── Hook Contracts ─────────────────────────────────────────────────

/**
 * Core subscription hook. Sets up a single Supabase Realtime channel
 * with multiple table listeners. Handles debounce, dedup, and cleanup.
 *
 * @param profile - Role-specific subscription configuration
 * @returns RealtimeStatus for optional UI feedback
 *
 * Usage:
 *   useRealtimeSubscription(studentProfile)
 */
declare function useRealtimeSubscription(
  profile: RoleSubscriptionProfile
): RealtimeStatus;

/**
 * Manages realtime subscriptions for the current authenticated user.
 * Reads role, school_id, and relevant IDs from auth store,
 * builds the appropriate RoleSubscriptionProfile, and delegates
 * to useRealtimeSubscription.
 *
 * Should be called once in the authenticated layout (after login).
 * Automatically cleans up on logout.
 *
 * Usage:
 *   // In app/_layout.tsx or authenticated root
 *   useRealtimeManager()
 */
declare function useRealtimeManager(): RealtimeStatus;

/**
 * Handles app lifecycle (foreground/background) for realtime reconnection.
 * On foreground: re-subscribes channels + triggers stale query refetch.
 * On background: no-op (OS handles WebSocket lifecycle).
 *
 * Should be called once at the app root level.
 *
 * Usage:
 *   // In app/_layout.tsx
 *   useRealtimeReconnect()
 */
declare function useRealtimeReconnect(): void;

// ─── Role Profile Builders ──────────────────────────────────────────

/**
 * Builds subscription profile for a student user.
 *
 * Subscribes to: student_stickers, attendance, sessions, students,
 *   homework, student_trophies, student_achievements
 * Filter: student_id=eq.{studentId}
 * Debounce: 300ms
 */
declare function buildStudentProfile(
  studentId: string,
  classId: string | null
): RoleSubscriptionProfile;

/**
 * Builds subscription profile for a teacher user.
 *
 * Subscribes to: students, sessions, student_stickers, attendance, classes
 * Filter: class_id=in.({classIds}) for students, school_id for others
 * Debounce: 500ms
 */
declare function buildTeacherProfile(
  teacherId: string,
  schoolId: string,
  classIds: string[]
): RoleSubscriptionProfile;

/**
 * Builds subscription profile for a parent user.
 *
 * Subscribes to: attendance, sessions, student_stickers, students, homework
 * Filter: student_id=in.({childIds})
 * Debounce: 500ms
 */
declare function buildParentProfile(
  parentId: string,
  childIds: string[]
): RoleSubscriptionProfile;

/**
 * Builds subscription profile for an admin user.
 *
 * Subscribes to: students, sessions, attendance, student_stickers, classes
 * Filter: school_id=eq.{schoolId}
 * Debounce: 500ms
 */
declare function buildAdminProfile(
  schoolId: string
): RoleSubscriptionProfile;

// ─── Mutation Tracker ───────────────────────────────────────────────

/**
 * Tracks recent local mutations for deduplication.
 *
 * Usage:
 *   mutationTracker.record('student_stickers', 'abc-123')
 *   mutationTracker.isDuplicate('student_stickers', 'abc-123') // true within 2s
 */
interface MutationTrackerContract {
  /** Record a local mutation. Called in mutation onSuccess handlers. */
  record(table: string, recordId: string): void;
  /** Check if a realtime event should be skipped (matches recent local mutation). */
  isDuplicate(table: string, recordId: string): boolean;
  /** Remove stale entries (called internally on each check). */
  prune(): void;
}

declare const mutationTracker: MutationTrackerContract;

export type {
  PostgresChangesEvent,
  SubscriptionConfig,
  RoleSubscriptionProfile,
  RealtimeStatus,
  MutationTrackerContract,
};
