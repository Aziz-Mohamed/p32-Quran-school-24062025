import { I18nTest } from "@/components/I18nTest";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRTLStyles } from "@/hooks/useRTLStyles";
import { useTranslation } from "@/hooks/useTranslation";
import { normalize } from "@/utils/normalize";
import { router } from "expo-router";
import React from "react";
import {
  I18nManager,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const { isRTL, rtlStyles } = useRTLStyles();

  const navigationButtons = [
    {
      title: t("navigation.student"),
      route: "/student" as const,
      icon: "👨‍🎓",
    },
    {
      title: t("navigation.teacher"),
      route: "/teacher" as const,
      icon: "👨‍🏫",
    },
    {
      title: t("navigation.parent"),
      route: "/parent" as const,
      icon: "👨‍👩‍👧‍👦",
    },
    {
      title: t("navigation.admin"),
      route: "/admin" as const,
      icon: "⚙️",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={[styles.title, rtlStyles.textDirection]}>
          {String(t("home.title"))}
        </ThemedText>
        <ThemedText style={[styles.subtitle, rtlStyles.textDirection]}>
          {String(t("home.subtitle"))}
        </ThemedText>
      </ThemedView>

      {/* Navigation Buttons Section */}
      <ThemedView style={styles.section}>
        <ThemedText style={[styles.sectionTitle, rtlStyles.textDirection]}>
          {String(t("home.selectRole"))}
        </ThemedText>
        <ThemedView style={styles.navigationGrid}>
          {navigationButtons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.navButton,
                rtlStyles.marginEnd(index % 2 === 0 ? 12 : 0),
              ]}
              onPress={() => router.push(button.route)}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.navIcon}>{button.icon}</ThemedText>
              <ThemedText
                style={[styles.navButtonText, rtlStyles.textDirection]}
              >
                {String(button.title)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={[styles.sectionTitle, rtlStyles.textDirection]}>
          Current Status
        </ThemedText>
        <ThemedText style={[styles.text, rtlStyles.textDirection]}>
          Language: {i18n.language}
        </ThemedText>
        <ThemedText style={[styles.text, rtlStyles.textDirection]}>
          RTL Mode: {isRTL ? "Yes" : "No"}
        </ThemedText>
        <ThemedText style={[styles.text, rtlStyles.textDirection]}>
          I18nManager.isRTL: {I18nManager.isRTL ? "Yes" : "No"}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={[styles.sectionTitle, rtlStyles.textDirection]}>
          Language Settings
        </ThemedText>
        <LanguageSwitcher />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={[styles.sectionTitle, rtlStyles.textDirection]}>
          Translation Test
        </ThemedText>
        <I18nTest />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={[styles.sectionTitle, rtlStyles.textDirection]}>
          RTL Test Text
        </ThemedText>
        <ThemedText style={[styles.rtlTest, rtlStyles.textDirection]}>
          هذا نص تجريبي للاختبار من اليمين إلى اليسار
        </ThemedText>
        <ThemedText style={[styles.rtlTest, rtlStyles.textDirection]}>
          This is test text from left to right
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF7",
  },
  header: {
    padding: normalize(24),
    paddingTop: normalize(60),
    alignItems: "center",
  },
  title: {
    fontSize: normalize(32),
    fontWeight: "700",
    marginBottom: normalize(8),
    textAlign: "center",
  },
  subtitle: {
    fontSize: normalize(18),
    color: "#666",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: normalize(24),
    marginBottom: normalize(24),
  },
  sectionTitle: {
    fontSize: normalize(20),
    fontWeight: "600",
    marginBottom: normalize(16),
    color: "#333",
  },
  navigationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  navButton: {
    width: "48%",
    backgroundColor: "#fff",
    padding: normalize(20),
    borderRadius: normalize(16),
    alignItems: "center",
    marginBottom: normalize(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: normalize(4) },
    shadowOpacity: 0.08,
    shadowRadius: normalize(12),
    elevation: 2,
  },
  navIcon: {
    fontSize: normalize(32),
    marginBottom: normalize(8),
  },
  navButtonText: {
    fontSize: normalize(16),
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  text: {
    fontSize: normalize(16),
    marginBottom: normalize(8),
    color: "#333",
  },
  rtlTest: {
    fontSize: normalize(16),
    marginBottom: normalize(8),
    color: "#333",
    fontWeight: "500",
  },
});
