import * as Localization from "expo-localization";
import * as Updates from "expo-updates";
import { I18nManager } from "react-native";

export const useRTL = async () => {
  const isArabic = Localization.locale.startsWith("ar");
  if (I18nManager.isRTL !== isArabic) {
    I18nManager.forceRTL(isArabic);
    await Updates.reloadAsync();
  }
};
