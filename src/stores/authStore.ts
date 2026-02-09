import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';

import type { Tables } from '@/types/database.types';

// ─── Profile Type ───────────────────────────────────────────────────────────

export type Profile = Tables<'profiles'>;

// ─── Store Shape ────────────────────────────────────────────────────────────

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  schoolSlug: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setSchoolSlug: (slug: string) => void;
  clearAuth: () => void;
  initialize: () => void;
}

type AuthStore = AuthState & AuthActions;

// ─── Initial State ──────────────────────────────────────────────────────────

const initialState: AuthState = {
  session: null,
  profile: null,
  schoolSlug: null,
  isLoading: true,
  isAuthenticated: false,
};

// ─── Store ──────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setSession: (session) =>
        set({
          session,
          isAuthenticated: session !== null,
          isLoading: false,
        }),

      setProfile: (profile) =>
        set({ profile }),

      setSchoolSlug: (slug) =>
        set({ schoolSlug: slug }),

      clearAuth: () =>
        set({
          session: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      initialize: () =>
        set({ isLoading: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Persist profile and schoolSlug for login convenience.
        // Session is managed by Supabase's own SecureStore adapter.
        profile: state.profile,
        schoolSlug: state.schoolSlug,
      }),
    },
  ),
);
