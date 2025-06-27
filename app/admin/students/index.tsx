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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface Student {
  id: string;
  name: string;
  age: number;
  grade: string;
  parentName: string;
  parentPhone: string;
  attendance: number;
  status: "active" | "inactive" | "pending";
  enrollmentDate: string;
  avatar?: string;
}

const mockStudents: Student[] = [
  {
    id: "1",
    name: "Ahmed Hassan",
    age: 12,
    grade: "Grade 6",
    parentName: "Mohammed Hassan",
    parentPhone: "+966-50-123-4567",
    attendance: 95,
    status: "active",
    enrollmentDate: "September 2023",
  },
  {
    id: "2",
    name: "Fatima Al-Zahra",
    age: 10,
    grade: "Grade 4",
    parentName: "Ali Al-Zahra",
    parentPhone: "+966-50-234-5678",
    attendance: 88,
    status: "active",
    enrollmentDate: "September 2023",
  },
  {
    id: "3",
    name: "Omar Khalil",
    age: 14,
    grade: "Grade 8",
    parentName: "Khalil Omar",
    parentPhone: "+966-50-345-6789",
    attendance: 92,
    status: "active",
    enrollmentDate: "August 2023",
  },
  {
    id: "4",
    name: "Aisha Rahman",
    age: 11,
    grade: "Grade 5",
    parentName: "Rahman Ali",
    parentPhone: "+966-50-456-7890",
    attendance: 78,
    status: "inactive",
    enrollmentDate: "October 2023",
  },
  {
    id: "5",
    name: "Yusuf Ibrahim",
    age: 13,
    grade: "Grade 7",
    parentName: "Ibrahim Yusuf",
    parentPhone: "+966-50-567-8901",
    attendance: 96,
    status: "active",
    enrollmentDate: "September 2023",
  },
];

