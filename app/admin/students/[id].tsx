import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Card from "@/components/ui/Card";
import { MetricDisplay } from "@/components/ui/MetricDisplay";
import { useRTLStyles } from "@/hooks/useRTLStyles";
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
  const { rtlStyles } = useRTLStyles();
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
        <ThemedView style={[styles.header, rtlStyles.row]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={normalize(24)}
              color={useThemeColor("textPrimary")}
            />
          </TouchableOpacity>
          <ThemedText
            type="subtitle"
            style={[styles.headerTitle, rtlStyles.textDirection]}
          >
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
            <ThemedView style={[styles.profileHeader, rtlStyles.row]}>
              <ThemedView style={styles.avatarContainer}>
                <ThemedText style={styles.avatar}>
                  {mockStudent.avatar}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.profileInfo}>
                <ThemedText
                  type="title"
                  style={[styles.studentName, rtlStyles.textDirection]}
                >
                  {mockStudent.name}
                </ThemedText>
                <ThemedText
                  type="subtitle"
                  style={[
                    styles.studentDetails,
                    { color: textSecondary },
                    rtlStyles.textDirection,
                  ]}
                >
                  {mockStudent.grade}
                </ThemedText>
                <ThemedText
                  type="default"
                  style={[
                    styles.joinDate,
                    { color: textSecondary },
                    rtlStyles.textDirection,
                  ]}
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
            <ThemedView style={[styles.sectionHeader, rtlStyles.row]}>
              <Ionicons
                name="people"
                size={normalize(20)}
                color={accentOrange}
              />
              <ThemedText
                type="subtitle"
                style={[styles.sectionTitle, rtlStyles.textDirection]}
              >
                Contact Information
              </ThemedText>
            </ThemedView>

            <ThemedView style={[styles.contactItem, rtlStyles.row]}>
              <Ionicons
                name="person"
                size={normalize(16)}
                color={textSecondary}
              />
              <ThemedText
                type="default"
                style={[styles.contactText, rtlStyles.textDirection]}
              >
                {mockStudent.parentName}
              </ThemedText>
            </ThemedView>

            <ThemedView style={[styles.contactItem, rtlStyles.row]}>
              <Ionicons
                name="call"
                size={normalize(16)}
                color={textSecondary}
              />
              <ThemedText
                type="default"
                style={[styles.contactText, rtlStyles.textDirection]}
              >
                {mockStudent.parentPhone}
              </ThemedText>
            </ThemedView>

            <ThemedView style={[styles.contactItem, rtlStyles.row]}>
              <Ionicons
                name="mail"
                size={normalize(16)}
                color={textSecondary}
              />
              <ThemedText
                type="default"
                style={[styles.contactText, rtlStyles.textDirection]}
              >
                {mockStudent.parentEmail}
              </ThemedText>
            </ThemedView>

            <ThemedView style={[styles.contactItem, rtlStyles.row]}>
              <Ionicons
                name="location"
                size={normalize(16)}
                color={textSecondary}
              />
              <ThemedText
                type="default"
                style={[styles.contactText, rtlStyles.textDirection]}
              >
                {mockStudent.address}
              </ThemedText>
            </ThemedView>
          </Card>

          {/* Champion Trophy Cabinet Heading */}
          <ThemedView style={styles.championHeadingContainer}>
            <ThemedText
              type="title"
              style={[styles.championHeading, rtlStyles.textDirection]}
            >
              🏆 You&apos;re a Champion!
            </ThemedText>
            <ThemedText
              type="subtitle"
              style={[styles.championSub, rtlStyles.textDirection]}
            >
              Your Trophy Cabinet
            </ThemedText>
          </ThemedView>

          {/* Portrait Trophy Cabinet - Vertical, Centered, Glowing Trophies */}
          <ThemedView style={styles.portraitCabinetContainer}>
            {mockStudent.achievements.map((achievement, index) => (
              <ThemedView
                key={achievement.id}
                style={styles.portraitTrophyItem}
              >
                <ThemedView style={styles.portraitTrophyIconGlow}>
                  <ThemedText style={styles.portraitTrophyIcon}>
                    {achievement.icon}
                  </ThemedText>
                </ThemedView>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.portraitTrophyTitle, rtlStyles.textDirection]}
                >
                  {achievement.title}
                </ThemedText>
                <ThemedText
                  type="default"
                  style={[
                    styles.portraitTrophyDescription,
                    rtlStyles.textDirection,
                  ]}
                >
                  {achievement.description}
                </ThemedText>
                <ThemedView style={[styles.trophyDateContainer, rtlStyles.row]}>
                  <Ionicons name="calendar" size={normalize(12)} color="#999" />
                  <ThemedText
                    type="subtitle"
                    style={[styles.trophyDate, rtlStyles.textDirection]}
                  >
                    {achievement.date}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            ))}
          </ThemedView>

          {/* Shelf Bar */}
          <ThemedView style={styles.shelfBar} />
          {/* Hanging Medal */}
          <ThemedView style={styles.medalContainer}>
            <ThemedText style={styles.medalRibbon}>🎗️</ThemedText>
            <ThemedText style={styles.medalIcon}>🥇</ThemedText>
          </ThemedView>
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
    alignItems: "center",
    paddingHorizontal: normalize(20),
    paddingTop: normalize(20),
    paddingBottom: normalize(16),
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  editButton: {
    width: normalize(40),
    height: normalize(40),
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: normalize(20),
    paddingBottom: normalize(100),
  },
  profileCard: {
    marginBottom: normalize(20),
  },
  profileHeader: {
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: normalize(16),
    width: normalize(80),
    height: normalize(80),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: normalize(40),
    backgroundColor: "rgba(255, 215, 0, 0.1)",
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
    marginBottom: normalize(20),
  },
  sectionHeader: {
    alignItems: "center",
    marginBottom: normalize(16),
  },
  sectionTitle: {
    marginLeft: normalize(12),
  },
  contactItem: {
    alignItems: "center",
    marginBottom: normalize(12),
  },
  contactText: {
    marginLeft: normalize(8),
    flex: 1,
  },
  trophyGrid: {
    gap: normalize(16),
  },
  trophyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: normalize(16),
    backgroundColor: "rgba(255, 215, 0, 0.08)",
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.2)",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: normalize(8),
    elevation: 3,
  },
  trophyIconContainer: {
    position: "relative",
    marginRight: normalize(16),
  },
  trophyIcon: {
    width: normalize(56),
    height: normalize(56),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: normalize(28),
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    borderWidth: 2,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  trophyEmoji: {
    fontSize: normalize(28),
  },
  trophyBadge: {
    position: "absolute",
    top: -normalize(4),
    right: -normalize(4),
    backgroundColor: "#FFD700",
    borderRadius: normalize(10),
    width: normalize(20),
    height: normalize(20),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFF",
  },
  trophyBadgeText: {
    fontSize: normalize(10),
    fontWeight: "700",
    color: "#333",
  },
  trophyContent: {
    flex: 1,
  },
  trophyTitle: {
    marginBottom: normalize(6),
    color: "#333",
    fontSize: normalize(16),
  },
  trophyDescription: {
    marginBottom: normalize(8),
    color: "#666",
    lineHeight: normalize(20),
  },
  trophyDateContainer: {
    alignItems: "center",
  },
  trophyDate: {
    fontSize: normalize(12),
    color: "#999",
    marginLeft: normalize(4),
  },
  championHeadingContainer: {
    alignItems: "center",
    marginTop: normalize(8),
    marginBottom: normalize(8),
  },
  championHeading: {
    fontSize: normalize(24),
    fontWeight: "bold",
    color: "#FFD700",
    textShadowColor: "#FFF8DC",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: normalize(2),
  },
  championSub: {
    fontSize: normalize(16),
    color: "#B8860B",
    marginBottom: normalize(8),
  },
  portraitCabinetContainer: {
    alignItems: "center",
    marginBottom: normalize(24),
    width: "100%",
  },
  portraitTrophyItem: {
    alignItems: "center",
    marginBottom: normalize(32),
    width: "80%",
    backgroundColor: "rgba(255, 215, 0, 0.07)",
    borderRadius: normalize(20),
    paddingVertical: normalize(20),
    paddingHorizontal: normalize(12),
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  portraitTrophyIconGlow: {
    backgroundColor: "rgba(255, 215, 0, 0.18)",
    borderRadius: normalize(60),
    padding: normalize(16),
    marginBottom: normalize(10),
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  portraitTrophyIcon: {
    fontSize: normalize(56),
    color: "#FFD700",
    textShadowColor: "#FFF8DC",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
    textAlign: "center",
  },
  portraitTrophyTitle: {
    fontSize: normalize(18),
    color: "#B8860B",
    marginTop: normalize(8),
    marginBottom: normalize(4),
    textAlign: "center",
  },
  portraitTrophyDescription: {
    fontSize: normalize(14),
    color: "#666",
    marginBottom: normalize(8),
    textAlign: "center",
    lineHeight: normalize(20),
  },
  shelfBar: {
    height: normalize(12),
    backgroundColor: "#A0522D",
    borderRadius: normalize(8),
    marginHorizontal: normalize(8),
    marginBottom: normalize(8),
    shadowColor: "#8B5C2A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  medalContainer: {
    alignItems: "center",
    marginTop: -normalize(10),
    marginBottom: normalize(8),
  },
  medalRibbon: {
    fontSize: normalize(18),
    marginBottom: -normalize(8),
  },
  medalIcon: {
    fontSize: normalize(32),
    color: "#FFD700",
    textShadowColor: "#FFF8DC",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
