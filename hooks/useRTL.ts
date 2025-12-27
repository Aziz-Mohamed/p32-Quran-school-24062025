import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import * as Updates from "expo-updates";
import { I18nManager } from "react-native";

const LANGUAGE_KEY = "@quran_school_language";

export const useRTL = () => {
  const isArabic = Localization.locale.startsWith("ar");

  // Check if RTL state needs to be changed
  if (I18nManager.isRTL !== isArabic) {
    console.log(`Switching to ${isArabic ? "RTL" : "LTR"} layout`);
    I18nManager.forceRTL(isArabic);

    // Reload the app to apply RTL changes
    setTimeout(async () => {
      try {
        await Updates.reloadAsync();
      } catch (error) {
        console.log("Failed to reload app for RTL:", error);
        // Fallback: restart the app manually
        if (__DEV__) {
          console.log("Please restart the app manually to apply RTL changes");
        }
      }
    }, 100);
  }
};

// Function to force RTL reload when language changes
export const forceRTLReload = async (isArabic: boolean) => {
  console.log(`Forcing ${isArabic ? "RTL" : "LTR"} layout change`);

  // Force RTL change
  I18nManager.forceRTL(isArabic);

  // Wait a bit for the change to take effect
  await new Promise((resolve) => setTimeout(resolve, 200));

  try {
    console.log("Reloading app to apply RTL changes...");
    await Updates.reloadAsync();
  } catch (error) {
    console.log("Failed to reload app for RTL:", error);
    if (__DEV__) {
      console.log("Please restart the app manually to apply RTL changes");
      // In development, we can't reload, so show a message
      alert(
        `Please restart the app manually to apply ${
          isArabic ? "RTL" : "LTR"
        } changes`
      );
    }
  }
};

// Function to check and fix RTL state
export const checkAndFixRTL = (currentLanguage: string) => {
  const shouldBeRTL = currentLanguage === "ar";
  const isCurrentlyRTL = I18nManager.isRTL;

  console.log(
    `Language: ${currentLanguage}, Should be RTL: ${shouldBeRTL}, Currently RTL: ${isCurrentlyRTL}`
  );

  if (shouldBeRTL !== isCurrentlyRTL) {
    console.log("RTL mismatch detected! Fixing...");
    I18nManager.forceRTL(shouldBeRTL);
    return true; // Indicates RTL was changed
  }

  return false; // No change needed
};

// Function to initialize RTL based on stored language preference
export const initializeRTL = async () => {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (storedLanguage) {
      const shouldBeRTL = storedLanguage === "ar";
      const isCurrentlyRTL = I18nManager.isRTL;

      console.log(
        `Initializing RTL: stored=${storedLanguage}, shouldBeRTL=${shouldBeRTL}, isCurrentlyRTL=${isCurrentlyRTL}`
      );

      if (shouldBeRTL !== isCurrentlyRTL) {
        console.log("RTL mismatch on app start! Fixing...");
        I18nManager.forceRTL(shouldBeRTL);
        return true; // Indicates RTL was changed
      }
    }
  } catch (error) {
    console.error("Error initializing RTL:", error);
  }

  return false; // No change needed
};

// Function to get current RTL state
export const getCurrentRTLState = () => {
  return {
    isRTL: I18nManager.isRTL,
    isArabic: I18nManager.isRTL,
    direction: I18nManager.isRTL ? "rtl" : "ltr",
  };
};
