import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classScheduleService } from '../services/class-schedule.service';
import type { ClassScheduleInput } from '../types/scheduling.types';

/**
 * Get all schedules for a class.
 */
export function useClassSchedules(classId: string | undefined) {
  return useQuery({
    queryKey: ['class-schedules', classId],
    queryFn: async () => {
      const { data, error } = await classScheduleService.getClassSchedules(classId!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!classId,
  });
}

/**
 * Get all schedules for a school (admin view).
 */
export function useSchoolSchedules(schoolId: string | undefined) {
  return useQuery({
    queryKey: ['school-schedules', schoolId],
    queryFn: async () => {
      const { data, error } = await classScheduleService.getSchoolSchedules(schoolId!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!schoolId,
  });
}

/**
 * Upsert a class schedule entry.
 */
export function useUpsertClassSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ClassScheduleInput) => {
      const { data, error } = await classScheduleService.upsertClassSchedule(input);
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['class-schedules', variables.classId] });
      queryClient.invalidateQueries({ queryKey: ['school-schedules'] });
    },
  });
}

/**
 * Delete (deactivate) a class schedule entry.
 */
export function useDeleteClassSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await classScheduleService.deleteClassSchedule(id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['school-schedules'] });
    },
  });
}
