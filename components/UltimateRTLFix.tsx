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

export const UltimateRTLFix: React.FC = () => {
  const [currentRTL, setCurrentRTL] = useState(I18nManager.isRTL);
  const [storedLanguage, setStoredLanguage] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = () => {
      setCurrentRTL(I18nManager.isRTL);
      AsyncStorage.getItem(LANGUAGE_KEY).then(setStoredLanguage);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 500);
    return () => clearInterval(interval);
  }, []);

  const forceRTLWithRestart = async () => {
    try {
      // Step 1: Store Arabic language
      await AsyncStorage.setItem(LANGUAGE_KEY, "ar");
      setStoredLanguage("ar");

      // Step 2: Force RTL
      I18nManager.forceRTL(true);
      setCurrentRTL(true);

      // Step 3: Show restart instructions
      Alert.alert(
        "🚀 RTL Mode Activated!",
        "Arabic RTL mode has been activated. You MUST restart the app completely to see the changes.\n\n" +
          "Steps:\n" +
          "1. Close this app completely\n" +
          "2. Swipe up and close the app\n" +
          "3. Reopen the app\n" +
          "4. Text should now be right-aligned",
        [
          {
            text: "I Understand",
            onPress: () => {
              // Show another reminder
              setTimeout(() => {
                Alert.alert(
                  "⚠️ Important Reminder",
                  "Please restart the app now to see RTL layout!",
                  [{ text: "OK" }]
                );
              }, 1000);
            },
          },
        ]
      );
    } catch (error) {
      console.log("Error forcing RTL:", error);
      Alert.alert("Error", "Failed to force RTL mode.");
    }
  };

  const forceLTRWithRestart = async () => {
    try {
      // Step 1: Store English language
      await AsyncStorage.setItem(LANGUAGE_KEY, "en");
      setStoredLanguage("en");

      // Step 2: Force LTR
      I18nManager.forceRTL(false);
      setCurrentRTL(false);

      // Step 3: Show restart instructions
      Alert.alert(
        "🚀 LTR Mode Activated!",
        "English LTR mode has been activated. You MUST restart the app completely to see the changes.",
        [
          {
            text: "I Understand",
            onPress: () => {
              setTimeout(() => {
                Alert.alert(
                  "⚠️ Important Reminder",
                  "Please restart the app now to see LTR layout!",
                  [{ text: "OK" }]
                );
              }, 1000);
            },
          },
        ]
      );
    } catch (error) {
      console.log("Error forcing LTR:", error);
      Alert.alert("Error", "Failed to force LTR mode.");
    }
  };

  const clearAndRestart = async () => {
    try {
      await AsyncStorage.removeItem(LANGUAGE_KEY);
      setStoredLanguage(null);
      Alert.alert(
        "Storage Cleared",
        "Language storage has been cleared. Restart the app to use device default.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to clear storage.");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>🚀 ULTIMATE RTL FIX</ThemedText>

      <ThemedView style={styles.statusSection}>
        <ThemedText style={styles.statusText}>
          Stored Language: {storedLanguage || "None"}
        </ThemedText>
        <ThemedText style={styles.statusText}>
          Current RTL: {currentRTL ? "✅ YES" : "❌ NO"}
        </ThemedText>
        <ThemedText style={styles.statusText}>
          Should be RTL: {storedLanguage === "ar" ? "✅ YES" : "❌ NO"}
        </ThemedText>
        <ThemedText style={styles.statusText}>
          Status:{" "}
          {storedLanguage === "ar" && currentRTL
            ? "✅ PERFECT"
            : "❌ NEEDS FIX"}
        </ThemedText>
      </ThemedView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.rtlButton]}
          onPress={forceRTLWithRestart}
        >
          <ThemedText style={styles.buttonText}>🚀 FORCE ARABIC RTL</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.ltrButton]}
          onPress={forceLTRWithRestart}
        >
          <ThemedText style={styles.buttonText}>
            🚀 FORCE ENGLISH LTR
          </ThemedText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.clearButton} onPress={clearAndRestart}>
        <ThemedText style={styles.clearButtonText}>
          Clear Storage & Restart
        </ThemedText>
      </TouchableOpacity>

      <ThemedView style={styles.instructions}>
        <ThemedText style={styles.instructionTitle}>
          📋 CRITICAL INSTRUCTIONS:
        </ThemedText>
        <ThemedText style={styles.instructionText}>
          1. Click "FORCE ARABIC RTL" button
        </ThemedText>
        <ThemedText style={styles.instructionText}>
          2. Close the app COMPLETELY (swipe up and close)
        </ThemedText>
        <ThemedText style={styles.instructionText}>
          3. Reopen the app
        </ThemedText>
        <ThemedText style={styles.instructionText}>
          4. All text should now be right-aligned
        </ThemedText>
        <ThemedText style={styles.instructionText}>
          5. Icons should appear on the right side
        </ThemedText>
      </ThemedView>

      {storedLanguage === "ar" && !currentRTL && (
        <ThemedView style={styles.warningSection}>
          <ThemedText style={styles.warningText}>
            ⚠️ RTL MISMATCH DETECTED!
          </ThemedText>
          <ThemedText style={styles.warningText}>
            Arabic is selected but RTL is not active.
          </ThemedText>
          <ThemedText style={styles.warningText}>
            Click "FORCE ARABIC RTL" and restart the app.
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#FF1744",
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 3,
    borderColor: "#D50000",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "white",
  },
  statusSection: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: "monospace",
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "column",
    marginBottom: 16,
  },
  button: {
    paddingVertical: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  rtlButton: {
    backgroundColor: "#D32F2F",
  },
  ltrButton: {
    backgroundColor: "#1976D2",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  clearButton: {
    backgroundColor: "#FF9800",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  clearButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  instructions: {
    backgroundColor: "#E8F5E8",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 6,
    borderLeftColor: "#4CAF50",
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2E7D32",
  },
  instructionText: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "600",
    color: "#2E7D32",
  },
  warningSection: {
    backgroundColor: "#FFF3E0",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 6,
    borderLeftColor: "#FF9800",
    marginTop: 16,
  },
  warningText: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "bold",
    color: "#E65100",
  },
});
