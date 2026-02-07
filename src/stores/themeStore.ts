import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Store Shape ────────────────────────────────────────────────────────────

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
}

interface ThemeActions {
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

type ThemeStore = ThemeState & ThemeActions;

// ─── Store ──────────────────────────────────────────────────────────────────

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'light', // Dark mode is Phase 2

      setMode: (mode) => set({ mode }),

      toggleMode: () =>
        set((state) => ({
          mode: state.mode === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
