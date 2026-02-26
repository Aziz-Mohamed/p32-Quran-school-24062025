import { supabase } from '@/lib/supabase';
import type {
  ParentDashboardData,
  ParentAggregateStats,
  ChildQuickStatus,
  RecentSessionEntry,
} from '../types/dashboard.types';

/** Shape returned by the children query with FK joins */
interface ChildRow {
  id: string;
  parent_id: string | null;
  current_level: number;
  current_streak: number;
  is_active: boolean;
  profiles: {
    full_name: string;
    name_localized: Record<string, string> | null;
    username: string | null;
    avatar_url: string | null;
  };
  classes: {
    name: string;
    name_localized: Record<string, string> | null;
  } | null;
}

/** Shape returned by the sessions query */
interface SessionRow {
  id: string;
  student_id: string;
  session_date: string;
  memorization_score: number | null;
  tajweed_score: number | null;
  recitation_quality: number | null;
  notes: string | null;
}

const DEFAULT_STATS: ParentAggregateStats = {
  totalChildren: 0,
  presentToday: 0,
  absentToday: 0,
  notMarkedToday: 0,
  averageAttendanceRate: -1,
  totalStickers: 0,
  totalStreakDays: 0,
};

class ParentDashboardService {
  /**
   * DS-003: Get parent dashboard data.
   * Returns children quick status, aggregate stats, and recent sessions.
   * Uses batched IN-clause queries instead of per-child N+1.
   */
  async getDashboard(parentId: string): Promise<{ data: ParentDashboardData | null; error: Error | null }> {
    const today = new Date().toISOString().split('T')[0];

    // Step 1: Fetch children with profile, class, level
    const { data: children, error: childrenError } = await supabase
      .from('students')
      .select(
        '*, profiles!students_id_fkey!inner(full_name, name_localized, username, avatar_url), classes(name, name_localized)',
      )
      .eq('parent_id', parentId)
      .eq('is_active', true);

    if (childrenError || !children) {
      return { data: null, error: childrenError };
    }

    if (children.length === 0) {
      return {
        data: { children: [], aggregateStats: DEFAULT_STATS, recentSessions: [] },
        error: null,
      };
    }

    const childIds = children.map((c) => c.id);

    // Step 2: Batched parallel enrichment queries
    const [todayAttendanceRes, allAttendanceRes, recentSessionsRes, stickerCountRes] =
      await Promise.all([
        supabase
          .from('attendance')
          .select('student_id, status')
          .in('student_id', childIds)
          .eq('date', today),
        supabase
          .from('attendance')
          .select('student_id, status')
          .in('student_id', childIds),
        supabase
          .from('sessions')
          .select('id, student_id, session_date, memorization_score, tajweed_score, recitation_quality, notes')
          .in('student_id', childIds)
          .order('session_date', { ascending: false })
          .limit(5),
        supabase
          .from('student_stickers')
          .select('id', { count: 'exact', head: true })
          .in('student_id', childIds),
      ]);

    // Step 3: Build lookup maps

    // Today's attendance by student_id
    const todayMap = new Map<string, string>();
    for (const row of todayAttendanceRes.data ?? []) {
      todayMap.set(row.student_id, row.status);
    }

    // Per-child attendance rates from all records
    const attendanceCounts = new Map<string, { present: number; total: number }>();
    for (const row of allAttendanceRes.data ?? []) {
      const entry = attendanceCounts.get(row.student_id) ?? { present: 0, total: 0 };
      entry.total++;
      if (row.status === 'present' || row.status === 'late') {
        entry.present++;
      }
      attendanceCounts.set(row.student_id, entry);
    }

    // Cast to our explicit interface (Supabase FK join inference)
    const typedChildren = children as unknown as ChildRow[];

    // Child name lookup for sessions
    const childNameMap = new Map<string, string>();
    for (const child of typedChildren) {
      childNameMap.set(child.id, child.profiles?.full_name ?? '');
    }

    // Step 4: Build children quick status
    const childrenStatus: ChildQuickStatus[] = typedChildren.map((child) => {
      const counts = attendanceCounts.get(child.id);
      const rate = counts && counts.total > 0 ? Math.round((counts.present / counts.total) * 100) : -1;

      return {
        id: child.id,
        name: child.profiles?.full_name ?? '',
        avatarUrl: child.profiles?.avatar_url ?? null,
        className: child.classes?.name ?? null,
        currentLevel: child.current_level ?? 0,
        todayStatus: (todayMap.get(child.id) as ChildQuickStatus['todayStatus']) ?? null,
        attendanceRate: rate,
        currentStreak: child.current_streak ?? 0,
      };
    });

    // Step 5: Build aggregate stats
    let presentToday = 0;
    let absentToday = 0;
    for (const child of childrenStatus) {
      if (child.todayStatus === 'present' || child.todayStatus === 'late') presentToday++;
      else if (child.todayStatus === 'absent') absentToday++;
    }

    const validRates = childrenStatus.filter((c) => c.attendanceRate >= 0).map((c) => c.attendanceRate);
    const avgRate =
      validRates.length > 0 ? Math.round(validRates.reduce((a, b) => a + b, 0) / validRates.length) : -1;

    const aggregateStats: ParentAggregateStats = {
      totalChildren: childrenStatus.length,
      presentToday,
      absentToday,
      notMarkedToday: childrenStatus.length - presentToday - absentToday,
      averageAttendanceRate: avgRate,
      totalStickers: stickerCountRes.count ?? 0,
      totalStreakDays: childrenStatus.reduce((sum, c) => sum + c.currentStreak, 0),
    };

    // Step 6: Build recent sessions
    const recentSessions: RecentSessionEntry[] = ((recentSessionsRes.data ?? []) as SessionRow[]).map((s) => ({
      id: s.id,
      studentId: s.student_id,
      childName: childNameMap.get(s.student_id) ?? '',
      sessionDate: s.session_date,
      memorizationScore: s.memorization_score,
      tajweedScore: s.tajweed_score,
      recitationQuality: s.recitation_quality,
      notes: s.notes,
    }));

    return {
      data: { children: childrenStatus, aggregateStats, recentSessions },
      error: null,
    };
  }
}

export const parentDashboardService = new ParentDashboardService();
