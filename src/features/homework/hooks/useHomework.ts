import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { homeworkService } from '../services/homework.service';
import { mutationTracker } from '@/features/realtime';
import type { HomeworkFilters } from '../types/homework.types';

export const useStudentHomework = (
  studentId: string | undefined,
  filters?: HomeworkFilters,
) => {
  return useQuery({
    queryKey: ['homework', studentId, filters],
    queryFn: async () => {
      if (!studentId) throw new Error('Student ID is required');
      const { data, error } = await homeworkService.getStudentHomework(
        studentId,
        filters,
      );
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!studentId,
  });
};

export const useCompleteHomework = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['complete-homework'],
    mutationFn: (homeworkId: string) => homeworkService.completeHomework(homeworkId),
    onSuccess: (_data, homeworkId) => {
      mutationTracker.record('homework', homeworkId);
      queryClient.invalidateQueries({ queryKey: ['homework'] });
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
    },
  });
};
