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
 *   1. Persist locale to Zustand/AsyncStorage
 *   2. Update i18n translations
 *   3. If direction changed: forceRTL() → Updates.reloadAsync()
 *      After reload, I18nManager.isRTL is set from the first frame.
 *      Every component — native and JS — renders in the correct direction.
 */
export function useChangeLanguage() {
  const { i18n } = useTranslation();
  const { locale, setLocale } = useLocaleStore();

  const changeLanguage = useCallback(
    async (newLocale: SupportedLocale) => {
      if (newLocale === locale) return;

      // 1. Persist user preference
      setLocale(newLocale);

      // 2. Update translations
      await i18n.changeLanguage(newLocale);

      // 3. Handle RTL direction change
      const shouldBeRTL = newLocale === 'ar';
      if (I18nManager.isRTL !== shouldBeRTL && Platform.OS !== 'web') {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);

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
