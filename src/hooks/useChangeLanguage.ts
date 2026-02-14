import { useCallback } from 'react';
import { Alert, I18nManager, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Updates from 'expo-updates';

import { useLocaleStore } from '@/stores/localeStore';
import type { SupportedLocale } from '@/types/common.types';

/**
 * Shared hook for changing the app language with proper RTL handling.
 *
 * When the direction changes (LTR ↔ RTL), calls `I18nManager.forceRTL()`
 * and reloads the app so the native layout engine flips all layouts.
 */
export function useChangeLanguage() {
  const { i18n } = useTranslation();
  const { locale, setLocale } = useLocaleStore();

  const changeLanguage = useCallback(
    async (newLocale: SupportedLocale) => {
      if (newLocale === locale) return;

      // 1. Persist user preference
      setLocale(newLocale);
      // 2. Update translations immediately
      await i18n.changeLanguage(newLocale);

      // 3. Handle RTL direction change (requires app reload on native)
      const shouldBeRTL = newLocale === 'ar';
      if (I18nManager.isRTL !== shouldBeRTL && Platform.OS !== 'web') {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
        try {
          await Updates.reloadAsync();
        } catch {
          // Dev mode: Updates.reloadAsync() may not be available
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
