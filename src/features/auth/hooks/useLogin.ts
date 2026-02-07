import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '../services/auth.service';
import type { LoginInput } from '../types/auth.types';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { setSession, setProfile } = useAuthStore();

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const result = await authService.login(input);

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (!result.data) {
        throw new Error('Login failed');
      }

      return result.data;
    },
    onSuccess: async (session) => {
      // Update session in store
      setSession(session);

      // Fetch and update profile
      const profileResult = await authService.getProfile(session.user.id);
      
      if (profileResult.data) {
        setProfile(profileResult.data);
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
};
