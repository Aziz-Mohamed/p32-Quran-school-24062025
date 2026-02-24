import type { SupportedLanguage } from '@/i18n/config';

/**
 * A map of language codes to localized string values.
 * Example: { en: "Ahmed Ali", ar: "أحمد علي" }
 */
export type LocalizedString = Partial<Record<SupportedLanguage, string>>;

/**
 * Configuration for a supported language with display metadata.
 */
export interface LanguageConfig {
  code: SupportedLanguage;
  /** Native name of the language (e.g., "العربية") */
  nativeName: string;
  /** English name (e.g., "Arabic") */
  englishName: string;
  /** Text direction */
  direction: 'ltr' | 'rtl';
  /** Placeholder text for name fields in this language */
  namePlaceholder: string;
}

export const SUPPORTED_LANGUAGE_CONFIGS: LanguageConfig[] = [
  {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    direction: 'ltr',
    namePlaceholder: 'Enter name in English',
  },
  {
    code: 'ar',
    nativeName: 'العربية',
    englishName: 'Arabic',
    direction: 'rtl',
    namePlaceholder: 'أدخل الاسم بالعربية',
  },
];
