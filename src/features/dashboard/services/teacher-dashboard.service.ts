import { supabase } from '@/lib/supabase';

interface TeacherDashboardResult {
  todaySessionCount: number;
  todayStudentsSeen: number;
  totalStudents: number;
  recentSessions: any[];
  checkin: any | null;
}

class TeacherDashboardService {
  async getDashboard(teacherId: string): Promise<TeacherDashboardResult> {
    const today = new Date().toISOString().split('T')[0];

    // Run queries in parallel
    const [todaySessionsRes, classesRes, recentSessionsRes, checkinRes] =
      await Promise.all([
        // Today's sessions by this teacher
        supabase
          .from('sessions')
          .select('id, student_id')
          .eq('teacher_id', teacherId)
          .eq('session_date', today),

        // Classes this teacher is assigned to, with student counts
        supabase
          .from('classes')
          .select('id, students(id)')
          .eq('teacher_id', teacherId),

        // Recent sessions (last 5)
        supabase
          .from('sessions')
          .select(
            '*, student:students!sessions_student_id_fkey(profiles!students_id_fkey(full_name, avatar_url))',
          )
          .eq('teacher_id', teacherId)
          .order('session_date', { ascending: false })
          .limit(5),

        // Today's check-in
        supabase
          .from('teacher_checkins')
          .select('*')
          .eq('teacher_id', teacherId)
          .eq('date', today)
          .maybeSingle(),
      ]);

    const todaySessions = todaySessionsRes.data ?? [];
    const uniqueStudents = new Set(todaySessions.map((s) => s.student_id));

    // Count total students across teacher's classes
    const totalStudents = (classesRes.data ?? []).reduce(
      (sum, c: any) => sum + (c.students?.length ?? 0),
      0,
    );

    return {
      todaySessionCount: todaySessions.length,
      todayStudentsSeen: uniqueStudents.size,
      totalStudents,
      recentSessions: recentSessionsRes.data ?? [],
      checkin: checkinRes.data,
    };
  }
}

export const teacherDashboardService = new TeacherDashboardService();
