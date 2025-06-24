import * as Localization from "expo-localization";
import * as Updates from "expo-updates";
import { I18nManager } from "react-native";

export const useRTL = () => {
  const isArabic = Localization.locale.startsWith("ar");
  if (I18nManager.isRTL !== isArabic) {
    I18nManager.forceRTL(isArabic);
    // Use setTimeout to avoid blocking the render
    setTimeout(async () => {
      try {
        await Updates.reloadAsync();
      } catch (error) {
        console.log("Failed to reload app for RTL:", error);
      }
    }, 100);
  }
};
