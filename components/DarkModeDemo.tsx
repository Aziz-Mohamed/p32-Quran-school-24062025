import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export function DarkModeDemo() {
  const surfaceColor = useThemeColor("surface");
  const primaryColor = useThemeColor("primary");
  const textSecondary = useThemeColor("textSecondary");
  const borderColor = useThemeColor("border");

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Dark Mode Demo
      </ThemedText>

      <View
        style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}
      >
        <ThemedText type="subtitle" style={styles.cardTitle}>
          Welcome to Dark Mode!
        </ThemedText>
        <ThemedText style={[styles.description, { color: textSecondary }]}>
          This component automatically adapts to your device's theme settings.
          Try switching between light and dark mode in your device settings.
        </ThemedText>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={() => console.log("Button pressed!")}
        >
          <ThemedText style={styles.buttonText}>Themed Button</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.colorPalette}>
        <ThemedText type="subtitle" style={styles.paletteTitle}>
          Color Palette Preview:
        </ThemedText>
        <View style={styles.colorRow}>
          <View
            style={[
              styles.colorSwatch,
              { backgroundColor: useThemeColor("primary") },
            ]}
          />
          <ThemedText>Primary</ThemedText>
        </View>
        <View style={styles.colorRow}>
          <View
            style={[
              styles.colorSwatch,
              { backgroundColor: useThemeColor("secondary") },
            ]}
          />
          <ThemedText>Secondary</ThemedText>
        </View>
        <View style={styles.colorRow}>
          <View
            style={[
              styles.colorSwatch,
              { backgroundColor: useThemeColor("accent") },
            ]}
          />
          <ThemedText>Accent</ThemedText>
        </View>
        <View style={styles.colorRow}>
          <View
            style={[
              styles.colorSwatch,
              { backgroundColor: useThemeColor("success") },
            ]}
          />
          <ThemedText>Success</ThemedText>
        </View>
        <View style={styles.colorRow}>
          <View
            style={[
              styles.colorSwatch,
              { backgroundColor: useThemeColor("warning") },
            ]}
          />
          <ThemedText>Warning</ThemedText>
        </View>
        <View style={styles.colorRow}>
          <View
            style={[
              styles.colorSwatch,
              { backgroundColor: useThemeColor("error") },
            ]}
          />
          <ThemedText>Error</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  cardTitle: {
    marginBottom: 10,
  },
  description: {
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  colorPalette: {
    marginTop: 20,
  },
  paletteTitle: {
    marginBottom: 15,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 6,
    marginRight: 15,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
});
