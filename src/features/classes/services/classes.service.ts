import { supabase } from '@/lib/supabase';
import type { ClassFilters, CreateClassInput } from '../types/classes.types';

class ClassesService {
  /**
   * CM-001: Get a filtered list of classes.
   * Joins teacher profile name and student IDs for count.
   */
  async getClasses(filters?: ClassFilters) {
    let query = supabase
      .from('classes')
      .select('*, profiles!classes_teacher_id_fkey(full_name), students(id)');

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    if (filters?.teacherId) {
      query = query.eq('teacher_id', filters.teacherId);
    }
    if (filters?.searchQuery) {
      query = query.ilike('name', `%${filters.searchQuery}%`);
    }

    return query.order('name');
  }

  /**
   * CM-002: Create a new class.
   * Inserts a class record with the given school_id and returns the created row.
   */
  async createClass(input: CreateClassInput, schoolId: string) {
    return supabase
      .from('classes')
      .insert({
        ...input,
        school_id: schoolId,
      })
      .select()
      .single();
  }

  /**
   * CM-003: Update an existing class.
   * Accepts partial class fields plus is_active toggle.
   */
  async updateClass(id: string, input: Partial<CreateClassInput> & { is_active?: boolean }) {
    return supabase
      .from('classes')
      .update(input)
      .eq('id', id)
      .select()
      .single();
  }

  /**
   * CM-004: Assign a student to a class.
   * Updates the student's class_id foreign key.
   */
  async assignStudentToClass(studentId: string, classId: string) {
    return supabase
      .from('students')
      .update({ class_id: classId })
      .eq('id', studentId);
  }

  /**
   * CM-005: Remove a student from their class.
   * Sets the student's class_id to null.
   */
  async removeStudentFromClass(studentId: string) {
    return supabase
      .from('students')
      .update({ class_id: null })
      .eq('id', studentId);
  }

  /**
   * Get a single class by ID with full details.
   * Includes teacher profile and enrolled student profiles.
   */
  async getClassById(id: string) {
    return supabase
      .from('classes')
      .select(
        '*, profiles!classes_teacher_id_fkey(full_name, username), students(id, profiles!inner(full_name))',
      )
      .eq('id', id)
      .single();
  }
}

export const classesService = new ClassesService();
