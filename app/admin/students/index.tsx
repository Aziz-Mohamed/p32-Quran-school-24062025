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
        return "#4CAF50";
      case "inactive":
        return "#F44336";
      case "pending":
        return "#FF9800";
      default:
        return colors.textSecondary;
    }
  };

  const getAttendanceColor = () => {
    if (student.attendance >= 90) return "#4CAF50";
    if (student.attendance >= 75) return "#FF9800";
    return "#F44336";
  };

  return (
    <TouchableOpacity style={styles.studentCard} onPress={onPress}>
      <View style={styles.studentHeader}>
        <View style={styles.avatarContainer}>
          <View
            style={[styles.avatar, { backgroundColor: colors.accentOrange }]}
          >
            <Text style={styles.avatarText}>
              {student.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Text>
          </View>
          <View
            style={[styles.statusDot, { backgroundColor: getStatusColor() }]}
          />
        </View>
        <View style={styles.studentInfo}>
          <Text style={[styles.studentName, { color: colors.textPrimary }]}>
            {student.name}
          </Text>
          <Text style={[styles.studentGrade, { color: colors.textSecondary }]}>
            {student.grade} • Age {student.age}
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
          backgroundColor: isActive ? colors.accentOrange : "#fff",
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
    { key: "all", label: "All" },
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
            Students 👨‍🎓
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {stats.total} students enrolled
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.accentOrange }]}
          onPress={() => router.push("/admin/students/add" as any)}
        >
          <Ionicons name="add" size={normalize(24)} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {stats.total}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: "#4CAF50" }]}>
            {stats.active}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Active
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: "#F44336" }]}>
            {stats.inactive}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Inactive
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: "#FF9800" }]}>
            {stats.pending}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Pending
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
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

      {/* Filters */}
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
              size={normalize(64)}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No students found
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              {searchQuery
                ? "Try adjusting your search"
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
    paddingHorizontal: normalize(24),
    paddingTop: normalize(20),
    paddingBottom: normalize(24),
  },
  title: {
    fontSize: normalize(28),
    fontWeight: "700",
  },
  subtitle: {
    fontSize: normalize(16),
    marginTop: normalize(4),
  },
  addButton: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: normalize(24),
    marginBottom: normalize(24),
    gap: normalize(16),
  },
  statItem: {
    flex: 1,
    paddingVertical: normalize(16),
    paddingHorizontal: normalize(12),
    borderRadius: normalize(16),
    backgroundColor: "#fff",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: normalize(20),
    fontWeight: "700",
    marginBottom: normalize(4),
  },
  statLabel: {
    fontSize: normalize(12),
    fontWeight: "500",
  },
  searchSection: {
    paddingHorizontal: normalize(24),
    marginBottom: normalize(20),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    borderRadius: normalize(16),
    backgroundColor: "#fff",
    gap: normalize(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: normalize(16),
  },
  filtersContainer: {
    paddingHorizontal: normalize(24),
    marginBottom: normalize(24),
  },
  filterChip: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    borderRadius: normalize(20),
    marginRight: normalize(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  filterChipText: {
    fontSize: normalize(14),
    fontWeight: "600",
  },
  studentsList: {
    flex: 1,
    paddingHorizontal: normalize(24),
  },
  studentsGrid: {
    gap: normalize(16),
  },
  studentCard: {
    padding: normalize(20),
    borderRadius: normalize(20),
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: normalize(16),
  },
  avatarContainer: {
    position: "relative",
    marginRight: normalize(16),
  },
  avatar: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: normalize(18),
    fontWeight: "700",
  },
  statusDot: {
    position: "absolute",
    bottom: normalize(2),
    right: normalize(2),
    width: normalize(12),
    height: normalize(12),
    borderRadius: normalize(6),
    borderWidth: normalize(2),
    borderColor: "#fff",
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: normalize(18),
    fontWeight: "600",
    marginBottom: normalize(4),
  },
  studentGrade: {
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
    height: normalize(6),
    borderRadius: normalize(3),
    overflow: "hidden",
  },
  attendanceProgress: {
    height: "100%",
    borderRadius: normalize(3),
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: normalize(80),
  },
  emptyTitle: {
    fontSize: normalize(20),
    fontWeight: "600",
    marginTop: normalize(20),
    marginBottom: normalize(8),
  },
  emptySubtitle: {
    fontSize: normalize(16),
    textAlign: "center",
    paddingHorizontal: normalize(40),
  },
});
