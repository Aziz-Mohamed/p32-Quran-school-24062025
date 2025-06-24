import { forceRTLReload } from "@/hooks/useRTL";
import React from "react";
import { Alert, I18nManager, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export const ForceRTLButton: React.FC = () => {
  const currentRTL = I18nManager.isRTL;

  const forceRTL = async () => {
    Alert.alert(
      "Force RTL Mode",
      `This will force the app into ${
        currentRTL ? "LTR" : "RTL"
      } mode for testing. The app will reload.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Force RTL",
          onPress: async () => {
            await forceRTLReload(!currentRTL);
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Force RTL Mode</ThemedText>

      <ThemedText style={styles.description}>
        Current RTL State:{" "}
        {currentRTL ? "RTL (Right-to-Left)" : "LTR (Left-to-Right)"}
      </ThemedText>

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: currentRTL ? "#34C759" : "#007AFF" },
        ]}
        onPress={forceRTL}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.buttonText}>
          Force {currentRTL ? "LTR" : "RTL"} Mode
        </ThemedText>
      </TouchableOpacity>

      <ThemedText style={styles.note}>
        This button forces RTL/LTR mode regardless of language. Use this to test
        RTL functionality.
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#E8F5E8",
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.8,
    textAlign: "center",
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  note: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: "italic",
    textAlign: "center",
  },
});
