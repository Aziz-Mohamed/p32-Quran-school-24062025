import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import { getLocales } from 'expo-localization';

import en from './en.json';
import ar from './ar.json';

export const defaultNS = 'translation' as const;
export const supportedLanguages = ['en', 'ar'] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export const resources = {
  en: { translation: en },
  ar: { translation: ar },
} as const;

/** Derive a fully-typed key union from the English translation file. */
export type TranslationKeys = keyof typeof en;

/** Languages that use right-to-left text direction. */
export const rtlLanguages: readonly SupportedLanguage[] = ['ar'] as const;

export function isRTL(lang: SupportedLanguage): boolean {
  return (rtlLanguages as readonly string[]).includes(lang);
}

/**
 * Determine the initial language synchronously.
 *
 * After a language switch + reload, `I18nManager.isRTL` reflects the
 * native-persisted state set by `forceRTL()`. We use it as the primary
 * signal so translations match the RTL layout direction immediately.
 *
 * On first-ever launch (no previous `forceRTL` call), fall back to the
 * device locale.
 */
function getInitialLanguage(): SupportedLanguage {
  if (I18nManager.isRTL) return 'ar';

  const locales = getLocales();
  const deviceLang = locales[0]?.languageCode ?? 'en';
  return (supportedLanguages as readonly string[]).includes(deviceLang)
    ? (deviceLang as SupportedLanguage)
    : 'en';
}

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  defaultNS,
  supportedLngs: supportedLanguages as unknown as string[],

  interpolation: {
    escapeValue: false, // React already escapes rendered strings
  },

  react: {
    useSuspense: false,
  },
});

export default i18n;
