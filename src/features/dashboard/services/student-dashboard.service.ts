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
      attendanceResult,
      sessionsCountResult,
      stickersCountResult,
      activeCertCountResult,
    ] = await Promise.all([
      // Student record (no levels join — current_level is a plain integer now)
      supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single(),

      // Current (incomplete) homework with session recitations for surah/ayat display
      supabase
        .from('homework')
        .select('*, sessions(recitations(surah_number, from_ayah, to_ayah))')
        .eq('student_id', studentId)
        .eq('is_completed', false)
        .order('due_date', { ascending: true }),

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

      // Active certification count (= rubʿ level)
      supabase
        .from('student_rub_certifications')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .is('dormant_since', null),
    ]);

    return {
      student: studentResult.data,
      studentError: studentResult.error,
      homework: homeworkResult.data,
      homeworkError: homeworkResult.error,
      todayAttendance: attendanceResult.data,
      attendanceError: attendanceResult.error,
      totalSessions: sessionsCountResult.count ?? 0,
      sessionsError: sessionsCountResult.error,
      totalStickers: stickersCountResult.count ?? 0,
      stickersError: stickersCountResult.error,
      activeCertCount: activeCertCountResult.count ?? 0,
      activeCertError: activeCertCountResult.error,
    };
  }
}

export const studentDashboardService = new StudentDashboardService();
