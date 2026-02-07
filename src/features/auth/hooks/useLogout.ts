import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '../services/auth.service';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStore();

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await authService.logout();

      if (result.error) {
        throw new Error(result.error.message);
      }
    },
    onSuccess: () => {
      // Clear auth store
      clearAuth();

      // Clear all cached queries
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout error:', error);
    },
  });

  return {
    logout: mutation.mutate,
    logoutAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};
