import { NestedKeyOf, TranslationKeys } from "@/constants/i18n/types";
import { useTranslation as useT } from "react-i18next";

export const useTranslation = () => {
  const translation = useT();

  // Add error handling for missing translations with type safety
  const t = (key: NestedKeyOf<TranslationKeys>, options?: any) => {
    try {
      return translation.t(key, options);
    } catch (error) {
      console.warn(`Translation key not found: ${key}`);
      return key; // Return the key as fallback
    }
  };

  return {
    ...translation,
    t,
  };
};
