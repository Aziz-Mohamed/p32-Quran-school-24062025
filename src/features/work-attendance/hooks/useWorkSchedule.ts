import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workAttendanceService } from '../services/work-attendance.service';
import type { WorkScheduleInput } from '../types/work-attendance.types';

/**
 * Get work schedules for a teacher.
 */
export function useWorkSchedules(teacherId: string | undefined) {
  return useQuery({
    queryKey: ['teacher-work-schedule', teacherId],
    queryFn: async () => {
      const { data, error } = await workAttendanceService.getWorkSchedules(teacherId!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!teacherId,
  });
}

/**
 * Upsert a work schedule entry.
 */
export function useUpsertWorkSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: WorkScheduleInput) => {
      const { data, error } = await workAttendanceService.upsertWorkSchedule(input);
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['teacher-work-schedule', variables.teacherId],
      });
    },
  });
}

/**
 * Delete a work schedule entry.
 */
export function useDeleteWorkSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await workAttendanceService.deleteWorkSchedule(id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-work-schedule'] });
    },
  });
}
