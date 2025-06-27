import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SearchBar } from "@/components/ui/SearchBar";
import { StudentCard } from "@/components/ui/StudentCard";
import { useRTLStyles } from "@/hooks/useRTLStyles";
import { useThemeColor } from "@/hooks/useThemeColor";
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
              Students
            </ThemedText>
            <ThemedText
              type="subtitle"
              style={[styles.subtitle, rtlStyles.textDirection]}
            >
              Manage your students and track their progress
            </ThemedText>
          </ThemedView>

          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search students..."
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
                No students found
              </ThemedText>
              <ThemedText
                type="default"
                style={[styles.emptySubtitle, rtlStyles.textDirection]}
              >
                {searchQuery
                  ? "Try adjusting your search"
                  : "Add your first student to get started"}
              </ThemedText>
            </ThemedView>
          )}
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: accentOrange }]}
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
    paddingBottom: normalize(100),
  },
  header: {
    paddingHorizontal: normalize(20),
    paddingTop: normalize(20),
    paddingBottom: normalize(16),
  },
  title: {
    marginBottom: normalize(4),
  },
  subtitle: {
    fontSize: normalize(16),
  },
  studentsContainer: {
    paddingHorizontal: normalize(20),
    paddingTop: normalize(16),
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: normalize(60),
    paddingHorizontal: normalize(40),
  },
  emptyTitle: {
    marginTop: normalize(16),
    marginBottom: normalize(8),
  },
  emptySubtitle: {
    textAlign: "center",
    lineHeight: normalize(24),
  },
  fab: {
    position: "absolute",
    bottom: normalize(100),
    right: normalize(20),
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
