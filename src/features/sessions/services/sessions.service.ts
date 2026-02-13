import { supabase } from '@/lib/supabase';
import type { CreateSessionInput, SessionFilters } from '../types/sessions.types';

class SessionsService {
  /**
   * SS-001: Create a new session record.
   * Looks up the teacher's school_id from their profile, inserts the session,
   * and optionally creates a homework record if homework details are provided.
   * The DB trigger handle_session_points will auto-add points.
   */
  async createSession(input: CreateSessionInput) {
    // Fetch the teacher's school_id from their profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', input.teacher_id)
      .single();

    if (profileError || !profile) {
      return { data: null, error: profileError ?? new Error('Teacher profile not found') };
    }

    const schoolId = profile.school_id;

    // Insert the session record
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        student_id: input.student_id,
        teacher_id: input.teacher_id,
        class_id: input.class_id ?? null,
        lesson_id: input.lesson_id ?? null,
        session_date: input.session_date ?? new Date().toISOString().split('T')[0],
        memorization_score: input.memorization_score ?? null,
        tajweed_score: input.tajweed_score ?? null,
        recitation_quality: input.recitation_quality ?? null,
        notes: input.notes ?? null,
        school_id: schoolId,
      })
      .select()
      .single();

    if (sessionError || !session) {
      return { data: null, error: sessionError };
    }

    // If homework details are provided, create a homework record
    if (input.homework_assigned && input.homework_due_date) {
      await supabase.from('homework').insert({
        student_id: input.student_id,
        session_id: session.id,
        school_id: schoolId,
        description: input.homework_assigned,
        due_date: input.homework_due_date,
      });
    }

    return { data: session, error: null };
  }

  /**
   * SS-002: Retrieve a paginated, filtered list of sessions.
   * Joins teacher profile, student profile, and lesson details.
   */
  async getSessions(filters: SessionFilters) {
    let query = supabase
      .from('sessions')
      .select(
        '*, teacher:profiles!sessions_teacher_id_fkey(full_name, avatar_url), student:students!sessions_student_id_fkey(profiles!students_id_fkey(full_name, avatar_url)), lessons(title)',
      );

    if (filters.studentId) {
      query = query.eq('student_id', filters.studentId);
    }
    if (filters.teacherId) {
      query = query.eq('teacher_id', filters.teacherId);
    }
    if (filters.classId) {
      query = query.eq('class_id', filters.classId);
    }
    if (filters.lessonId) {
      query = query.eq('lesson_id', filters.lessonId);
    }
    if (filters.dateFrom) {
      query = query.gte('session_date', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('session_date', filters.dateTo);
    }

    query = query.order('session_date', { ascending: false });

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const offset = (page - 1) * pageSize;
    query = query.range(offset, offset + pageSize - 1);

    return query;
  }

  /**
   * SS-003: Retrieve a single session by its ID with full details
   * including teacher, student, lesson, and associated homework.
   */
  async getSessionById(id: string) {
    return supabase
      .from('sessions')
      .select(
        '*, teacher:profiles!sessions_teacher_id_fkey(full_name, avatar_url), student:students!sessions_student_id_fkey(profiles!students_id_fkey(full_name, avatar_url)), lessons(title), homework(*)',
      )
      .eq('id', id)
      .single();
  }
}

export const sessionsService = new SessionsService();
