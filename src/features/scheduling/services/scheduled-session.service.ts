import { supabase } from '@/lib/supabase';
import type { ScheduleSessionInput, ScheduleFilters, SessionStatus } from '../types/scheduling.types';

class ScheduledSessionService {
  /**
   * Get scheduled sessions with filters.
   */
  async getScheduledSessions(filters: ScheduleFilters) {
    let query = supabase
      .from('scheduled_sessions')
      .select(`
        *,
        class:classes!scheduled_sessions_class_id_fkey(name),
        teacher:profiles!scheduled_sessions_teacher_id_fkey(full_name, avatar_url),
        student:students!scheduled_sessions_student_id_fkey(
          profiles!students_id_fkey(full_name, avatar_url)
        )
      `)
      .eq('school_id', filters.schoolId);

    if (filters.teacherId) {
      query = query.eq('teacher_id', filters.teacherId);
    }
    if (filters.studentId) {
      query = query.eq('student_id', filters.studentId);
    }
    if (filters.classId) {
      query = query.eq('class_id', filters.classId);
    }
    if (filters.startDate) {
      query = query.gte('session_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('session_date', filters.endDate);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    return query.order('session_date', { ascending: true }).order('start_time', { ascending: true });
  }

  /**
   * Get upcoming sessions for a teacher.
   */
  async getTeacherUpcoming(teacherId: string, schoolId: string) {
    const today = new Date().toISOString().split('T')[0];
    return supabase
      .from('scheduled_sessions')
      .select(`
        *,
        class:classes!scheduled_sessions_class_id_fkey(name),
        student:students!scheduled_sessions_student_id_fkey(
          profiles!students_id_fkey(full_name, avatar_url)
        )
      `)
      .eq('teacher_id', teacherId)
      .eq('school_id', schoolId)
      .gte('session_date', today)
      .in('status', ['scheduled', 'in_progress'])
      .order('session_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(20);
  }

  /**
   * Get upcoming sessions for a student (via class membership or individual).
   */
  async getStudentUpcoming(studentId: string, classIds: string[], schoolId: string) {
    const today = new Date().toISOString().split('T')[0];
    let query = supabase
      .from('scheduled_sessions')
      .select(`
        *,
        class:classes!scheduled_sessions_class_id_fkey(name),
        teacher:profiles!scheduled_sessions_teacher_id_fkey(full_name, avatar_url)
      `)
      .eq('school_id', schoolId)
      .gte('session_date', today)
      .in('status', ['scheduled', 'in_progress'])
      .order('session_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(20);

    // Student sees: class sessions for their classes + individual sessions assigned to them
    if (classIds.length > 0) {
      query = query.or(
        `student_id.eq.${studentId},and(session_type.eq.class,class_id.in.(${classIds.join(',')}))`
      );
    } else {
      query = query.eq('student_id', studentId);
    }

    return query;
  }

  /**
   * Create a scheduled session (manual/individual).
   */
  async createSession(input: ScheduleSessionInput) {
    return supabase
      .from('scheduled_sessions')
      .insert({
        class_id: input.classId ?? null,
        class_schedule_id: input.classScheduleId ?? null,
        teacher_id: input.teacherId,
        student_id: input.studentId ?? null,
        school_id: input.schoolId,
        session_date: input.sessionDate,
        start_time: input.startTime,
        end_time: input.endTime,
        session_type: input.sessionType,
        status: 'scheduled',
      })
      .select()
      .single();
  }

  /**
   * Update session status.
   */
  async updateStatus(sessionId: string, status: SessionStatus) {
    return supabase
      .from('scheduled_sessions')
      .update({ status })
      .eq('id', sessionId)
      .select()
      .single();
  }

  /**
   * Link a scheduled session to an evaluation session.
   */
  async linkEvaluation(sessionId: string, evaluationSessionId: string) {
    return supabase
      .from('scheduled_sessions')
      .update({ evaluation_session_id: evaluationSessionId })
      .eq('id', sessionId)
      .select()
      .single();
  }

  /**
   * Cancel a scheduled session.
   */
  async cancelSession(sessionId: string) {
    return this.updateStatus(sessionId, 'cancelled');
  }
}

export const scheduledSessionService = new ScheduledSessionService();
