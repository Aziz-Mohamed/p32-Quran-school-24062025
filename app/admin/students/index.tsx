import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SearchBar } from "@/components/ui/SearchBar";
import { StudentCard } from "@/components/ui/StudentCard";
import { useRTLStyles } from "@/hooks/useRTLStyles";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useTranslation } from "@/hooks/useTranslation";
import { normalize } from "@/utils/normalize";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock data for students with simplified metrics and Islamic avatars
const mockStudents = [
  {
    id: "1",
    name: "Ahmed Hassan",
    grade: "Grade 2",
    avatar: "🧕", // Islamic headscarf
    attendance: 85,
    recitingRate: 78,
    trophies: 3,
  },
  {
    id: "2",
    name: "Fatima Ali",
    grade: "Grade 1",
    avatar: "👳‍♀️", // Woman with hijab
    attendance: 92,
    recitingRate: 95,
    trophies: 5,
  },
  {
    id: "3",
    name: "Omar Khalil",
    grade: "Grade 3",
    avatar: "👳‍♂️", // Man with kufi/taqiyah
    attendance: 75,
    recitingRate: 82,
    trophies: 2,
  },
  {
    id: "4",
    name: "Aisha Rahman",
    grade: "Grade 2",
    avatar: "🧕", // Islamic headscarf
    attendance: 88,
    recitingRate: 90,
    trophies: 4,
  },
  {
    id: "5",
    name: "Yusuf Ibrahim",
    grade: "Grade 4",
    avatar: "👳‍♂️", // Man with kufi/taqiyah
    attendance: 95,
    recitingRate: 88,
    trophies: 6,
  },
];

export default function AdminStudentsIndex() {
  const router = useRouter();
  const { t } = useTranslation();
  const { rtlStyles } = useRTLStyles();
  const [searchQuery, setSearchQuery] = useState("");
  const accentOrange = useThemeColor("accentOrange");
  const textSecondary = useThemeColor("textSecondary");

  const filteredStudents = mockStudents.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStudent = () => {
    router.push("/admin/students/add" as any);
  };

  const handleStudentPress = (studentId: string) => {
    router.push(`/admin/students/${studentId}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Section */}
          <ThemedView style={styles.header}>
            <ThemedText
              type="title"
              style={[styles.title, rtlStyles.textDirection]}
            >
              {String(t("admin.students.title"))}
            </ThemedText>
            <ThemedText
              type="subtitle"
              style={[styles.subtitle, rtlStyles.textDirection]}
            >
              {String(t("admin.students.subtitle"))}
            </ThemedText>
          </ThemedView>

          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={String(t("admin.students.searchPlaceholder"))}
          />

          {/* Students List */}
          <ThemedView style={styles.studentsContainer}>
            {filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                id={student.id}
                name={student.name}
                grade={student.grade}
                avatar={student.avatar}
                attendance={student.attendance}
                recitingRate={student.recitingRate}
                trophies={student.trophies}
                onPress={handleStudentPress}
              />
            ))}
          </ThemedView>

          {/* Empty State */}
          {filteredStudents.length === 0 && (
            <ThemedView style={styles.emptyState}>
              <Ionicons
                name="school-outline"
                size={normalize(64)}
                color={textSecondary}
              />
              <ThemedText
                type="subtitle"
                style={[styles.emptyTitle, rtlStyles.textDirection]}
              >
                {searchQuery
                  ? String(t("common.noResults"))
                  : String(t("admin.students.noStudentsFound"))}
              </ThemedText>
              <ThemedText
                type="default"
                style={[styles.emptySubtitle, rtlStyles.textDirection]}
              >
                {searchQuery
                  ? String(t("common.tryAdjustingSearch"))
                  : String(t("admin.students.addFirstStudent"))}
              </ThemedText>
            </ThemedView>
          )}
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: accentOrange,
              ...rtlStyles.marginEnd(normalize(20)),
              ...rtlStyles.marginStart(normalize(20)),
            },
          ]}
          onPress={handleAddStudent}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={normalize(24)} color="#fff" />
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBlockEnd: normalize(100),
  },
  header: {
    paddingInline: normalize(20),
    paddingBlockStart: normalize(20),
    paddingBlockEnd: normalize(16),
  },
  title: {
    marginBlockEnd: normalize(4),
  },
  subtitle: {
    fontSize: normalize(16),
  },
  studentsContainer: {
    paddingInline: normalize(20),
    paddingBlockStart: normalize(16),
  },
  emptyState: {
    alignItems: "center",
    paddingBlock: normalize(60),
    paddingInline: normalize(40),
  },
  emptyTitle: {
    marginBlockStart: normalize(16),
    marginBlockEnd: normalize(8),
  },
  emptySubtitle: {
    textAlign: "center",
    lineHeight: normalize(24),
  },
  fab: {
    position: "absolute",
    bottom: normalize(100),
    insetInlineEnd: normalize(20),
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(28),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: normalize(12),
    elevation: 6,
  },
});
