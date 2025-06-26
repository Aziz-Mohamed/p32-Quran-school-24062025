import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface StudentDetail {
  id: string;
  name: string;
  age: number;
  grade: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  emergencyContact: string;
  medicalInfo: string;
  attendance: number;
  status: "active" | "inactive" | "pending";
  enrollmentDate: string;
  avatar?: string;
  academicProgress: {
    subject: string;
    progress: number;
    grade: string;
  }[];
  attendanceHistory: {
    date: string;
    status: "present" | "absent" | "late" | "excused";
    time: string;
  }[];
}

const mockStudentDetail: StudentDetail = {
  id: "1",
  name: "Ahmed Hassan",
  age: 12,
  grade: "Grade 6",
  parentName: "Mohammed Hassan",
  parentPhone: "+966-50-123-4567",
  parentEmail: "mohammed.hassan@email.com",
  address: "123 Main Street, Riyadh, Saudi Arabia",
  emergencyContact: "Fatima Hassan (Mother) +966-50-987-6543",
  medicalInfo: "No known allergies or medical conditions",
  attendance: 95,
  status: "active",
  enrollmentDate: "September 2023",
  academicProgress: [
    { subject: "Quran Recitation", progress: 85, grade: "A-" },
    { subject: "Islamic Studies", progress: 92, grade: "A" },
    { subject: "Arabic Language", progress: 78, grade: "B+" },
    { subject: "Tajweed", progress: 88, grade: "A-" },
  ],
  attendanceHistory: [
    { date: "2024-01-15", status: "present", time: "9:00 AM" },
    { date: "2024-01-14", status: "present", time: "8:55 AM" },
    { date: "2024-01-13", status: "late", time: "9:15 AM" },
    { date: "2024-01-12", status: "present", time: "9:02 AM" },
    { date: "2024-01-11", status: "absent", time: "-" },
    { date: "2024-01-10", status: "present", time: "8:58 AM" },
  ],
};

const ProgressCard: React.FC<{
  subject: string;
  progress: number;
  grade: string;
}> = ({ subject, progress, grade }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const getProgressColor = () => {
    if (progress >= 90) return colors.success;
    if (progress >= 80) return colors.primary;
    if (progress >= 70) return colors.warning;
    return colors.error;
  };

  return (
    <View
      style={[
        styles.progressCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.progressHeader}>
        <Text style={[styles.subjectName, { color: colors.textPrimary }]}>
          {subject}
        </Text>
        <Text style={[styles.grade, { color: getProgressColor() }]}>
          {grade}
        </Text>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: getProgressColor(), width: `${progress}%` },
          ]}
        />
      </View>
      <Text style={[styles.progressText, { color: colors.textSecondary }]}>
        {progress}% Complete
      </Text>
    </View>
  );
};

const AttendanceItem: React.FC<{
  date: string;
  status: "present" | "absent" | "late" | "excused";
  time: string;
}> = ({ date, status, time }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const getStatusColor = () => {
    switch (status) {
      case "present":
        return colors.success;
      case "absent":
        return colors.error;
      case "late":
        return colors.warning;
      case "excused":
        return colors.accent;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "present":
        return "checkmark-circle";
      case "absent":
        return "close-circle";
      case "late":
        return "time";
      case "excused":
        return "medical";
      default:
        return "help-circle";
    }
  };

  return (
    <View style={styles.attendanceItem}>
      <View style={styles.attendanceDate}>
        <Text style={[styles.dateText, { color: colors.textPrimary }]}>
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </Text>
        <Text style={[styles.dayText, { color: colors.textSecondary }]}>
          {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
        </Text>
      </View>
      <View
        style={[
          styles.statusIndicator,
          { backgroundColor: getStatusColor() + "15" },
        ]}
      >
        <Ionicons
          name={getStatusIcon() as any}
          size={16}
          color={getStatusColor()}
        />
      </View>
      <View style={styles.attendanceInfo}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
        <Text style={[styles.timeText, { color: colors.textSecondary }]}>
          {time}
        </Text>
      </View>
    </View>
  );
};

export default function StudentDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [student] = useState<StudentDetail>(mockStudentDetail);

  const getStatusColor = () => {
    switch (student.status) {
      case "active":
        return colors.success;
      case "inactive":
        return colors.error;
      case "pending":
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getAttendanceColor = () => {
    if (student.attendance >= 90) return colors.success;
    if (student.attendance >= 75) return colors.warning;
    return colors.error;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Student Details
        </Text>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.profileHeader}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Ionicons name="person" size={32} color={colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.studentName, { color: colors.textPrimary }]}>
                {student.name}
              </Text>
              <Text
                style={[styles.studentGrade, { color: colors.textSecondary }]}
              >
                {student.grade}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor() + "15" },
                ]}
              >
                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                  {student.status.charAt(0).toUpperCase() +
                    student.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {student.age}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Age
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: getAttendanceColor() }]}>
                {student.attendance}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Attendance
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {student.enrollmentDate}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Enrolled
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Contact Information
          </Text>
          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.infoRow}>
              <Ionicons name="person" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Parent:
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {student.parentName}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Phone:
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {student.parentPhone}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Email:
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {student.parentEmail}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name="location"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Address:
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {student.address}
              </Text>
            </View>
          </View>
        </View>

        {/* Academic Progress */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Academic Progress
          </Text>
          {student.academicProgress.map((progress, index) => (
            <ProgressCard key={index} {...progress} />
          ))}
        </View>

        {/* Recent Attendance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Recent Attendance
          </Text>
          <View
            style={[
              styles.attendanceCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {student.attendanceHistory.map((attendance, index) => (
              <AttendanceItem key={index} {...attendance} />
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="mail" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Contact Parent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
          >
            <Ionicons name="document-text" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>View Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  profileCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  studentGrade: {
    fontSize: 16,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  profileStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    marginRight: 8,
    minWidth: 60,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  progressCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "600",
  },
  grade: {
    fontSize: 16,
    fontWeight: "700",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: "right",
  },
  attendanceCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  attendanceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  attendanceDate: {
    alignItems: "center",
    marginRight: 16,
    minWidth: 60,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
  },
  dayText: {
    fontSize: 12,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  attendanceInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  timeText: {
    fontSize: 12,
  },
  actionSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
