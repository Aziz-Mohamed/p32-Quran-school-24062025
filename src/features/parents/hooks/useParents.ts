import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parentsService } from '../services/parents.service';
import { mutationTracker } from '@/features/realtime';
import type { ParentFilters } from '../types/parents.types';
import { authService } from '@/features/auth/services/auth.service';
import type { CreateMemberInput } from '@/features/auth/types/auth.types';
import { studentsService } from '@/features/students/services/students.service';

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

/**
 * Creates a parent profile and links the selected students to them.
 * Requires at least one studentId — parents without children are not allowed.
 */
export function useCreateParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<CreateMemberInput, 'role'> & { studentIds: string[] }) => {
      const { studentIds, ...memberInput } = input;

      // Step 1: Create parent profile
      const result = await authService.createMember({ ...memberInput, role: 'parent' });
      if (result.error) throw result.error;

      const parentId = result.data!.profile.id;

      // Step 2: Link all selected students to this parent
      await Promise.all(
        studentIds.map((sid) =>
          studentsService.updateStudent(sid, { parentId })
        )
      );

      return result;
    },
    onSuccess: (data) => {
      if (data?.data?.profile?.id) {
        mutationTracker.record('profiles', data.data.profile.id);
      }
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });
}

/**
 * Manages the parent-child links by adding/removing students.
 */
export function useUpdateParentChildren() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ parentId, addIds, removeIds }: {
      parentId: string;
      addIds: string[];
      removeIds: string[];
    }) => {
      await Promise.all([
        ...addIds.map((sid) => studentsService.updateStudent(sid, { parentId })),
        ...removeIds.map((sid) => studentsService.updateStudent(sid, { parentId: null })),
      ]);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      queryClient.invalidateQueries({ queryKey: ['parents', variables.parentId] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
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
