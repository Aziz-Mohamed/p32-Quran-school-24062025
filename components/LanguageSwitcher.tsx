import { forceRTLReload } from "@/hooks/useRTL";
import { useRTLStyles } from "@/hooks/useRTLStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

const LANGUAGE_KEY = "@quran_school_language";

export const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const { rtlStyles } = useRTLStyles();

  const toggleLanguage = async () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    const isArabic = newLang === "ar";

    // Show alert to inform user about app reload
    Alert.alert(
      "Language Change",
      `Switching to ${
        isArabic ? "Arabic" : "English"
      } will reload the app to apply RTL layout changes.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: async () => {
            try {
              // Store the language preference first
              await AsyncStorage.setItem(LANGUAGE_KEY, newLang);
              console.log(`Stored language preference: ${newLang}`);

              // Change language
              i18n.changeLanguage(newLang);
              console.log(`Changed language to: ${newLang}`);

              // Force RTL reload
              await forceRTLReload(isArabic);
            } catch (error) {
              console.error("Error changing language:", error);
              Alert.alert(
                "Error",
                "Failed to change language. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={[styles.container, rtlStyles.row]}>
      <ThemedText style={[styles.label, rtlStyles.textDirection]}>
        {t("settings.language")}
      </ThemedText>
      <TouchableOpacity
        style={styles.button}
        onPress={toggleLanguage}
        activeOpacity={0.7}
      >
        <ThemedText style={[styles.buttonText, rtlStyles.textDirection]}>
          {i18n.language === "en" ? "العربية" : "English"}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
