import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lessonsService } from '../services/lessons.service';
import type { LessonFilters } from '../types/lessons.types';

export const useLessons = (filters?: LessonFilters) => {
  return useQuery({
    queryKey: ['lessons', filters],
    queryFn: async () => {
      const { data, error } = await lessonsService.getLessons(filters);
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useLessonProgress = (studentId: string | undefined) => {
  return useQuery({
    queryKey: ['lesson-progress', studentId],
    queryFn: async () => {
      if (!studentId) throw new Error('Student ID is required');
      const { data, error } = await lessonsService.getLessonProgress(studentId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!studentId,
  });
};

export const useUpdateLessonProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['update-lesson-progress'],
    mutationFn: (input: {
      studentId: string;
      lessonId: string;
      status: string;
      completionPercentage: number;
    }) =>
      lessonsService.updateLessonProgress(input.studentId, input.lessonId, {
        status: input.status,
        completion_percentage: input.completionPercentage,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['lesson-progress', variables.studentId],
      });
    },
  });
};
