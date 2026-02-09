import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '../services/auth.service';
import type { LoginInput } from '../types/auth.types';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { setSession, setProfile, setSchoolSlug } = useAuthStore();

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      // Persist school slug for next login
      setSchoolSlug(input.schoolSlug);

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
      setSession(session);

      const profileResult = await authService.getProfile(session.user.id);

      if (profileResult.data) {
        setProfile(profileResult.data);
      }

      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
};
