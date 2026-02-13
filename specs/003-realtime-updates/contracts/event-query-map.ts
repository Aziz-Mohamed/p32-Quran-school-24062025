/**
 * Contracts: Event-to-Query-Key Mapping
 *
 * Static configuration that maps Supabase Realtime table events
 * to TanStack Query keys that should be invalidated.
 *
 * This is the central "wiring" between realtime events and UI updates.
 */

/**
 * Maps a table + event type to the query keys that should be invalidated.
 *
 * The `extractId` function pulls relevant IDs from the event payload
 * to scope the invalidation (e.g., only invalidate a specific student's
 * dashboard, not all dashboards).
 */
interface EventQueryMapping {
  table: string;
  event: 'INSERT' | 'UPDATE' | '*';
  /**
   * Returns query keys to invalidate based on the event payload.
   * Payload may be empty ({}) if RLS blocks the row — in that case,
   * return broad invalidation keys (without specific IDs).
   */
  getQueryKeys: (payload: Record<string, unknown>) => readonly (readonly string[])[];
}

/**
 * Complete event-to-query mapping for the realtime feature.
 *
 * Example entries (conceptual, not exhaustive):
 *
 * student_stickers INSERT → [
 *   ['student-stickers', payload.student_id],
 *   ['student-dashboard', payload.student_id],
 *   ['leaderboard'],
 * ]
 *
 * attendance INSERT/UPDATE → [
 *   ['attendance'],
 *   ['class-attendance'],
 *   ['attendance-calendar', payload.student_id],
 *   ['attendance-rate', payload.student_id],
 *   ['admin-dashboard'],
 *   ['parent-dashboard'],
 *   ['student-dashboard', payload.student_id],
 * ]
 *
 * sessions INSERT → [
 *   ['sessions'],
 *   ['student-dashboard', payload.student_id],
 *   ['teacher-dashboard'],
 * ]
 *
 * students UPDATE → [
 *   ['students'],
 *   ['student-dashboard', payload.id],
 *   ['leaderboard'],
 *   ['children'],
 *   ['child-detail', payload.id],
 * ]
 *
 * homework INSERT/UPDATE → [
 *   ['homework'],
 *   ['student-dashboard', payload.student_id],
 * ]
 *
 * student_trophies INSERT → [
 *   ['student-trophies', payload.student_id],
 *   ['student-dashboard', payload.student_id],
 * ]
 *
 * student_achievements INSERT → [
 *   ['student-achievements', payload.student_id],
 *   ['student-dashboard', payload.student_id],
 * ]
 *
 * classes INSERT/UPDATE → [
 *   ['classes'],
 *   ['admin-dashboard'],
 *   ['teacher-dashboard'],
 * ]
 */
declare const EVENT_QUERY_MAP: readonly EventQueryMapping[];

export type { EventQueryMapping };
