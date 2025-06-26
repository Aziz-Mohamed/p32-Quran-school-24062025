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

interface TeacherDetail {
  id: string;
  name: string;
  subject: string;
  experience: number;
  education: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: string;
  bio: string;
  status: "active" | "inactive" | "on-leave";
  hireDate: string;
  avatar?: string;
  rating: number;
  totalStudents: number;
  totalClasses: number;
  classes: {
    id: string;
    name: string;
    grade: string;
    students: number;
    schedule: string;
    room: string;
  }[];
  performance: {
    metric: string;
    value: number;
    target: number;
    unit: string;
  }[];
  recentActivity: {
    date: string;
    activity: string;
    type: "class" | "assessment" | "meeting" | "training";
  }[];
}

const mockTeacherDetail: TeacherDetail = {
  id: "1",
  name: "Ahmed Hassan",
  subject: "Quran Studies",
  experience: 8,
  education: "Master's in Islamic Studies",
  email: "ahmed.hassan@quranschool.com",
  phone: "+966-50-123-4567",
  address: "456 Teacher Street, Riyadh, Saudi Arabia",
  emergencyContact: "Fatima Hassan (Spouse) +966-50-987-6543",
  bio: "Experienced Quran teacher with 8 years of teaching experience. Specializes in Tajweed and Quran memorization. Passionate about making Islamic education accessible and engaging for students of all ages.",
  status: "active",
  hireDate: "September 2016",
  rating: 4.8,
  totalStudents: 45,
  totalClasses: 4,
  classes: [
    {
      id: "1",
      name: "Quran Recitation - Level 1",
      grade: "Grades 1-3",
      students: 12,
      schedule: "Mon, Wed, Fri 9:00 AM",
      room: "Room 101",
    },
    {
      id: "2",
      name: "Tajweed Fundamentals",
      grade: "Grades 4-6",
      students: 15,
      schedule: "Tue, Thu 10:00 AM",
      room: "Room 102",
    },
    {
      id: "3",
      name: "Advanced Quran Studies",
      grade: "Grades 7-9",
      students: 10,
      schedule: "Mon, Wed 2:00 PM",
      room: "Room 103",
    },
    {
      id: "4",
      name: "Quran Memorization",
      grade: "Grades 10-12",
      students: 8,
      schedule: "Fri 3:00 PM",
      room: "Room 104",
    },
  ],
  performance: [
    { metric: "Student Satisfaction", value: 4.8, target: 4.5, unit: "/5.0" },
    { metric: "Attendance Rate", value: 92, target: 90, unit: "%" },
    { metric: "Student Progress", value: 85, target: 80, unit: "%" },
    { metric: "Parent Feedback", value: 4.6, target: 4.0, unit: "/5.0" },
  ],
  recentActivity: [
    {
      date: "2024-01-15",
      activity: "Conducted Quran recitation assessment",
      type: "assessment",
    },
    {
      date: "2024-01-14",
      activity: "Attended teacher training workshop",
      type: "training",
    },
    { date: "2024-01-13", activity: "Parent-teacher meeting", type: "meeting" },
    { date: "2024-01-12", activity: "Regular Quran class", type: "class" },
    {
      date: "2024-01-11",
      activity: "Student progress review",
      type: "assessment",
    },
  ],
};

