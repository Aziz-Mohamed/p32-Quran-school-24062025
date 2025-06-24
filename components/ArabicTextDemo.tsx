import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export const ArabicTextDemo: React.FC = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>
        Arabic Text Demo (Forced Right Alignment)
      </ThemedText>

      <ThemedView style={styles.arabicSection}>
        <ThemedText style={styles.arabicTitle}>
          مرحباً بك في مدرسة القرآن
        </ThemedText>
        <ThemedText style={styles.arabicText}>
          هذا تطبيق لتعلم القرآن الكريم
        </ThemedText>
        <ThemedText style={styles.arabicText}>
          يمكنك تعلم القراءة والحفظ
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.mixedSection}>
        <ThemedText style={styles.mixedTitle}>
          Mixed Content (English + Arabic)
        </ThemedText>
        <ThemedText style={styles.mixedText}>Welcome - مرحباً بك</ThemedText>
        <ThemedText style={styles.mixedText}>
          Quran School - مدرسة القرآن
        </ThemedText>
        <ThemedText style={styles.mixedText}>
          Learn Arabic - تعلم العربية
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.rtlLayoutSection}>
        <ThemedText style={styles.sectionTitle}>RTL Layout Example</ThemedText>

        {/* Icon + Text in RTL */}
        <View style={styles.rtlRow}>
          <View style={styles.icon}>
            <ThemedText style={styles.iconText}>📖</ThemedText>
          </View>
          <ThemedText style={styles.rtlText}>اقرأ القرآن الكريم</ThemedText>
        </View>

        <View style={styles.rtlRow}>
          <View style={styles.icon}>
            <ThemedText style={styles.iconText}>🎯</ThemedText>
          </View>
          <ThemedText style={styles.rtlText}>احفظ الآيات</ThemedText>
        </View>

        <View style={styles.rtlRow}>
          <View style={styles.icon}>
            <ThemedText style={styles.iconText}>📚</ThemedText>
          </View>
          <ThemedText style={styles.rtlText}>تعلم التفسير</ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.note}>
        <ThemedText style={styles.noteText}>
          💡 This shows how Arabic text should look with proper RTL layout.
        </ThemedText>
        <ThemedText style={styles.noteText}>
          Text is right-aligned, icons appear on the right side.
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#1976D2",
  },
  arabicSection: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  arabicTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 12,
    color: "#2E7D32",
  },
  arabicText: {
    fontSize: 16,
    textAlign: "right",
    marginBottom: 8,
    lineHeight: 24,
  },
  mixedSection: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  mixedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#1976D2",
  },
  mixedText: {
    fontSize: 16,
    textAlign: "right",
    marginBottom: 8,
    lineHeight: 24,
  },
  rtlLayoutSection: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#1976D2",
  },
  rtlRow: {
    flexDirection: "row-reverse", // Force RTL layout
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 8,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF9800",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12, // This becomes right margin in RTL
  },
  iconText: {
    fontSize: 16,
  },
  rtlText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
  },
  note: {
    backgroundColor: "#E8F5E8",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  noteText: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "500",
    color: "#2E7D32",
  },
});
