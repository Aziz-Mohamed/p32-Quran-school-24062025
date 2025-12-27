import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";
import ar from "../constants/i18n/locales/ar.json";
import en from "../constants/i18n/locales/en.json";

const LANGUAGE_KEY = "@quran_school_language";

// --- i18n Initialization Promise for App Readiness ---
let i18nInitResolve: (() => void) | null = null;
export const i18nInitPromise: Promise<void> = new Promise((resolve) => {
  i18nInitResolve = resolve;
});

// Function to get stored language
const getStoredLanguage = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch (error) {
    console.log("Error reading language from storage:", error);
    return null;
  }
};

// Function to store language
const storeLanguage = async (language: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch (error) {
    console.log("Error storing language:", error);
  }
};

// Function to apply RTL based on language
const applyRTLForLanguage = (language: string) => {
  const shouldBeRTL = language === "ar";
  console.log(`Applying RTL for language ${language}: ${shouldBeRTL}`);

  if (I18nManager.isRTL !== shouldBeRTL) {
    console.log(`Changing RTL from ${I18nManager.isRTL} to ${shouldBeRTL}`);
    I18nManager.forceRTL(shouldBeRTL);
  }
};

// Initialize i18n with stored language
const initializeI18n = async () => {
  try {
    // Get stored language or use device locale
    const storedLanguage = await getStoredLanguage();
    const deviceLocale = Localization.locale;
    const isArabicLocale = deviceLocale.startsWith("ar");
    const defaultLanguage = isArabicLocale ? "ar" : "en";
    const initialLanguage = storedLanguage || defaultLanguage;

    console.log(`Initializing i18n with language: ${initialLanguage}`);
    console.log(
      `Device locale: ${deviceLocale}, Stored language: ${storedLanguage}`
    );

    // Apply RTL based on initial language
    applyRTLForLanguage(initialLanguage);

    // Initialize i18n with proper configuration
    await i18n.use(initReactI18next).init({
      lng: initialLanguage,
      fallbackLng: "en",
      resources: {
        en: { translation: en },
        ar: { translation: ar },
      },
      interpolation: { escapeValue: false },
      react: {
        useSuspense: false,
      },
      // Add these options for better stability
      debug: __DEV__,
      keySeparator: ".",
      nsSeparator: ":",
    });

    // Listen for language changes to update RTL and store preference
    i18n.on("languageChanged", async (lng) => {
      console.log(`Language changed to: ${lng}`);

      // Apply RTL for the new language
      applyRTLForLanguage(lng);

      // Store the language preference
      await storeLanguage(lng);
    });

    if (i18nInitResolve) i18nInitResolve();
    console.log("i18n initialization completed successfully");
  } catch (error) {
    console.error("Error initializing i18n:", error);
    // Fallback to English if initialization fails
    try {
      await i18n.use(initReactI18next).init({
        lng: "en",
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
      if (i18nInitResolve) i18nInitResolve();
      console.log("i18n fallback initialization completed");
    } catch (fallbackError) {
      console.error(
        "Critical error: i18n fallback also failed:",
        fallbackError
      );
      if (i18nInitResolve) i18nInitResolve();
    }
  }
};

// Initialize immediately
initializeI18n();

export default i18n;