const PerformanceCard: React.FC<{
  metric: string;
  value: number;
  target: number;
  unit: string;
}> = ({ metric, value, target, unit }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const getPerformanceColor = () => {
    if (value >= target) return colors.success;
    if (value >= target * 0.9) return colors.warning;
    return colors.error;
  };

  const getPerformanceIcon = () => {
    if (value >= target) return "trending-up";
    if (value >= target * 0.9) return "remove";
    return "trending-down";
  };

  return (
    <View
      style={[
        styles.performanceCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.performanceHeader}>
        <Text style={[styles.metricName, { color: colors.textPrimary }]}>
          {metric}
        </Text>
        <Ionicons
          name={getPerformanceIcon() as any}
          size={16}
          color={getPerformanceColor()}
        />
      </View>
      <View style={styles.performanceValues}>
        <Text style={[styles.currentValue, { color: getPerformanceColor() }]}>
          {value}
          {unit}
        </Text>
        <Text style={[styles.targetValue, { color: colors.textSecondary }]}>
          Target: {target}
          {unit}
        </Text>
      </View>
    </View>
  );
};

const ClassCard: React.FC<{ classInfo: TeacherDetail["classes"][0] }> = ({
  classInfo,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View
      style={[
        styles.classCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.classHeader}>
        <Text style={[styles.className, { color: colors.textPrimary }]}>
          {classInfo.name}
        </Text>
        <View
          style={[
            styles.gradeBadge,
            { backgroundColor: colors.primary + "15" },
          ]}
        >
          <Text style={[styles.gradeText, { color: colors.primary }]}>
            {classInfo.grade}
          </Text>
        </View>
      </View>

      <View style={styles.classDetails}>
        <View style={styles.classDetail}>
          <Ionicons name="people" size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {classInfo.students} students
          </Text>
        </View>
        <View style={styles.classDetail}>
          <Ionicons name="time" size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {classInfo.schedule}
          </Text>
        </View>
        <View style={styles.classDetail}>
          <Ionicons name="location" size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {classInfo.room}
          </Text>
        </View>
      </View>
    </View>
  );
};

const ActivityItem: React.FC<{
  activity: TeacherDetail["recentActivity"][0];
}> = ({ activity }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const getActivityIcon = () => {
    switch (activity.type) {
      case "class":
        return "school";
      case "assessment":
        return "document-text";
      case "meeting":
        return "people";
      case "training":
        return "library";
      default:
        return "information-circle";
    }
  };

  const getActivityColor = () => {
    switch (activity.type) {
      case "class":
        return colors.primary;
      case "assessment":
        return colors.secondary;
      case "meeting":
        return colors.accent;
      case "training":
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={styles.activityItem}>
      <View
        style={[
          styles.activityIcon,
          { backgroundColor: getActivityColor() + "15" },
        ]}
      >
        <Ionicons
          name={getActivityIcon() as any}
          size={16}
          color={getActivityColor()}
        />
      </View>
      <View style={styles.activityInfo}>
        <Text style={[styles.activityText, { color: colors.textPrimary }]}>
          {activity.activity}
        </Text>
        <Text style={[styles.activityDate, { color: colors.textSecondary }]}>
          {new Date(activity.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
      </View>
    </View>
  );
};

export default function TeacherDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [teacher] = useState<TeacherDetail>(mockTeacherDetail);

  const getStatusColor = () => {
    switch (teacher.status) {
      case "active":
        return colors.success;
      case "inactive":
        return colors.error;
      case "on-leave":
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={16} color={colors.warning} />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons
          key="half"
          name="star-half"
          size={16}
          color={colors.warning}
        />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={16}
          color={colors.textSecondary}
        />
      );
    }

    return stars;
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
          Teacher Details
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
              <Text style={[styles.teacherName, { color: colors.textPrimary }]}>
                {teacher.name}
              </Text>
              <Text
                style={[styles.teacherSubject, { color: colors.textSecondary }]}
              >
                {teacher.subject}
              </Text>
              <View style={styles.ratingContainer}>
                {renderStars(teacher.rating)}
                <Text
                  style={[styles.ratingText, { color: colors.textSecondary }]}
                >
                  {teacher.rating}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor() + "15" },
                ]}
              >
                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                  {teacher.status.replace("-", " ").charAt(0).toUpperCase() +
                    teacher.status.slice(1).replace("-", " ")}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {teacher.experience}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Years Experience
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {teacher.totalStudents}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Students
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {teacher.totalClasses}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Classes
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
              <Ionicons name="mail" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Email:
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {teacher.email}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Phone:
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {teacher.phone}
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
                {teacher.address}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="medical" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Emergency:
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {teacher.emergencyContact}
              </Text>
            </View>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Performance Metrics
          </Text>
          <View style={styles.performanceGrid}>
            {teacher.performance.map((metric, index) => (
              <PerformanceCard key={index} {...metric} />
            ))}
          </View>
        </View>

        {/* Classes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Assigned Classes
          </Text>
          {teacher.classes.map((classInfo) => (
            <ClassCard key={classInfo.id} classInfo={classInfo} />
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Recent Activity
          </Text>
          <View
            style={[
              styles.activityCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {teacher.recentActivity.map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="mail" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Contact Teacher</Text>
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
  teacherName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  teacherSubject: {
    fontSize: 16,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
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
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  performanceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  performanceCard: {
    width: (width - 72) / 2 - 6,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  performanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  metricName: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  performanceValues: {
    alignItems: "center",
  },
  currentValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  targetValue: {
    fontSize: 12,
  },
  classCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  className: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  classDetails: {
    gap: 8,
  },
  classDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  activityCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  activityDate: {
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
