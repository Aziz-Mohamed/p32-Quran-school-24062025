import { useCallback } from 'react';
import { Alert, I18nManager, NativeModules, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Updates from 'expo-updates';

import { useLocaleStore } from '@/stores/localeStore';
import type { SupportedLocale } from '@/types/common.types';

/**
 * Reload the app after an RTL direction change.
 *
 * - Production: `Updates.reloadAsync()` does a full native reload.
 * - Development: `DevSettings.reload()` reloads the JS bundle, causing
 *   all views to remount and pick up the new I18nManager direction.
 * - Fallback: Alert asking the user to manually restart.
 */
async function reloadApp(): Promise<void> {
  try {
    await Updates.reloadAsync();
  } catch {
    if (__DEV__ && NativeModules.DevSettings?.reload) {
      NativeModules.DevSettings.reload();
    } else {
      Alert.alert(
        'Restart Required',
        'Please restart the app to apply the language change.',
      );
    }
  }
}

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
        await reloadApp();
      }
    },
    [locale, setLocale, i18n],
  );

  const toggleLanguage = useCallback(() => {
    return changeLanguage(locale === 'en' ? 'ar' : 'en');
  }, [locale, changeLanguage]);

  return { locale, toggleLanguage, changeLanguage };
}