const StudentCard: React.FC<{ student: Student; onPress: () => void }> = ({
  student,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

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
    <TouchableOpacity
      style={[
        styles.studentCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={onPress}
    >
      <View style={styles.studentHeader}>
        <View style={styles.studentInfo}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.accentOrange + "20" },
            ]}
          >
            <Ionicons
              name="person"
              size={normalize(16)}
              color={colors.accentOrange}
            />
          </View>
          <View style={styles.studentDetails}>
            <Text style={[styles.studentName, { color: colors.textPrimary }]}>
              {student.name}
            </Text>
            <Text
              style={[styles.studentGrade, { color: colors.textSecondary }]}
            >
              {student.grade} • Age {student.age}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor() + "15" },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.studentStats}>
        <View style={styles.statItem}>
          <Ionicons
            name="person"
            size={normalize(12)}
            color={colors.textSecondary}
          />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {student.parentName}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons
            name="call"
            size={normalize(12)}
            color={colors.textSecondary}
          />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {student.parentPhone}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons
            name="calendar"
            size={normalize(12)}
            color={colors.textSecondary}
          />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {student.enrollmentDate}
          </Text>
        </View>
      </View>

      <View style={styles.attendanceSection}>
        <View style={styles.attendanceHeader}>
          <Text
            style={[styles.attendanceLabel, { color: colors.textSecondary }]}
          >
            Attendance
          </Text>
          <Text
            style={[styles.attendanceValue, { color: getAttendanceColor() }]}
          >
            {student.attendance}%
          </Text>
        </View>
        <View
          style={[styles.attendanceBar, { backgroundColor: colors.border }]}
        >
          <View
            style={[
              styles.attendanceProgress,
              {
                backgroundColor: getAttendanceColor(),
                width: `${student.attendance}%`,
              },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const FilterChip: React.FC<{
  label: string;
  isActive: boolean;
  onPress: () => void;
}> = ({ label, isActive, onPress }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        {
          backgroundColor: isActive ? colors.accentOrange : colors.surface,
          borderColor: isActive ? colors.accentOrange : colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterChipText,
          {
            color: isActive ? "#fff" : colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default function StudentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filters = [
    { key: "all", label: "All Students" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
    { key: "pending", label: "Pending" },
  ];

  const filteredStudents = mockStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" || student.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: mockStudents.length,
    active: mockStudents.filter((s) => s.status === "active").length,
    inactive: mockStudents.filter((s) => s.status === "inactive").length,
    pending: mockStudents.filter((s) => s.status === "pending").length,
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.primaryBackground }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Students
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Manage student enrollments
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.accentOrange }]}
          onPress={() => router.push("/admin/students/add" as any)}
        >
          <Ionicons name="add" size={normalize(20)} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View
          style={[styles.statsRowItem, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {stats.total}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total
          </Text>
        </View>
        <View
          style={[styles.statsRowItem, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.statValue, { color: colors.success }]}>
            {stats.active}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Active
          </Text>
        </View>
        <View
          style={[styles.statsRowItem, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.statValue, { color: colors.error }]}>
            {stats.inactive}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Inactive
          </Text>
        </View>
        <View
          style={[styles.statsRowItem, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.statValue, { color: colors.warning }]}>
            {stats.pending}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Pending
          </Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View
          style={[styles.searchContainer, { backgroundColor: colors.surface }]}
        >
          <Ionicons
            name="search"
            size={normalize(20)}
            color={colors.textSecondary}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search students..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={normalize(20)}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.filtersContainer}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {filters.map((filter) => (
          <FilterChip
            key={filter.key}
            label={filter.label}
            isActive={selectedFilter === filter.key}
            onPress={() => setSelectedFilter(filter.key)}
          />
        ))}
      </ScrollView>

      {/* Students List */}
      <ScrollView
        style={styles.studentsList}
        showsVerticalScrollIndicator={false}
      >
        {filteredStudents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={normalize(48)}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No students found
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Add your first student to get started"}
            </Text>
          </View>
        ) : (
          <View style={styles.studentsGrid}>
            {filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onPress={() =>
                  router.push(`/admin/students/${student.id}` as any)
                }
              />
            ))}
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
    paddingHorizontal: normalize(20),
    paddingTop: normalize(16),
    paddingBottom: normalize(20),
  },
  title: {
    fontSize: normalize(24),
    fontWeight: "700",
  },
  subtitle: {
    fontSize: normalize(14),
    marginTop: normalize(2),
  },
  addButton: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(22),
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: normalize(20),
    marginBottom: normalize(20),
    gap: normalize(12),
  },
  statsRowItem: {
    flex: 1,
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(8),
    borderRadius: normalize(12),
    alignItems: "center",
  },
  statValue: {
    fontSize: normalize(18),
    fontWeight: "700",
    marginBottom: normalize(2),
  },
  statLabel: {
    fontSize: normalize(12),
    fontWeight: "500",
  },
  searchSection: {
    paddingHorizontal: normalize(20),
    marginBottom: normalize(16),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    borderRadius: normalize(12),
    gap: normalize(12),
  },
  searchInput: {
    flex: 1,
    fontSize: normalize(16),
  },
  filtersContainer: {
    paddingHorizontal: normalize(20),
    marginBottom: normalize(20),
  },
  filterChip: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    borderRadius: normalize(20),
    borderWidth: normalize(1),
    marginRight: normalize(8),
  },
  filterChipText: {
    fontSize: normalize(14),
    fontWeight: "500",
  },
  studentsList: {
    flex: 1,
    paddingHorizontal: normalize(20),
  },
  studentsGrid: {
    gap: normalize(16),
  },
  studentCard: {
    padding: normalize(16),
    borderRadius: normalize(16),
    borderWidth: normalize(1),
  },
  studentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: normalize(12),
  },
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(12),
  },
  avatar: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    justifyContent: "center",
    alignItems: "center",
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: normalize(16),
    fontWeight: "600",
    marginBottom: normalize(2),
  },
  studentGrade: {
    fontSize: normalize(14),
  },
  statusBadge: {
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    borderRadius: normalize(12),
  },
  statusText: {
    fontSize: normalize(12),
    fontWeight: "600",
  },
  studentStats: {
    marginBottom: normalize(12),
    gap: normalize(8),
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(8),
  },
  statText: {
    fontSize: normalize(14),
  },
  attendanceSection: {
    gap: normalize(8),
  },
  attendanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attendanceLabel: {
    fontSize: normalize(14),
    fontWeight: "500",
  },
  attendanceValue: {
    fontSize: normalize(14),
    fontWeight: "600",
  },
  attendanceBar: {
    height: normalize(4),
    borderRadius: normalize(2),
    overflow: "hidden",
  },
  attendanceProgress: {
    height: "100%",
    borderRadius: normalize(2),
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: normalize(60),
  },
  emptyTitle: {
    fontSize: normalize(18),
    fontWeight: "600",
    marginTop: normalize(16),
    marginBottom: normalize(8),
  },
  emptySubtitle: {
    fontSize: normalize(14),
    textAlign: "center",
    paddingHorizontal: normalize(40),
  },
});
