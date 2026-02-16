import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parentsService } from '../services/parents.service';
import { mutationTracker } from '@/features/realtime';
import type { ParentFilters } from '../types/parents.types';
import { authService } from '@/features/auth/services/auth.service';
import type { CreateMemberInput } from '@/features/auth/types/auth.types';

export function useParents(filters?: ParentFilters) {
  return useQuery({
    queryKey: ['parents', filters],
    queryFn: async () => {
      const { data, error } = await parentsService.getParents(filters);
      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useParentById(id: string | undefined) {
  return useQuery({
    queryKey: ['parents', id],
    queryFn: async () => {
      const { data, error } = await parentsService.getParentById(id!);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<CreateMemberInput, 'role'>) =>
      authService.createMember({ ...input, role: 'parent' }),
    onSuccess: (data) => {
      if (data?.data?.profile?.id) {
        mutationTracker.record('profiles', data.data.profile.id);
      }
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });
}

export function useUpdateParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { fullName?: string; phone?: string } }) =>
      parentsService.updateParent(id, input),
    onSuccess: (_data, variables) => {
      mutationTracker.record('profiles', variables.id);
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      queryClient.invalidateQueries({ queryKey: ['parents', variables.id] });
    },
  });
}
