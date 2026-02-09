import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../services/attendance.service';
import type { BulkAttendanceInput } from '../types/attendance.types';

/**
 * Mutation hook for marking bulk attendance.
 * Invalidates attendance, admin-dashboard, and parent-dashboard queries.
 */
export function useMarkBulkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      input,
      schoolId,
      markedBy,
    }: {
      input: BulkAttendanceInput;
      schoolId: string;
      markedBy: string;
    }) => attendanceService.markBulkAttendance(input, schoolId, markedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['class-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['parent-dashboard'] });
    },
  });
}

/**
 * Hook for fetching class attendance on a specific date.
 */
export function useClassAttendance(classId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: ['class-attendance', classId, date],
    queryFn: async () => {
      const { data, error } = await attendanceService.getClassAttendance(classId!, date!);
      if (error) throw error;
      return data;
    },
    enabled: !!classId && !!date,
  });
}

/**
 * Hook for fetching a student's attendance calendar for a given month.
 */
export function useAttendanceCalendar(
  studentId: string | undefined,
  month: number,
  year: number,
) {
  return useQuery({
    queryKey: ['attendance-calendar', studentId, month, year],
    queryFn: async () => {
      const { data, error } = await attendanceService.getAttendanceCalendar(
        studentId!,
        month,
        year,
      );
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });
}

/**
 * Hook for fetching a student's overall attendance rate.
 */
export function useAttendanceRate(studentId: string | undefined) {
  return useQuery({
    queryKey: ['attendance-rate', studentId],
    queryFn: async () => {
      const result = await attendanceService.getAttendanceRate(studentId!);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!studentId,
  });
}
