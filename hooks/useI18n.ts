import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "../constants/i18n/locales/ar.json";
import en from "../constants/i18n/locales/en.json";

i18n.use(initReactI18next).init({
  lng: Localization.locale.startsWith("ar") ? "ar" : "en",
  fallbackLng: "en",
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  interpolation: { escapeValue: false },
  react: {
    useSuspense: false,
  },
});

export default i18n;
