import { checkAndFixRTL } from "@/hooks/useRTL";
import { useTranslation } from "@/hooks/useTranslation";
import React, { useEffect } from "react";
import { Alert, I18nManager, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export const RTLEnforcer: React.FC = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Check and fix RTL on component mount
    const currentLanguage = i18n.language;
    const wasRTLChanged = checkAndFixRTL(currentLanguage);

    if (wasRTLChanged) {
      console.log("RTL was changed, app needs to reload");
      Alert.alert(
        "RTL Layout Change",
        "The app layout has been changed to support Arabic. Please restart the app to see the changes.",
        [
          {
            text: "OK",
            onPress: () => {
              // In a real app, you might want to reload here
              console.log("User acknowledged RTL change");
            },
          },
        ]
      );
    }
  }, [i18n.language]);

  const currentLanguage = i18n.language;
  const isRTL = I18nManager.isRTL;
  const shouldBeRTL = currentLanguage === "ar";

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>RTL Status Checker</ThemedText>

      <ThemedView style={styles.statusSection}>
        <ThemedText style={styles.statusText}>
          Current Language: {currentLanguage}
        </ThemedText>
        <ThemedText style={styles.statusText}>
          Should be RTL: {shouldBeRTL ? "Yes" : "No"}
        </ThemedText>
        <ThemedText style={styles.statusText}>
          Currently RTL: {isRTL ? "Yes" : "No"}
        </ThemedText>
        <ThemedText style={styles.statusText}>
          Status: {shouldBeRTL === isRTL ? "✅ Correct" : "❌ Mismatch"}
        </ThemedText>
      </ThemedView>

      {shouldBeRTL !== isRTL && (
        <ThemedView style={styles.warningSection}>
          <ThemedText style={styles.warningText}>
            ⚠️ RTL mismatch detected! The app needs to be restarted to apply the
            correct layout.
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#FFF8E1",
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  statusSection: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: "monospace",
  },
  warningSection: {
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  warningText: {
    fontSize: 14,
    color: "#D32F2F",
    fontWeight: "500",
  },
});
