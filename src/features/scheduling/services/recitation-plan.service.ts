import { supabase } from '@/lib/supabase';
import type { CreateRecitationPlanInput, UpdateRecitationPlanInput } from '../types/recitation-plan.types';

const PLAN_SELECT = `
  *,
  setter:profiles!session_recitation_plans_set_by_fkey(full_name),
  student:students!session_recitation_plans_student_id_fkey(
    profiles!students_id_fkey(full_name)
  )
`;

class RecitationPlanService {
  /**
   * Get all recitation plans for a scheduled session.
   */
  async getPlansForSession(sessionId: string) {
    return supabase
      .from('session_recitation_plans')
      .select(PLAN_SELECT)
      .eq('scheduled_session_id', sessionId)
      .order('created_at', { ascending: true });
  }

  /**
   * Get the session-level default plan (student_id IS NULL).
   */
  async getSessionDefault(sessionId: string) {
    return supabase
      .from('session_recitation_plans')
      .select(PLAN_SELECT)
      .eq('scheduled_session_id', sessionId)
      .is('student_id', null)
      .maybeSingle();
  }

  /**
   * Get a specific student's plan for a session.
   */
  async getStudentPlan(sessionId: string, studentId: string) {
    return supabase
      .from('session_recitation_plans')
      .select(PLAN_SELECT)
      .eq('scheduled_session_id', sessionId)
      .eq('student_id', studentId)
      .maybeSingle();
  }

  /**
   * Upsert a recitation plan (uses unique constraint on scheduled_session_id + student_id).
   */
  async upsertPlan(input: CreateRecitationPlanInput) {
    return supabase
      .from('session_recitation_plans')
      .upsert(
        {
          school_id: input.school_id,
          scheduled_session_id: input.scheduled_session_id,
          student_id: input.student_id ?? null,
          set_by: input.set_by,
          selection_mode: input.selection_mode,
          start_surah: input.start_surah,
          start_ayah: input.start_ayah,
          end_surah: input.end_surah,
          end_ayah: input.end_ayah,
          rub_number: input.rub_number ?? null,
          juz_number: input.juz_number ?? null,
          hizb_number: input.hizb_number ?? null,
          recitation_type: input.recitation_type,
          source: input.source ?? 'manual',
          assignment_id: input.assignment_id ?? null,
          notes: input.notes ?? null,
        },
        { onConflict: 'scheduled_session_id,student_id' },
      )
      .select(PLAN_SELECT)
      .single();
  }

  /**
   * Update an existing plan by ID.
   */
  async updatePlan(planId: string, updates: UpdateRecitationPlanInput) {
    return supabase
      .from('session_recitation_plans')
      .update(updates)
      .eq('id', planId)
      .select(PLAN_SELECT)
      .single();
  }

  /**
   * Delete a single plan.
   */
  async deletePlan(planId: string) {
    return supabase
      .from('session_recitation_plans')
      .delete()
      .eq('id', planId);
  }

  /**
   * Delete all individual student plans for a session (used before setting a unified plan).
   */
  async deleteStudentPlans(sessionId: string) {
    return supabase
      .from('session_recitation_plans')
      .delete()
      .eq('scheduled_session_id', sessionId)
      .not('student_id', 'is', null);
  }

  /**
   * Get pending assignments for a student that could be suggested as plans.
   */
  async getPendingAssignments(studentId: string, sessionDate: string) {
    return supabase
      .from('memorization_assignments')
      .select('*')
      .eq('student_id', studentId)
      .eq('status', 'pending')
      .lte('due_date', sessionDate)
      .order('due_date', { ascending: true });
  }
}

export const recitationPlanService = new RecitationPlanService();
