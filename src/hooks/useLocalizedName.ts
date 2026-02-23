import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { getLocalizedName, getLocalizedFirstName } from '@/lib/localized-name';

/**
 * Hook that wraps getLocalizedName with the current i18n language.
 * Returns memoized name resolvers that auto-read current language.
 */
export function useLocalizedName() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const resolveName = useCallback(
    (
      nameLocalized: Record<string, string> | unknown,
      fallbackName: string | null | undefined,
    ) => getLocalizedName(nameLocalized, fallbackName, lang),
    [lang],
  );

  const resolveFirstName = useCallback(
    (
      nameLocalized: Record<string, string> | unknown,
      fallbackName: string | null | undefined,
    ) => getLocalizedFirstName(nameLocalized, fallbackName, lang),
    [lang],
  );

  return { resolveName, resolveFirstName };
}
