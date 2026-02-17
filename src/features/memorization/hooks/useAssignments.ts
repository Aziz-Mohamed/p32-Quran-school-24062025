import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mutationTracker } from '@/features/realtime';
import { assignmentService } from '../services/assignment.service';
import type { CreateAssignmentInput, AssignmentFilters } from '../types/memorization.types';

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['create-assignment'],
    mutationFn: (input: CreateAssignmentInput) =>
      assignmentService.createAssignment(input),
    onSuccess: (result) => {
      if (result?.data?.id) {
        mutationTracker.record('memorization_assignments', result.data.id);
      }
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['revision-schedule'] });
    },
  });
};

export const useAssignments = (filters: AssignmentFilters) => {
  return useQuery({
    queryKey: ['assignments', filters],
    queryFn: async () => {
      const { data, error } = await assignmentService.getAssignments(filters);
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useCompleteAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['complete-assignment'],
    mutationFn: ({ assignmentId, recitationId }: { assignmentId: string; recitationId: string }) =>
      assignmentService.completeAssignment(assignmentId, recitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['revision-schedule'] });
    },
  });
};

export const useCancelAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cancel-assignment'],
    mutationFn: (assignmentId: string) =>
      assignmentService.cancelAssignment(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['revision-schedule'] });
    },
  });
};
