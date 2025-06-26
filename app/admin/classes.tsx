import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { normalize } from "@/utils/normalize";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

interface Class {
  id: string;
  name: string;
  grade: string;
  teacher: string;
  students: number;
  maxStudents: number;
  schedule: string;
  status: "active" | "full" | "inactive";
  subject: string;
  room: string;
}

const mockClasses: Class[] = [
  {
    id: "1",
    name: "Quran Recitation",
    grade: "Grade 6",
    teacher: "Ahmed Hassan",
    students: 18,
    maxStudents: 20,
    schedule: "Mon, Wed, Fri 9:00 AM",
    status: "active",
    subject: "Quran Studies",
    room: "Room 101",
  },
  {
    id: "2",
    name: "Islamic Studies",
    grade: "Grade 4",
    teacher: "Fatima Al-Zahra",
    students: 20,
    maxStudents: 20,
    schedule: "Tue, Thu 10:30 AM",
    status: "full",
    subject: "Islamic Studies",
    room: "Room 102",
  },
  {
    id: "3",
    name: "Arabic Language",
    grade: "Grade 7",
    teacher: "Omar Khalil",
    students: 15,
    maxStudents: 18,
    schedule: "Mon, Wed 2:00 PM",
    status: "active",
    subject: "Arabic",
    room: "Room 103",
  },
  {
    id: "4",
    name: "Tajweed",
    grade: "Grade 5",
    teacher: "Aisha Rahman",
    students: 12,
    maxStudents: 15,
    schedule: "Tue, Thu 3:30 PM",
    status: "active",
    subject: "Quran Studies",
    room: "Room 104",
  },
  {
    id: "5",
    name: "Islamic History",
    grade: "Grade 8",
    teacher: "Yusuf Ibrahim",
    students: 16,
    maxStudents: 20,
    schedule: "Fri 11:00 AM",
    status: "active",
    subject: "Islamic Studies",
    room: "Room 105",
  },
];

