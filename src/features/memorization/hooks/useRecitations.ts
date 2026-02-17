import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mutationTracker } from '@/features/realtime';
import { recitationService } from '../services/recitation.service';
import type { CreateRecitationInput, RecitationFilters } from '../types/memorization.types';

export const useCreateRecitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['create-recitation'],
    mutationFn: (input: CreateRecitationInput) =>
      recitationService.createRecitation(input),
    onSuccess: (result) => {
      if (result?.data?.id) {
        mutationTracker.record('recitations', result.data.id);
      }
      queryClient.invalidateQueries({ queryKey: ['recitations'] });
      queryClient.invalidateQueries({ queryKey: ['memorization-progress'] });
      queryClient.invalidateQueries({ queryKey: ['revision-schedule'] });
    },
  });
};

export const useCreateRecitations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['create-recitations'],
    mutationFn: (inputs: CreateRecitationInput[]) =>
      recitationService.createRecitations(inputs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recitations'] });
      queryClient.invalidateQueries({ queryKey: ['memorization-progress'] });
      queryClient.invalidateQueries({ queryKey: ['revision-schedule'] });
    },
  });
};

export const useRecitations = (filters: RecitationFilters) => {
  return useQuery({
    queryKey: ['recitations', filters],
    queryFn: async () => {
      const { data, error } = await recitationService.getRecitations(filters);
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useSessionRecitations = (sessionId: string | undefined) => {
  return useQuery({
    queryKey: ['recitations', 'session', sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error('Session ID is required');
      const { data, error } = await recitationService.getRecitationsBySession(sessionId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!sessionId,
  });
};
