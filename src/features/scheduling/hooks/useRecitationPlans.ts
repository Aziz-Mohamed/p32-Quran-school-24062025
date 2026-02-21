import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mutationTracker } from '@/features/realtime';
import { recitationPlanService } from '../services/recitation-plan.service';
import type { CreateRecitationPlanInput, UpdateRecitationPlanInput } from '../types/recitation-plan.types';

/**
 * Get all recitation plans for a scheduled session.
 */
export function useSessionRecitationPlans(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['recitation-plans', sessionId],
    queryFn: async () => {
      const { data, error } = await recitationPlanService.getPlansForSession(sessionId!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!sessionId,
  });
}

/**
 * Get a specific student's plan for a session.
 */
export function useStudentRecitationPlan(
  sessionId: string | undefined,
  studentId: string | undefined,
) {
  return useQuery({
    queryKey: ['recitation-plan', sessionId, studentId],
    queryFn: async () => {
      const { data, error } = await recitationPlanService.getStudentPlan(sessionId!, studentId!);
      if (error) throw error;
      return data ?? null;
    },
    enabled: !!sessionId && !!studentId,
  });
}

/**
 * Get the session-level default plan.
 */
export function useSessionDefaultPlan(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['recitation-plan-default', sessionId],
    queryFn: async () => {
      const { data, error } = await recitationPlanService.getSessionDefault(sessionId!);
      if (error) throw error;
      return data ?? null;
    },
    enabled: !!sessionId,
  });
}

/**
 * Upsert a recitation plan.
 */
export function useUpsertRecitationPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRecitationPlanInput) => {
      const { data, error } = await recitationPlanService.upsertPlan(input);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.id) {
        mutationTracker.record('session_recitation_plans', data.id);
      }
      queryClient.invalidateQueries({ queryKey: ['recitation-plans'] });
      queryClient.invalidateQueries({ queryKey: ['recitation-plan'] });
      queryClient.invalidateQueries({ queryKey: ['recitation-plan-default'] });
    },
  });
}

/**
 * Update an existing recitation plan.
 */
export function useUpdateRecitationPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, updates }: { planId: string; updates: UpdateRecitationPlanInput }) => {
      const { data, error } = await recitationPlanService.updatePlan(planId, updates);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.id) {
        mutationTracker.record('session_recitation_plans', data.id);
      }
      queryClient.invalidateQueries({ queryKey: ['recitation-plans'] });
      queryClient.invalidateQueries({ queryKey: ['recitation-plan'] });
      queryClient.invalidateQueries({ queryKey: ['recitation-plan-default'] });
    },
  });
}

/**
 * Delete a single recitation plan.
 */
export function useDeleteRecitationPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await recitationPlanService.deletePlan(planId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recitation-plans'] });
      queryClient.invalidateQueries({ queryKey: ['recitation-plan'] });
      queryClient.invalidateQueries({ queryKey: ['recitation-plan-default'] });
    },
  });
}

/**
 * Set a unified plan for all students in a session.
 * Deletes all individual student plans, then upserts a session default.
 */
export function useSetUnifiedPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRecitationPlanInput) => {
      // 1. Delete all individual student plans
      const { error: deleteError } = await recitationPlanService.deleteStudentPlans(
        input.scheduled_session_id,
      );
      if (deleteError) throw deleteError;

      // 2. Upsert the session default (student_id = null)
      const { data, error } = await recitationPlanService.upsertPlan({
        ...input,
        student_id: null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.id) {
        mutationTracker.record('session_recitation_plans', data.id);
      }
      queryClient.invalidateQueries({ queryKey: ['recitation-plans'] });
      queryClient.invalidateQueries({ queryKey: ['recitation-plan'] });
      queryClient.invalidateQueries({ queryKey: ['recitation-plan-default'] });
    },
  });
}

/**
 * Get pending assignments that can be suggested as plans.
 */
export function usePendingAssignments(studentId: string | undefined, sessionDate: string | undefined) {
  return useQuery({
    queryKey: ['pending-assignments-for-plan', studentId, sessionDate],
    queryFn: async () => {
      const { data, error } = await recitationPlanService.getPendingAssignments(
        studentId!,
        sessionDate!,
      );
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!studentId && !!sessionDate,
  });
}
