import type { Tables } from '@/types/database.types';

/** Homework record with the associated session details */
export interface HomeworkWithSession extends Tables<'homework'> {
  session: Tables<'sessions'> | null;
  student: Tables<'profiles'>;
}

/** Filters for querying homework records */
export interface HomeworkFilters {
  studentId?: string;
  sessionId?: string;
  isCompleted?: boolean;
  dueBefore?: string;
  dueAfter?: string;
  searchQuery?: string;
  page?: number;
  pageSize?: number;
}

/** Input for creating a homework assignment */
export interface CreateHomeworkInput {
  student_id: string;
  session_id?: string | null;
  description: string;
  due_date?: string | null;
}
