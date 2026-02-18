import { supabase } from '@/lib/supabase';

class ParentDashboardService {
  /**
   * DS-003: Get parent dashboard data.
   * Returns children with profile, class, level, recent session, today's attendance.
   */
  async getDashboard(parentId: string) {
    const today = new Date().toISOString().split('T')[0];

    const { data: children, error: childrenError } = await supabase
      .from('students')
      .select('*, profiles!students_id_fkey!inner(full_name, username, avatar_url), classes(name), levels!students_current_level_fkey(level_number, title)')
      .eq('parent_id', parentId)
      .eq('is_active', true);

    if (childrenError || !children) {
      return { data: null, error: childrenError };
    }

    // For each child, get the most recent session and today's attendance
    const enriched = await Promise.all(
      children.map(async (child) => {
        const [sessionResult, attendanceResult] = await Promise.all([
          supabase
            .from('sessions')
            .select('session_date, memorization_score, tajweed_score, recitation_score')
            .eq('student_id', child.id)
            .order('session_date', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('attendance')
            .select('status')
            .eq('student_id', child.id)
            .eq('date', today)
            .maybeSingle(),
        ]);

        return {
          ...child,
          recentSession: sessionResult.data ?? null,
          todayAttendance: attendanceResult.data ?? null,
        };
      }),
    );

    return { data: enriched, error: null };
  }
}

export const parentDashboardService = new ParentDashboardService();
