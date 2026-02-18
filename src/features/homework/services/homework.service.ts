import { supabase } from '@/lib/supabase';
import type { HomeworkFilters } from '../types/homework.types';

class HomeworkService {
  /**
   * HW-001: Get homework assignments for a specific student.
   * Includes the related session and teacher name.
   * Orders by due_date ascending (pending first), then created_at descending.
   */
  async getStudentHomework(studentId: string, filters?: HomeworkFilters) {
    let query = supabase
      .from('homework')
      .select(
        '*, sessions(session_date, profiles!sessions_teacher_id_fkey(full_name))',
      )
      .eq('student_id', studentId);

    if (filters?.isCompleted !== undefined) {
      query = query.eq('is_completed', filters.isCompleted);
    }
    if (filters?.dueBefore) {
      query = query.lte('due_date', filters.dueBefore);
    }
    if (filters?.dueAfter) {
      query = query.gte('due_date', filters.dueAfter);
    }
    if (filters?.sessionId) {
      query = query.eq('session_id', filters.sessionId);
    }

    query = query
      .order('due_date', { ascending: true })
      .order('created_at', { ascending: false });

    if (filters?.pageSize) {
      const page = filters.page ?? 1;
      const offset = (page - 1) * filters.pageSize;
      query = query.range(offset, offset + filters.pageSize - 1);
    }

    return query;
  }

  /**
   * HW-002: Mark a homework assignment as completed.
   * The DB trigger handle_homework_points will auto-add points.
   */
  async completeHomework(homeworkId: string) {
    return supabase
      .from('homework')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', homeworkId)
      .select()
      .single();
  }
}

export const homeworkService = new HomeworkService();
