import type { Tables } from '@/types/database.types';

/** Lesson record with the student's progress information */
export interface LessonWithProgress extends Tables<'lessons'> {
  progress: Tables<'lesson_progress'> | null;
  class: Tables<'classes'> | null;
}

/** Filters for querying lessons */
export interface LessonFilters {
  classId?: string;
  lessonType?: string;
  surahName?: string;
  searchQuery?: string;
  page?: number;
  pageSize?: number;
}

/** Input for creating a new lesson */
export interface CreateLessonInput {
  title: string;
  description?: string | null;
  class_id?: string | null;
  lesson_type?: string | null;
  surah_name?: string | null;
  ayah_from?: number | null;
  ayah_to?: number | null;
  order_index?: number | null;
}
