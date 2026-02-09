import { supabase } from '@/lib/supabase';

class StudentDashboardService {
  /**
   * Fetches all data needed for the student dashboard in parallel.
   * The studentId is the user's profile/auth ID (students.id = profiles.id).
   */
  async getDashboard(studentId: string) {
    const today = new Date().toISOString().split('T')[0];

    const [
      studentResult,
      homeworkResult,
      achievementsResult,
      attendanceResult,
      sessionsCountResult,
      stickersCountResult,
    ] = await Promise.all([
      // Student record with their current level details
      supabase
        .from('students')
        .select('*, levels!students_current_level_fkey(*)')
        .eq('id', studentId)
        .single(),

      // Current (incomplete) homework, ordered by due date
      supabase
        .from('homework')
        .select('*')
        .eq('student_id', studentId)
        .eq('is_completed', false)
        .order('due_date', { ascending: true }),

      // Recent achievements (last 5)
      supabase
        .from('student_achievements')
        .select('*, achievements(*)')
        .eq('student_id', studentId)
        .order('earned_at', { ascending: false })
        .limit(5),

      // Today's attendance record (if any)
      supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .eq('date', today)
        .maybeSingle(),

      // Total session count
      supabase
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentId),

      // Total sticker count
      supabase
        .from('student_stickers')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentId),
    ]);

    return {
      student: studentResult.data,
      studentError: studentResult.error,
      homework: homeworkResult.data,
      homeworkError: homeworkResult.error,
      recentAchievements: achievementsResult.data,
      achievementsError: achievementsResult.error,
      todayAttendance: attendanceResult.data,
      attendanceError: attendanceResult.error,
      totalSessions: sessionsCountResult.count ?? 0,
      sessionsError: sessionsCountResult.error,
      totalStickers: stickersCountResult.count ?? 0,
      stickersError: stickersCountResult.error,
    };
  }
}

export const studentDashboardService = new StudentDashboardService();
