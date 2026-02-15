import { useCallback } from 'react';
import { Alert, I18nManager, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Updates from 'expo-updates';

import { useLocaleStore } from '@/stores/localeStore';
import type { SupportedLocale } from '@/types/common.types';

/**
 * Shared hook for changing the app language with proper RTL handling.
 *
 * Flow:
 *   1. Persist native RTL via forceRTL() (for native components + future launches)
 *   2. Persist locale to Zustand/AsyncStorage (drives root View `direction` style)
 *   3. Update i18n translations
 *   4. Reload app for full native consistency (production: Updates.reloadAsync())
 *
 * The root View in _layout.tsx applies `direction: 'rtl' | 'ltr'` from the
 * store's isRTL state, which flips all React layouts synchronously.
 * forceRTL() handles native components (tab bar, navigation) that live
 * outside the React tree.
 */
export function useChangeLanguage() {
  const { i18n } = useTranslation();
  const { locale, setLocale } = useLocaleStore();

  const changeLanguage = useCallback(
    async (newLocale: SupportedLocale) => {
      if (newLocale === locale) return;

      const shouldBeRTL = newLocale === 'ar';
      const directionChanged = I18nManager.isRTL !== shouldBeRTL;

      // 1. Set native RTL for native components + persistence
      if (directionChanged && Platform.OS !== 'web') {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
      }

      // 2. Update store → root View `direction` style flips immediately
      setLocale(newLocale);

      // 3. Update translations
      await i18n.changeLanguage(newLocale);

      // 4. Reload for full native consistency
      if (directionChanged && Platform.OS !== 'web') {
        try {
          await Updates.reloadAsync();
        } catch {
          Alert.alert(
            i18n.t('common.restartRequired'),
            i18n.t('common.restartMessage'),
          );
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
