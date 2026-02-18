import { supabase } from '@/lib/supabase';
import type { LessonFilters } from '../types/lessons.types';

class LessonsService {
  /**
   * Query lessons with optional filters for class, type, and text search.
   * Results are ordered by order_index.
   */
  async getLessons(filters?: LessonFilters) {
    let query = supabase.from('lessons').select('*').order('order_index');

    if (filters?.classId) {
      query = query.eq('class_id', filters.classId);
    }

    if (filters?.lessonType) {
      query = query.eq('lesson_type', filters.lessonType);
    }

    if (filters?.searchQuery) {
      query = query.ilike('title', `%${filters.searchQuery}%`);
    }

    return query;
  }

  /**
   * Get a student's progress across all lessons they have interacted with.
   * Includes the full lesson record via join.
   */
  async getLessonProgress(studentId: string) {
    return supabase
      .from('lesson_progress')
      .select('*, lessons(*)')
      .eq('student_id', studentId);
  }

  /**
   * Create or update a student's progress on a specific lesson.
   * Uses upsert on the unique (student_id, lesson_id) constraint.
   */
  async updateLessonProgress(
    studentId: string,
    lessonId: string,
    input: { status: string; completion_percentage: number },
  ) {
    return supabase
      .from('lesson_progress')
      .upsert(
        {
          student_id: studentId,
          lesson_id: lessonId,
          status: input.status,
          completion_percentage: input.completion_percentage,
          completed_at:
            input.status === 'completed' ? new Date().toISOString() : null,
        },
        { onConflict: 'student_id,lesson_id' },
      )
      .select()
      .single();
  }
}

export const lessonsService = new LessonsService();
