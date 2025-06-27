import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Card from "@/components/ui/Card";
import { MetricDisplay } from "@/components/ui/MetricDisplay";
import { useThemeColor } from "@/hooks/useThemeColor";
import { normalize } from "@/utils/normalize";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock student data with simplified metrics and Islamic avatar
const mockStudent = {
  id: "1",
  name: "Ahmed Hassan",
  grade: "Grade 2",
  avatar: "👳‍♂️", // Man with kufi/taqiyah
  attendance: 85,
  recitingRate: 78,
  trophies: 3,
  parentName: "Mohammed Hassan",
  parentPhone: "+966 50 123 4567",
  parentEmail: "mohammed.hassan@email.com",
  address: "123 Al-Riyadh Street, Riyadh, Saudi Arabia",
  joinDate: "2024-01-15",
  achievements: [
    {
      id: "1",
      title: "First Lesson",
      description: "Completed first Quran lesson",
      date: "2024-01-20",
      icon: "🎯",
    },
    {
      id: "2",
      title: "Perfect Attendance",
      description: "Attended 10 sessions in a row",
      date: "2024-03-15",
      icon: "🏆",
    },
    {
      id: "3",
      title: "Fast Learner",
      description: "Completed 5 lessons ahead of schedule",
      date: "2024-05-10",
      icon: "⚡",
    },
  ],
};

export default function AdminStudentsDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const accentOrange = useThemeColor("accentOrange");
  const textSecondary = useThemeColor("textSecondary");

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/admin/students/edit?id=${id}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={normalize(24)}
              color={useThemeColor("textPrimary")}
            />
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.headerTitle}>
            Student Details
          </ThemedText>
          <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
            <Ionicons name="create" size={normalize(20)} color={accentOrange} />
          </TouchableOpacity>
        </ThemedView>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Section */}
          <Card style={styles.profileCard}>
            <ThemedView row style={styles.profileHeader}>
              <ThemedView style={styles.avatarContainer}>
                <ThemedText style={styles.avatar}>
                  {mockStudent.avatar}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.profileInfo}>
                <ThemedText type="title" style={styles.studentName}>
                  {mockStudent.name}
                </ThemedText>
                <ThemedText
                  type="subtitle"
                  style={[styles.studentDetails, { color: textSecondary }]}
                >
                  {mockStudent.grade}
                </ThemedText>
                <ThemedText
                  type="default"
                  style={[styles.joinDate, { color: textSecondary }]}
                >
                  Joined {mockStudent.joinDate}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </Card>

          {/* Metrics Display */}
          <MetricDisplay
            attendance={mockStudent.attendance}
            recitingRate={mockStudent.recitingRate}
            trophies={mockStudent.trophies}
          />

          {/* Contact Information */}
          <Card style={styles.section}>
            <ThemedView style={styles.sectionHeader}>
              <Ionicons
                name="people"
                size={normalize(20)}
                color={accentOrange}
              />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Contact Information
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.contactItem}>
              <Ionicons
                name="person"
                size={normalize(16)}
                color={textSecondary}
              />
              <ThemedText type="default" style={styles.contactText}>
                {mockStudent.parentName}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.contactItem}>
              <Ionicons
                name="call"
                size={normalize(16)}
                color={textSecondary}
              />
              <ThemedText type="default" style={styles.contactText}>
                {mockStudent.parentPhone}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.contactItem}>
              <Ionicons
                name="mail"
                size={normalize(16)}
                color={textSecondary}
              />
              <ThemedText type="default" style={styles.contactText}>
                {mockStudent.parentEmail}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.contactItem}>
              <Ionicons
                name="location"
                size={normalize(16)}
                color={textSecondary}
              />
              <ThemedText type="default" style={styles.contactText}>
                {mockStudent.address}
              </ThemedText>
            </ThemedView>
          </Card>

          {/* Trophy Cabinet */}
          <Card style={styles.section}>
            <ThemedView style={styles.sectionHeader}>
              <Ionicons
                name="trophy"
                size={normalize(20)}
                color={accentOrange}
              />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Trophy Cabinet
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.trophyGrid}>
              {mockStudent.achievements.map((achievement, index) => (
                <ThemedView key={achievement.id} style={styles.trophyItem}>
                  <ThemedView style={styles.trophyIcon}>
                    <ThemedText style={styles.trophyEmoji}>
                      {achievement.icon}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.trophyContent}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.trophyTitle}
                    >
                      {achievement.title}
                    </ThemedText>
                    <ThemedText
                      type="default"
                      style={[
                        styles.trophyDescription,
                        { color: textSecondary },
                      ]}
                    >
                      {achievement.description}
                    </ThemedText>
                    <ThemedText
                      type="default"
                      style={[styles.trophyDate, { color: textSecondary }]}
                    >
                      {achievement.date}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              ))}
            </ThemedView>
          </Card>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: normalize(20),
  },
  editButton: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: normalize(20),
    paddingBottom: normalize(40),
  },
  profileCard: {
    marginBottom: normalize(24),
  },
  profileHeader: {
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: normalize(16),
    width: normalize(64),
    height: normalize(64),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: normalize(32),
    backgroundColor: "rgba(255, 215, 0, 0.1)", // Light gold background
  },
  avatar: {
    fontSize: normalize(48),
    lineHeight: normalize(48),
    textAlign: "center",
    textAlignVertical: "center",
  },
  profileInfo: {
    flex: 1,
  },
  studentName: {
    marginBottom: normalize(4),
  },
  studentDetails: {
    marginBottom: normalize(4),
  },
  joinDate: {
    fontSize: normalize(14),
  },
  section: {
    marginBottom: normalize(24),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: normalize(20),
  },
  sectionTitle: {
    marginLeft: normalize(12),
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: normalize(12),
  },
  contactText: {
    marginLeft: normalize(12),
    flex: 1,
  },
  trophyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: normalize(12),
  },
  trophyItem: {
    width: "48%",
    backgroundColor: "rgba(255, 215, 0, 0.1)", // Gold tint background
    borderRadius: normalize(12),
    padding: normalize(12),
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)", // Gold border
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: normalize(4),
    elevation: 3,
  },
  trophyIcon: {
    width: "100%",
    height: normalize(80),
    borderRadius: normalize(8),
    backgroundColor: "rgba(255, 215, 0, 0.2)", // Gold background
    alignItems: "center",
    justifyContent: "center",
    marginBottom: normalize(8),
  },
  trophyEmoji: {
    fontSize: normalize(40),
  },
  trophyContent: {
    flex: 1,
  },
  trophyTitle: {
    marginBottom: normalize(4),
    textAlign: "center",
  },
  trophyDescription: {
    marginBottom: normalize(4),
    textAlign: "center",
    fontSize: normalize(12),
  },
  trophyDate: {
    fontSize: normalize(10),
    textAlign: "center",
    fontStyle: "italic",
  },
});
