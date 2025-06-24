import { forceRTLReload } from "@/hooks/useRTL";
import { useRTLStyles } from "@/hooks/useRTLStyles";
import React from "react";
import { Alert, I18nManager, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export const ManualRTLToggle: React.FC = () => {
  const { rtlStyles, isRTL } = useRTLStyles();

  const toggleRTL = async () => {
    const newRTLState = !I18nManager.isRTL;

    Alert.alert(
      "Manual RTL Toggle",
      `Switch to ${
        newRTLState ? "RTL" : "LTR"
      } layout? This will reload the app.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Switch",
          onPress: async () => {
            await forceRTLReload(newRTLState);
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={[styles.title, rtlStyles.textDirection]}>
        Manual RTL Toggle
      </ThemedText>

      <ThemedText style={[styles.description, rtlStyles.textDirection]}>
        Current RTL State:{" "}
        {isRTL ? "RTL (Right-to-Left)" : "LTR (Left-to-Right)"}
      </ThemedText>

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isRTL ? "#34C759" : "#007AFF" },
        ]}
        onPress={toggleRTL}
        activeOpacity={0.7}
      >
        <ThemedText style={[styles.buttonText, rtlStyles.textDirection]}>
          Switch to {isRTL ? "LTR" : "RTL"}
        </ThemedText>
      </TouchableOpacity>

      <ThemedText style={[styles.note, rtlStyles.textDirection]}>
        Note: This manually toggles RTL regardless of language. Use this for
        testing RTL functionality.
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.8,
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
  },
});
