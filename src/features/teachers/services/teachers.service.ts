import { supabase } from '@/lib/supabase';
import type { TeacherFilters } from '../types/teachers.types';

class TeachersService {
  /**
   * Get a filtered list of teachers.
   * Queries profiles where role='teacher' and joins their classes.
   */
  async getTeachers(filters?: TeacherFilters) {
    let query = supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, classes(id, name)')
      .eq('role', 'teacher');

    if (filters?.searchQuery) {
      query = query.ilike('full_name', `%${filters.searchQuery}%`);
    }

    return query.order('full_name');
  }

  /**
   * Get a single teacher by profile ID.
   * Includes classes and nested student counts.
   */
  async getTeacherById(id: string) {
    return supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, phone, classes(id, name, students(id))')
      .eq('id', id)
      .eq('role', 'teacher')
      .single();
  }

  /**
   * Update a teacher's profile.
   * Maps camelCase input to snake_case columns.
   */
  async updateTeacher(id: string, input: { fullName?: string; phone?: string }) {
    const updates: Record<string, unknown> = {};
    if (input.fullName !== undefined) updates.full_name = input.fullName;
    if (input.phone !== undefined) updates.phone = input.phone;

    return supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  }
}

export const teachersService = new TeachersService();
