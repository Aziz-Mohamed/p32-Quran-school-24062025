import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '../services/auth.service';
import type { RegisterInput } from '../types/auth.types';

export const useRegister = () => {
  const queryClient = useQueryClient();
  const { setSession, setProfile } = useAuthStore();

  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const result = await authService.register(input);

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (!result.data) {
        throw new Error('Registration failed');
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
      console.error('Registration error:', error);
    },
  });
};