const ClassCard: React.FC<{ classItem: Class; onPress: () => void }> = ({
  classItem,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const getStatusColor = () => {
    switch (classItem.status) {
      case "active":
        return colors.success;
      case "full":
        return colors.warning;
      case "inactive":
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (classItem.status) {
      case "active":
        return "Active";
      case "full":
        return "Full";
      case "inactive":
        return "Inactive";
      default:
        return "Unknown";
    }
  };

  const getSubjectColor = () => {
    switch (classItem.subject) {
      case "Quran Studies":
        return colors.accentOrange;
      case "Islamic Studies":
        return colors.accentTeal;
      case "Arabic":
        return colors.accentTeal;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.classCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={onPress}
    >
      <View style={styles.classHeader}>
        <View style={styles.classInfo}>
          <Text style={[styles.className, { color: colors.textPrimary }]}>
            {classItem.name}
          </Text>
          <Text style={[styles.classGrade, { color: colors.textSecondary }]}>
            {classItem.grade}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor() + "15" },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      <View style={styles.classDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="person" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {classItem.teacher}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="people" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {classItem.students}/{classItem.maxStudents}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="time" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {classItem.schedule}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {classItem.room}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.subjectBadge,
          { backgroundColor: getSubjectColor() + "15" },
        ]}
      >
        <Text style={[styles.subjectText, { color: getSubjectColor() }]}>
          {classItem.subject}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function ClassesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "active" | "full" | "inactive"
  >("all");

  const filters = [
    { key: "all", label: "All Classes", count: mockClasses.length },
    {
      key: "active",
      label: "Active",
      count: mockClasses.filter((c) => c.status === "active").length,
    },
    {
      key: "full",
      label: "Full",
      count: mockClasses.filter((c) => c.status === "full").length,
    },
    {
      key: "inactive",
      label: "Inactive",
      count: mockClasses.filter((c) => c.status === "inactive").length,
    },
  ];

  const filteredClasses = mockClasses.filter((classItem) => {
    return selectedFilter === "all" || classItem.status === selectedFilter;
  });

  const totalStudents = mockClasses.reduce(
    (sum, classItem) => sum + classItem.students,
    0
  );
  const totalCapacity = mockClasses.reduce(
    (sum, classItem) => sum + classItem.maxStudents,
    0
  );
  const occupancyRate = Math.round((totalStudents / totalCapacity) * 100);

  return (
    <View
      style={[styles.container, { backgroundColor: colors.primaryBackground }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Classes
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Manage {mockClasses.length} classes
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.accentOrange }]}
          onPress={() => {
            /* Navigate to add class */
          }}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Class</Text>
        </TouchableOpacity>
      </View>

      {/* Overview Stats */}
      <View style={styles.overviewSection}>
        <View
          style={[
            styles.overviewCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.overviewItem}>
            <Text
              style={[styles.overviewValue, { color: colors.accentOrange }]}
            >
              {mockClasses.length}
            </Text>
            <Text
              style={[styles.overviewLabel, { color: colors.textSecondary }]}
            >
              Total Classes
            </Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewItem}>
            <Text
              style={[styles.overviewValue, { color: colors.accentOrange }]}
            >
              {totalStudents}
            </Text>
            <Text
              style={[styles.overviewLabel, { color: colors.textSecondary }]}
            >
              Total Students
            </Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewItem}>
            <Text
              style={[styles.overviewValue, { color: colors.accentOrange }]}
            >
              {occupancyRate}%
            </Text>
            <Text
              style={[styles.overviewLabel, { color: colors.textSecondary }]}
            >
              Occupancy Rate
            </Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && {
                backgroundColor: colors.accentOrange + "15",
              },
              { borderColor: colors.border },
            ]}
            onPress={() => setSelectedFilter(filter.key as any)}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color:
                    selectedFilter === filter.key
                      ? colors.accentOrange
                      : colors.textSecondary,
                },
              ]}
            >
              {filter.label}
            </Text>
            <View
              style={[
                styles.filterCount,
                { backgroundColor: colors.textSecondary + "20" },
              ]}
            >
              <Text
                style={[
                  styles.filterCountText,
                  { color: colors.textSecondary },
                ]}
              >
                {filter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Classes List */}
      <ScrollView
        style={styles.classesList}
        showsVerticalScrollIndicator={false}
      >
        {filteredClasses.length > 0 ? (
          filteredClasses.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              onPress={() => {
                /* Navigate to class details */
              }}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="school-outline"
              size={48}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.emptyStateTitle, { color: colors.textPrimary }]}
            >
              No classes found
            </Text>
            <Text
              style={[
                styles.emptyStateSubtitle,
                { color: colors.textSecondary },
              ]}
            >
              Try adjusting your filters or add a new class
            </Text>
          </View>
        )}
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: normalize(24),
  },
  title: {
    fontSize: normalize(28),
    fontWeight: "700",
    marginBottom: normalize(4),
  },
  subtitle: {
    fontSize: normalize(16),
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    borderRadius: normalize(12),
    gap: normalize(8),
  },
  addButtonText: {
    color: "#fff",
    fontSize: normalize(14),
    fontWeight: "600",
  },
  overviewSection: {
    marginBottom: normalize(24),
  },
  overviewCard: {
    flexDirection: "row",
    padding: normalize(20),
    borderRadius: normalize(16),
    borderWidth: normalize(1),
  },
  overviewItem: {
    flex: 1,
    alignItems: "center",
  },
  overviewValue: {
    fontSize: normalize(24),
    fontWeight: "700",
    marginBottom: normalize(4),
  },
  overviewLabel: {
    fontSize: normalize(12),
    fontWeight: "500",
  },
  overviewDivider: {
    width: normalize(1),
    backgroundColor: "#e0e0e0",
    marginHorizontal: normalize(16),
  },
  filtersContainer: {
    marginBottom: normalize(20),
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    borderRadius: normalize(20),
    borderWidth: normalize(1),
    marginRight: normalize(12),
  },
  filterText: {
    fontSize: normalize(14),
    fontWeight: "500",
    marginRight: normalize(8),
  },
  filterCount: {
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(2),
    borderRadius: normalize(8),
  },
  filterCountText: {
    fontSize: normalize(12),
    fontWeight: "600",
  },
  classesList: {
    flex: 1,
  },
  classCard: {
    padding: normalize(20),
    borderRadius: normalize(16),
    borderWidth: normalize(1),
    marginBottom: normalize(12),
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: normalize(16),
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: normalize(18),
    fontWeight: "600",
    marginBottom: normalize(4),
  },
  classGrade: {
    fontSize: normalize(14),
  },
  statusBadge: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(12),
  },
  statusText: {
    fontSize: normalize(12),
    fontWeight: "600",
  },
  classDetails: {
    marginBottom: normalize(16),
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: normalize(8),
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  detailText: {
    fontSize: normalize(14),
    marginLeft: normalize(8),
  },
  subjectBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(12),
  },
  subjectText: {
    fontSize: normalize(12),
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: normalize(60),
  },
  emptyStateTitle: {
    fontSize: normalize(18),
    fontWeight: "600",
    marginTop: normalize(16),
    marginBottom: normalize(8),
  },
  emptyStateSubtitle: {
    fontSize: normalize(14),
    textAlign: "center",
  },
});
