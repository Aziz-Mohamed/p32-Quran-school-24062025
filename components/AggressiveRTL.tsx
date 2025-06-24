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

export const AggressiveRTL: React.FC = () => {
  const [currentRTL, setCurrentRTL] = useState(I18nManager.isRTL);
  const [storedLanguage, setStoredLanguage] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
        setStoredLanguage(lang);
        setCurrentRTL(I18nManager.isRTL);
      } catch (error) {
        console.log("Error checking status:", error);
      }
    };

    checkStatus();

    // Check every second
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const forceRTL = async () => {
    try {
      // Store Arabic language
      await AsyncStorage.setItem(LANGUAGE_KEY, "ar");
      setStoredLanguage("ar");

      // Force RTL
      I18nManager.forceRTL(true);
      setCurrentRTL(true);

      Alert.alert(
        "RTL Forced!",
        "RTL mode has been activated. Please completely close and restart the app to see the changes.",
        [
          {
            text: "OK",
            onPress: () => {
              // Force app restart by showing another alert
              Alert.alert(
                "Restart Required",
                "Please close the app completely and reopen it to see RTL layout.",
                [{ text: "OK" }]
              );
            },
          },
        ]
      );
    } catch (error) {
      console.log("Error forcing RTL:", error);
      Alert.alert("Error", "Failed to force RTL mode.");
    }
  };

  const forceLTR = async () => {
    try {
      // Store English language
      await AsyncStorage.setItem(LANGUAGE_KEY, "en");
      setStoredLanguage("en");

      // Force LTR
      I18nManager.forceRTL(false);
      setCurrentRTL(false);

      Alert.alert(
        "LTR Forced!",
        "LTR mode has been activated. Please completely close and restart the app to see the changes.",
        [
          {
            text: "OK",
            onPress: () => {
              Alert.alert(
                "Restart Required",
                "Please close the app completely and reopen it to see LTR layout.",
                [{ text: "OK" }]
              );
            },
          },
        ]
      );
    } catch (error) {
      console.log("Error forcing LTR:", error);
      Alert.alert("Error", "Failed to force LTR mode.");
    }
  };

  const clearStorage = async () => {
    try {
      await AsyncStorage.removeItem(LANGUAGE_KEY);
      setStoredLanguage(null);
      Alert.alert("Success", "Language storage cleared. Restart the app.");
    } catch (error) {
      Alert.alert("Error", "Failed to clear storage.");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>🔥 Aggressive RTL Control</ThemedText>

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
      </ThemedView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.rtlButton]}
          onPress={forceRTL}
        >
          <ThemedText style={styles.buttonText}>🔥 FORCE RTL</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.ltrButton]}
          onPress={forceLTR}
        >
          <ThemedText style={styles.buttonText}>🔥 FORCE LTR</ThemedText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.clearButton} onPress={clearStorage}>
        <ThemedText style={styles.clearButtonText}>
          Clear Language Storage
        </ThemedText>
      </TouchableOpacity>

      <ThemedView style={styles.instructions}>
        <ThemedText style={styles.instructionText}>📋 Instructions:</ThemedText>
        <ThemedText style={styles.instructionText}>
          1. Click "FORCE RTL" to enable Arabic layout
        </ThemedText>
        <ThemedText style={styles.instructionText}>
          2. Close the app completely (swipe up and close)
        </ThemedText>
        <ThemedText style={styles.instructionText}>
          3. Reopen the app
        </ThemedText>
        <ThemedText style={styles.instructionText}>
          4. Text should now be right-aligned
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: "#F44336",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#D32F2F",
  },
  statusSection: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: "monospace",
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  rtlButton: {
    backgroundColor: "#D32F2F",
  },
  ltrButton: {
    backgroundColor: "#1976D2",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  clearButton: {
    backgroundColor: "#FF9800",
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
  instructions: {
    backgroundColor: "#E8F5E8",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  instructionText: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "500",
  },
});
