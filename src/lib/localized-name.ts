import i18n from '@/i18n/config';

/**
 * Resolve a localized name from a JSONB map with graceful fallback.
 *
 * Fallback chain:
 *   1. name_localized[currentLanguage]
 *   2. name_localized['en'] (English as universal fallback)
 *   3. First available value in name_localized
 *   4. The canonical full_name string
 *   5. '—' (em dash, if everything is empty)
 */
export function getLocalizedName(
  nameLocalized: Record<string, string> | unknown,
  fallbackName: string | null | undefined,
  lang?: string,
): string {
  const currentLang = lang ?? i18n.language ?? 'en';

  if (nameLocalized && typeof nameLocalized === 'object' && !Array.isArray(nameLocalized)) {
    const map = nameLocalized as Record<string, string>;
    if (map[currentLang]) return map[currentLang];
    if (map['en']) return map['en'];
    const values = Object.values(map).filter(Boolean);
    if (values.length > 0) return values[0]!;
  }

  return fallbackName || '\u2014';
}

/**
 * Extract first name from a localized name map.
 * Used in greetings: "Welcome, Ahmed"
 */
export function getLocalizedFirstName(
  nameLocalized: Record<string, string> | unknown,
  fallbackName: string | null | undefined,
  lang?: string,
): string {
  const fullName = getLocalizedName(nameLocalized, fallbackName, lang);
  return fullName.split(/\s+/)[0] ?? fullName;
}

/**
 * Build the name_localized object from form inputs.
 * Filters out empty strings.
 */
export function buildNameLocalized(
  entries: Record<string, string>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [lang, name] of Object.entries(entries)) {
    const trimmed = name.trim();
    if (trimmed) result[lang] = trimmed;
  }
  return result;
}

/**
 * Determine the canonical full_name from a name_localized map.
 * Priority: English > first available value.
 */
export function getCanonicalName(
  nameLocalized: Record<string, string>,
): string {
  return nameLocalized['en'] ?? Object.values(nameLocalized).find(Boolean) ?? '';
}
