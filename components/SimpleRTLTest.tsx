import { useTranslation } from "@/hooks/useTranslation";
import React from "react";
import { I18nManager, StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export const SimpleRTLTest: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = I18nManager.isRTL;

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Simple RTL Test</ThemedText>

      {/* Test 1: Basic text alignment */}
      <ThemedView style={styles.testBox}>
        <ThemedText
          style={[styles.testText, { textAlign: isRTL ? "right" : "left" }]}
        >
          {t("home.welcome")}
        </ThemedText>
      </ThemedView>

      {/* Test 2: Row with icon and text */}
      <View
        style={[styles.row, { flexDirection: isRTL ? "row-reverse" : "row" }]}
      >
        <View style={styles.icon}>
          <ThemedText style={styles.iconText}>📱</ThemedText>
        </View>
        <ThemedText style={styles.rowText}>{t("home.title")}</ThemedText>
      </View>

      {/* Test 3: Margins */}
      <View
        style={[
          styles.marginBox,
          { marginLeft: isRTL ? 0 : 20, marginRight: isRTL ? 20 : 0 },
        ]}
      >
        <ThemedText style={styles.marginText}>Margin Test</ThemedText>
      </View>

      {/* Test 4: Status display */}
      <ThemedView style={styles.statusBox}>
        <ThemedText style={styles.statusText}>
          Language: {i18n.language}
        </ThemedText>
        <ThemedText style={styles.statusText}>
          RTL Active: {isRTL ? "✅ YES" : "❌ NO"}
        </ThemedText>
        <ThemedText style={styles.statusText}>
          Layout: {isRTL ? "Right-to-Left" : "Left-to-Right"}
        </ThemedText>
      </ThemedView>

      {/* Test 5: Arabic text */}
      {i18n.language === "ar" && (
        <ThemedView style={styles.arabicBox}>
          <ThemedText style={[styles.arabicText, { textAlign: "right" }]}>
            مرحباً بك في مدرسة القرآن
          </ThemedText>
          <ThemedText style={[styles.arabicText, { textAlign: "right" }]}>
            هذا نص تجريبي باللغة العربية
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  testBox: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  testText: {
    fontSize: 16,
    fontWeight: "500",
  },
  row: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
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
  marginBox: {
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  marginText: {
    fontSize: 14,
    fontWeight: "500",
  },
  statusBox: {
    backgroundColor: "#E8F5E8",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: "monospace",
  },
  arabicBox: {
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF9800",
  },
  arabicText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
});
