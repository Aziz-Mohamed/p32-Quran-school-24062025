import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mutationTracker } from '@/features/realtime';
import { scheduledSessionService } from '../services/scheduled-session.service';
import type { ScheduleFilters, ScheduleSessionInput, SessionStatus } from '../types/scheduling.types';

/**
 * Get scheduled sessions with filters.
 */
export function useScheduledSessions(filters: ScheduleFilters | null) {
  return useQuery({
    queryKey: ['scheduled-sessions', filters],
    queryFn: async () => {
      const { data, error } = await scheduledSessionService.getScheduledSessions(filters!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!filters?.schoolId,
  });
}

/**
 * Get upcoming sessions for a teacher.
 */
export function useTeacherUpcomingSessions(teacherId: string | undefined, schoolId: string | undefined) {
  return useQuery({
    queryKey: ['teacher-upcoming-sessions', teacherId, schoolId],
    queryFn: async () => {
      const { data, error } = await scheduledSessionService.getTeacherUpcoming(teacherId!, schoolId!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!teacherId && !!schoolId,
  });
}

/**
 * Get upcoming sessions for a student.
 */
export function useStudentUpcomingSessions(
  studentId: string | undefined,
  classIds: string[],
  schoolId: string | undefined,
) {
  return useQuery({
    queryKey: ['student-upcoming-sessions', studentId, classIds, schoolId],
    queryFn: async () => {
      const { data, error } = await scheduledSessionService.getStudentUpcoming(
        studentId!,
        classIds,
        schoolId!,
      );
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!studentId && !!schoolId,
  });
}

/**
 * Create a scheduled session (manual/individual).
 */
export function useCreateScheduledSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ScheduleSessionInput) => {
      const { data, error } = await scheduledSessionService.createSession(input);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.id) {
        mutationTracker.record('scheduled_sessions', data.id);
      }
      queryClient.invalidateQueries({ queryKey: ['scheduled-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-upcoming-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['student-upcoming-sessions'] });
    },
  });
}

/**
 * Update session status (start, complete, cancel).
 */
export function useUpdateSessionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, status }: { sessionId: string; status: SessionStatus }) => {
      const { data, error } = await scheduledSessionService.updateStatus(sessionId, status);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.id) {
        mutationTracker.record('scheduled_sessions', data.id);
      }
      queryClient.invalidateQueries({ queryKey: ['scheduled-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-upcoming-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['student-upcoming-sessions'] });
    },
  });
}

/**
 * Link a scheduled session to an evaluation session.
 */
export function useLinkEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      evaluationSessionId,
    }: {
      sessionId: string;
      evaluationSessionId: string;
    }) => {
      const { data, error } = await scheduledSessionService.linkEvaluation(
        sessionId,
        evaluationSessionId,
      );
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.id) {
        mutationTracker.record('scheduled_sessions', data.id);
      }
      queryClient.invalidateQueries({ queryKey: ['scheduled-sessions'] });
    },
  });
}
