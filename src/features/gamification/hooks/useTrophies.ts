import { useQuery } from '@tanstack/react-query';
import { gamificationService } from '../services/gamification.service';

export const useStudentTrophies = (studentId: string | undefined) => {
  return useQuery({
    queryKey: ['student-trophies', studentId],
    queryFn: async () => {
      if (!studentId) throw new Error('Student ID is required');
      const result = await gamificationService.getStudentTrophies(studentId);
      if (result.trophiesError) throw result.trophiesError;
      if (result.earnedError) throw result.earnedError;
      return {
        allTrophies: result.allTrophies ?? [],
        earnedTrophies: result.earnedTrophies ?? [],
      };
    },
    enabled: !!studentId,
  });
};

export const useStudentAchievements = (studentId: string | undefined) => {
  return useQuery({
    queryKey: ['student-achievements', studentId],
    queryFn: async () => {
      if (!studentId) throw new Error('Student ID is required');
      const { data, error } = await gamificationService.getStudentAchievements(studentId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!studentId,
  });
};

export const useLevels = () => {
  return useQuery({
    queryKey: ['levels'],
    queryFn: async () => {
      const { data, error } = await gamificationService.getLevels();
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes — levels rarely change
  });
};
