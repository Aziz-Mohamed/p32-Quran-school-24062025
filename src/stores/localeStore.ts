import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { I18nManager } from 'react-native';
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
// Defaults are derived from I18nManager.isRTL (synchronous, native-persisted)
// so the store is consistent even before async hydration from AsyncStorage.

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: (I18nManager.isRTL ? 'ar' : 'en') as SupportedLocale,
      isRTL: I18nManager.isRTL,

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
