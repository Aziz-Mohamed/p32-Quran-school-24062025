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
    try {
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
                await i18n.changeLanguage(newLang);
                console.log(`Changed language to: ${newLang}`);

                // Force RTL reload with a small delay to ensure language change is processed
                setTimeout(async () => {
                  await forceRTLReload(isArabic);
                }, 100);
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
    } catch (error) {
      console.error("Error in toggleLanguage:", error);
      Alert.alert("Error", "Failed to change language. Please try again.");
    }
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  button: {
    backgroundColor: "#3A7D5D",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
