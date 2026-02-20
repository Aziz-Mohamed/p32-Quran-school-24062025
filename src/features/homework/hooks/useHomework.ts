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

export const useHomeworkById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['homework', id],
    queryFn: async () => {
      if (!id) throw new Error('Homework ID is required');
      const { data, error } = await homeworkService.getHomeworkById(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCompleteHomework = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['complete-homework'],
    mutationFn: async (homeworkId: string) => {
      const { data, error } = await homeworkService.completeHomework(homeworkId);
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, homeworkId) => {
      mutationTracker.record('homework', homeworkId);
      queryClient.invalidateQueries({ queryKey: ['homework'] });
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
    },
  });
};
