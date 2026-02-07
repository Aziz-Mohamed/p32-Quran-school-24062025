import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
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

/**
 * Detect the device language and return a supported language code.
 * Falls back to 'en' when the device language is not supported.
 */
function getDeviceLanguage(): SupportedLanguage {
  const locales = getLocales();
  const deviceLang = locales[0]?.languageCode ?? 'en';
  return (supportedLanguages as readonly string[]).includes(deviceLang)
    ? (deviceLang as SupportedLanguage)
    : 'en';
}

/** Languages that use right-to-left text direction. */
export const rtlLanguages: readonly SupportedLanguage[] = ['ar'] as const;

export function isRTL(lang: SupportedLanguage): boolean {
  return (rtlLanguages as readonly string[]).includes(lang);
}

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
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
