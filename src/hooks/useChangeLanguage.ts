import { useCallback } from 'react';
import { I18nManager, NativeModules, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Updates from 'expo-updates';

import { useLocaleStore } from '@/stores/localeStore';
import type { SupportedLocale } from '@/types/common.types';

/**
 * Shared hook for changing the app language with proper RTL handling.
 *
 * Production flow (primary):
 *   forceRTL() → persist locale → Updates.reloadAsync()
 *   After reload, I18nManager.isRTL is true from the first frame.
 *   ALL native + JS components render RTL (tab bar, nav animations, text cursors, etc.)
 *
 * Development fallback:
 *   forceRTL() → persist locale → DevSettings.reload() (JS bundle reload)
 *   If DevSettings is unavailable, the root View `direction` style in _layout.tsx
 *   provides an immediate JS-level RTL flip for layout development/testing.
 */
export function useChangeLanguage() {
  const { i18n } = useTranslation();
  const { locale, setLocale } = useLocaleStore();

  const changeLanguage = useCallback(
    async (newLocale: SupportedLocale) => {
      if (newLocale === locale) return;

      const shouldBeRTL = newLocale === 'ar';
      const directionChanged = I18nManager.isRTL !== shouldBeRTL;

      // 1. Persist user preference to Zustand/AsyncStorage
      setLocale(newLocale);

      // 2. Update translations
      await i18n.changeLanguage(newLocale);

      // 3. If direction changed, set native RTL and reload the app.
      //    In production, Updates.reloadAsync() does a full native reload
      //    so every component (including native tab bar, navigation, etc.)
      //    picks up the new I18nManager.isRTL value from the first frame.
      if (directionChanged && Platform.OS !== 'web') {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);

        try {
          await Updates.reloadAsync();
        } catch {
          // Dev builds: Updates.reloadAsync() is unavailable.
          // DevSettings.reload() reloads the JS bundle so views remount.
          if (__DEV__ && NativeModules.DevSettings?.reload) {
            NativeModules.DevSettings.reload();
          }
        }
      }
    },
    [locale, setLocale, i18n],
  );

  const toggleLanguage = useCallback(() => {
    return changeLanguage(locale === 'en' ? 'ar' : 'en');
  }, [locale, changeLanguage]);

  return { locale, toggleLanguage, changeLanguage };
}
