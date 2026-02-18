import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teachersService } from '../services/teachers.service';
import { mutationTracker } from '@/features/realtime';
import type { TeacherFilters } from '../types/teachers.types';
import { authService } from '@/features/auth/services/auth.service';
import type { CreateMemberInput } from '@/features/auth/types/auth.types';

/**
 * Hook for fetching teachers with optional filters.
 */
export function useTeachers(filters?: TeacherFilters) {
  return useQuery({
    queryKey: ['teachers', filters],
    queryFn: async () => {
      const { data, error } = await teachersService.getTeachers(filters);
      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook for fetching a single teacher by profile ID.
 */
export function useTeacherById(id: string | undefined) {
  return useQuery({
    queryKey: ['teachers', id],
    queryFn: async () => {
      const { data, error } = await teachersService.getTeacherById(id!);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Mutation hook for creating a teacher via the create-member Edge Function.
 */
export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<CreateMemberInput, 'role'>) =>
      authService.createMember({ ...input, role: 'teacher' }),
    onSuccess: (data) => {
      if (data?.data?.profile?.id) {
        mutationTracker.record('profiles', data.data.profile.id);
      }
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });
}

/**
 * Mutation hook for updating a teacher profile.
 */
export function useUpdateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { fullName?: string; phone?: string } }) =>
      teachersService.updateTeacher(id, input),
    onSuccess: (_data, variables) => {
      mutationTracker.record('profiles', variables.id);
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['teachers', variables.id] });
    },
  });
}
