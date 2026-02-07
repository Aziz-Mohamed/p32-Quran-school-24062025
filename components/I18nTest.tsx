import { useRTLStyles } from "@/hooks/useRTLStyles";
import { useTranslation } from "@/hooks/useTranslation";
import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export const I18nTest: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isRTL, rtlStyles } = useRTLStyles();

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={[styles.title, rtlStyles.textDirection]}>
        🌐 i18n Test Component
      </ThemedText>

      <ThemedView style={styles.section}>
        <ThemedText style={[styles.label, rtlStyles.textDirection]}>
          Current Language: {i18n.language}
        </ThemedText>
        <ThemedText style={[styles.label, rtlStyles.textDirection]}>
          RTL Mode: {isRTL ? "Yes" : "No"}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={[styles.subtitle, rtlStyles.textDirection]}>
          Translation Examples:
        </ThemedText>

        <ThemedText style={[styles.text, rtlStyles.textDirection]}>
          {t("home.welcome")}
        </ThemedText>
        <ThemedText style={[styles.text, rtlStyles.textDirection]}>
          {t("common.loading")}
        </ThemedText>
        <ThemedText style={[styles.text, rtlStyles.textDirection]}>
          {t("settings.title")}
        </ThemedText>
        <ThemedText style={[styles.text, rtlStyles.textDirection]}>
          {t("auth.login")}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  section: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: "#666",
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
    color: "#333",
  },
});
