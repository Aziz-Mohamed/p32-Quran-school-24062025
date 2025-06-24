import { useRTLStyles } from "@/hooks/useRTLStyles";
import { useTranslation } from "@/hooks/useTranslation";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export const RTLExample: React.FC = () => {
  const { rtlStyles } = useRTLStyles();
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container}>
      <ThemedText
        type="subtitle"
        style={[styles.sectionTitle, rtlStyles.textDirection]}
      >
        RTL Layout Examples
      </ThemedText>

      {/* Example 1: RTL-aware row layout */}
      <ThemedView style={styles.section}>
        <ThemedText style={[styles.exampleTitle, rtlStyles.textDirection]}>
          Row Layout (Icon + Text)
        </ThemedText>
        <View style={[styles.rowExample, rtlStyles.row]}>
          <View style={styles.icon}>
            <ThemedText style={styles.iconText}>📱</ThemedText>
          </View>
          <ThemedText style={[styles.rowText, rtlStyles.textDirection]}>
            {t("home.title")}
          </ThemedText>
        </View>
      </ThemedView>

      {/* Example 2: RTL-aware margins */}
      <ThemedView style={styles.section}>
        <ThemedText style={[styles.exampleTitle, rtlStyles.textDirection]}>
          Margin Start/End
        </ThemedText>
        <View style={[styles.marginExample, rtlStyles.marginStart(16)]}>
          <ThemedText style={[styles.marginText, rtlStyles.textDirection]}>
            {t("common.loading")}
          </ThemedText>
        </View>
        <View style={[styles.marginExample, rtlStyles.marginEnd(16)]}>
          <ThemedText style={[styles.marginText, rtlStyles.textDirection]}>
            {t("common.error")}
          </ThemedText>
        </View>
      </ThemedView>

      {/* Example 3: RTL-aware padding */}
      <ThemedView style={styles.section}>
        <ThemedText style={[styles.exampleTitle, rtlStyles.textDirection]}>
          Padding Start/End
        </ThemedText>
        <View style={[styles.paddingExample, rtlStyles.paddingStart(20)]}>
          <ThemedText style={[styles.paddingText, rtlStyles.textDirection]}>
            {t("lessons.title")}
          </ThemedText>
        </View>
        <View style={[styles.paddingExample, rtlStyles.paddingEnd(20)]}>
          <ThemedText style={[styles.paddingText, rtlStyles.textDirection]}>
            {t("settings.title")}
          </ThemedText>
        </View>
      </ThemedView>

      {/* Example 4: RTL-aware borders */}
      <ThemedView style={styles.section}>
        <ThemedText style={[styles.exampleTitle, rtlStyles.textDirection]}>
          Border Start/End
        </ThemedText>
        <View
          style={[styles.borderExample, rtlStyles.borderStart(3, "#007AFF")]}
        >
          <ThemedText style={[styles.borderText, rtlStyles.textDirection]}>
            {t("auth.login")}
          </ThemedText>
        </View>
        <View style={[styles.borderExample, rtlStyles.borderEnd(3, "#34C759")]}>
          <ThemedText style={[styles.borderText, rtlStyles.textDirection]}>
            {t("auth.register")}
          </ThemedText>
        </View>
      </ThemedView>

      {/* Example 5: Mixed content */}
      <ThemedView style={styles.section}>
        <ThemedText style={[styles.exampleTitle, rtlStyles.textDirection]}>
          Mixed Content (LTR + RTL)
        </ThemedText>
        <View style={[styles.mixedExample, rtlStyles.row]}>
          <ThemedText style={[styles.mixedText, rtlStyles.textDirection]}>
            {t("home.welcome")} - مرحباً بك
          </ThemedText>
        </View>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: "600",
  },
  section: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    borderRadius: 8,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    opacity: 0.8,
  },
  rowExample: {
    alignItems: "center",
    paddingVertical: 8,
  },
  icon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  iconText: {
    fontSize: 16,
  },
  rowText: {
    fontSize: 16,
    fontWeight: "500",
  },
  marginExample: {
    backgroundColor: "#E5F3FF",
    padding: 8,
    marginVertical: 4,
    borderRadius: 4,
  },
  marginText: {
    fontSize: 14,
  },
  paddingExample: {
    backgroundColor: "#F0F8FF",
    paddingVertical: 8,
    marginVertical: 4,
    borderRadius: 4,
  },
  paddingText: {
    fontSize: 14,
  },
  borderExample: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 4,
    backgroundColor: "#F8F9FA",
  },
  borderText: {
    fontSize: 14,
    fontWeight: "500",
  },
  mixedExample: {
    padding: 12,
    backgroundColor: "#FFF3E0",
    borderRadius: 4,
  },
  mixedText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
