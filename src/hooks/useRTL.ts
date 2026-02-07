import { useLocaleStore } from '@/stores/localeStore';
import type { Direction, SupportedLocale } from '@/types/common.types';

interface UseRTLReturn {
  isRTL: boolean;
  locale: SupportedLocale;
  direction: Direction;
}

/**
 * RTL detection helper. Reads the current locale and derives layout direction.
 */
export const useRTL = (): UseRTLReturn => {
  const { locale, isRTL } = useLocaleStore();

  return {
    isRTL,
    locale,
    direction: isRTL ? 'rtl' : 'ltr',
  };
};
