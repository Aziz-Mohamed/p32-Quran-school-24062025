import { useRTLStyles } from "@/hooks/useRTLStyles";
import { useTranslation } from "@/hooks/useTranslation";
import React from "react";
import { StyleSheet } from "react-native";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export const I18nExample: React.FC = () => {
  const { t } = useTranslation();
  const { rtlStyles } = useRTLStyles();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={[styles.title, rtlStyles.textDirection]}>
        {t("home.welcome")}
      </ThemedText>

      <ThemedText style={[styles.subtitle, rtlStyles.textDirection]}>
        {t("home.subtitle")}
      </ThemedText>

      <ThemedView style={styles.section}>
        <ThemedText
          type="subtitle"
          style={[styles.sectionTitle, rtlStyles.textDirection]}
        >
          {t("settings.title")}
        </ThemedText>
        <LanguageSwitcher />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText
          type="subtitle"
          style={[styles.sectionTitle, rtlStyles.textDirection]}
        >
          {t("lessons.title")}
        </ThemedText>
        <ThemedText style={[styles.text, rtlStyles.textDirection]}>
          {t("lessons.noLessons")}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText
          type="subtitle"
          style={[styles.sectionTitle, rtlStyles.textDirection]}
        >
          {t("common.loading")}
        </ThemedText>
        <ThemedText style={[styles.text, rtlStyles.textDirection]}>
          {t("common.error")} - {t("common.retry")}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.8,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  sectionTitle: {
    marginBottom: 12,
  },
  text: {
    lineHeight: 20,
  },
});
