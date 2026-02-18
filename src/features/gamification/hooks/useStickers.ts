import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gamificationService } from '../services/gamification.service';
import { mutationTracker } from '@/features/realtime';

export const useStickers = (schoolId: string | undefined) => {
  return useQuery({
    queryKey: ['stickers', schoolId],
    queryFn: async () => {
      if (!schoolId) throw new Error('School ID is required');
      const { data, error } = await gamificationService.getStickers(schoolId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!schoolId,
  });
};

export const useStudentStickers = (studentId: string | undefined) => {
  return useQuery({
    queryKey: ['student-stickers', studentId],
    queryFn: async () => {
      if (!studentId) throw new Error('Student ID is required');
      const { data, error } = await gamificationService.getStudentStickers(studentId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!studentId,
  });
};

export const useAwardSticker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['award-sticker'],
    mutationFn: (input: {
      studentId: string;
      stickerId: string;
      awardedBy: string;
      reason?: string;
      schoolId: string;
    }) => gamificationService.awardSticker(input),
    onSuccess: (data, variables) => {
      if (data?.data?.id) {
        mutationTracker.record('student_stickers', data.data.id);
      }
      queryClient.invalidateQueries({
        queryKey: ['student-stickers', variables.studentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['student-dashboard', variables.studentId],
      });
    },
  });
};
