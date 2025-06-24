import { useRTLStyles } from "@/hooks/useRTLStyles";
import { useTranslation } from "@/hooks/useTranslation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  I18nManager,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

const LANGUAGE_KEY = "@quran_school_language";

export const RTLDebug: React.FC = () => {
  const { rtlStyles, isRTL } = useRTLStyles();
  const { t, i18n } = useTranslation();
  const [storedLanguage, setStoredLanguage] = useState<string | null>(null);

  useEffect(() => {
    // Get stored language on component mount
    const getStoredLanguage = async () => {
      try {
        const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
        setStoredLanguage(lang);
      } catch (error) {
        console.log("Error reading stored language:", error);
      }
    };

    getStoredLanguage();
  }, []);

  const clearLanguageStorage = async () => {
    Alert.alert(
      "Clear Language Storage",
      "This will clear the stored language preference and reset to device default.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(LANGUAGE_KEY);
              setStoredLanguage(null);
              Alert.alert(
                "Success",
                "Language storage cleared. Restart the app to see changes."
              );
            } catch (error) {
              Alert.alert("Error", "Failed to clear language storage.");
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText
        type="subtitle"
        style={[styles.title, rtlStyles.textDirection]}
      >
        RTL Debug Information
      </ThemedText>

      <ThemedView style={styles.debugSection}>
        <ThemedText style={[styles.debugText, rtlStyles.textDirection]}>
          Current Language: {i18n.language}
        </ThemedText>
        <ThemedText style={[styles.debugText, rtlStyles.textDirection]}>
          Stored Language: {storedLanguage || "None (using device default)"}
        </ThemedText>
        <ThemedText style={[styles.debugText, rtlStyles.textDirection]}>
          I18nManager.isRTL: {I18nManager.isRTL ? "true" : "false"}
        </ThemedText>
        <ThemedText style={[styles.debugText, rtlStyles.textDirection]}>
          useRTLStyles.isRTL: {isRTL ? "true" : "false"}
        </ThemedText>
        <ThemedText style={[styles.debugText, rtlStyles.textDirection]}>
          Device Locale: {require("expo-localization").locale}
        </ThemedText>
      </ThemedView>

      <TouchableOpacity
        style={styles.clearButton}
        onPress={clearLanguageStorage}
      >
        <ThemedText style={[styles.clearButtonText, rtlStyles.textDirection]}>
          Clear Language Storage
        </ThemedText>
      </TouchableOpacity>

      <ThemedView style={styles.testSection}>
        <ThemedText style={[styles.testTitle, rtlStyles.textDirection]}>
          RTL Test Layout
        </ThemedText>

        {/* Test 1: Simple row with icon and text */}
        <View style={[styles.testRow, rtlStyles.row]}>
          <View style={styles.testIcon}>
            <ThemedText style={styles.iconText}>📱</ThemedText>
          </View>
          <ThemedText style={[styles.testText, rtlStyles.textDirection]}>
            {t("home.title")}
          </ThemedText>
        </View>

        {/* Test 2: Text alignment */}
        <ThemedView style={styles.testBox}>
          <ThemedText style={[styles.testText, rtlStyles.textDirection]}>
            {t("home.welcome")}
          </ThemedText>
        </ThemedView>

        {/* Test 3: Mixed content */}
        <ThemedView style={styles.testBox}>
          <ThemedText style={[styles.testText, rtlStyles.textDirection]}>
            English - العربية
          </ThemedText>
        </ThemedView>

        {/* Test 4: Margins */}
        <View style={[styles.marginTest, rtlStyles.marginStart(20)]}>
          <ThemedText style={[styles.testText, rtlStyles.textDirection]}>
            Margin Start Test
          </ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.instructions}>
        <ThemedText style={[styles.instructionText, rtlStyles.textDirection]}>
          If RTL is working correctly:
        </ThemedText>
        <ThemedText style={[styles.instructionText, rtlStyles.textDirection]}>
          • Text should align to the right in Arabic
        </ThemedText>
        <ThemedText style={[styles.instructionText, rtlStyles.textDirection]}>
          • Icon should appear on the right side of text
        </ThemedText>
        <ThemedText style={[styles.instructionText, rtlStyles.textDirection]}>
          • Margins should be applied to the correct side
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
    fontWeight: "600",
  },
  debugSection: {
    backgroundColor: "#F0F8FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  debugText: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: "monospace",
  },
  clearButton: {
    backgroundColor: "#FF3B30",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  clearButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  testSection: {
    marginBottom: 16,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  testRow: {
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#E5F3FF",
    borderRadius: 8,
    marginBottom: 8,
  },
  testIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  iconText: {
    fontSize: 12,
  },
  testText: {
    fontSize: 14,
  },
  testBox: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  marginTest: {
    backgroundColor: "#FFF3E0",
    padding: 8,
    borderRadius: 4,
  },
  instructions: {
    backgroundColor: "#F0FFF0",
    padding: 12,
    borderRadius: 8,
  },
  instructionText: {
    fontSize: 12,
    marginBottom: 4,
  },
});
