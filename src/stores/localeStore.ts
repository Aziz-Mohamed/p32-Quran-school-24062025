import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SupportedLocale } from '@/types/common.types';

// ─── Store Shape ────────────────────────────────────────────────────────────

interface LocaleState {
  locale: SupportedLocale;
  isRTL: boolean;
}

interface LocaleActions {
  setLocale: (locale: SupportedLocale) => void;
}

type LocaleStore = LocaleState & LocaleActions;

// ─── Helpers ────────────────────────────────────────────────────────────────

const RTL_LOCALES: ReadonlySet<SupportedLocale> = new Set(['ar']);

const isRTLLocale = (locale: SupportedLocale): boolean =>
  RTL_LOCALES.has(locale);

// ─── Store ──────────────────────────────────────────────────────────────────

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: 'en',
      isRTL: false,

      setLocale: (locale) =>
        set({
          locale,
          isRTL: isRTLLocale(locale),
        }),
    }),
    {
      name: 'locale-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
