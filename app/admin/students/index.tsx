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
            style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}
          >
            <Ionicons
              name="person"
              size={normalize(20)}
              color={colors.primary}
            />
          </View>
          <View style={styles.studentDetails}>
            <Text style={[styles.studentName, { color: colors.textPrimary }]}>
              {student.name}
            </Text>
            <Text
              style={[styles.studentGrade, { color: colors.textSecondary }]}
            >
              {student.grade}
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
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Age
          </Text>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {student.age}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Enrolled
          </Text>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {student.enrollmentDate}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Attendance
          </Text>
          <Text style={[styles.statValue, { color: getAttendanceColor() }]}>
            {student.attendance}%
          </Text>
        </View>
      </View>

      <View style={styles.studentContact}>
        <View style={styles.contactItem}>
          <Ionicons
            name="person"
            size={normalize(14)}
            color={colors.textSecondary}
          />
          <Text style={[styles.contactText, { color: colors.textSecondary }]}>
            {student.parentName}
          </Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons
            name="call"
            size={normalize(14)}
            color={colors.textSecondary}
          />
          <Text style={[styles.contactText, { color: colors.textSecondary }]}>
            {student.parentPhone}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function StudentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "active" | "inactive" | "pending"
  >("all");

  const filters = [
    { key: "all", label: "All", count: mockStudents.length },
    {
      key: "active",
      label: "Active",
      count: mockStudents.filter((s) => s.status === "active").length,
    },
    {
      key: "inactive",
      label: "Inactive",
      count: mockStudents.filter((s) => s.status === "inactive").length,
    },
    {
      key: "pending",
      label: "Pending",
      count: mockStudents.filter((s) => s.status === "pending").length,
    },
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

  const averageAttendance = (
    mockStudents.reduce((sum, student) => sum + student.attendance, 0) /
    mockStudents.length
  ).toFixed(1);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Students
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Manage {mockStudents.length} students
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/admin/students/add")}
        >
          <Ionicons name="add" size={normalize(20)} color="#fff" />
          <Text style={styles.addButtonText}>Add Student</Text>
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
            <Text style={[styles.overviewValue, { color: colors.textPrimary }]}>
              {mockStudents.length}
            </Text>
            <Text
              style={[styles.overviewLabel, { color: colors.textSecondary }]}
            >
              Total Students
            </Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewValue, { color: colors.success }]}>
              {mockStudents.filter((s) => s.status === "active").length}
            </Text>
            <Text
              style={[styles.overviewLabel, { color: colors.textSecondary }]}
            >
              Active Students
            </Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewValue, { color: colors.primary }]}>
              {averageAttendance}%
            </Text>
            <Text
              style={[styles.overviewLabel, { color: colors.textSecondary }]}
            >
              Avg Attendance
            </Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Ionicons
          name="search"
          size={normalize(20)}
          color={colors.textSecondary}
        />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search students, grades, or parents..."
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
                backgroundColor: colors.primary + "15",
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
                      ? colors.primary
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

      {/* Students List */}
      <ScrollView
        style={styles.studentsList}
        showsVerticalScrollIndicator={false}
      >
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onPress={() => router.push(`/admin/students/${student.id}`)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="school-outline"
              size={normalize(48)}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.emptyStateTitle, { color: colors.textPrimary }]}
            >
              No students found
            </Text>
            <Text
              style={[
                styles.emptyStateSubtitle,
                { color: colors.textSecondary },
              ]}
            >
              Try adjusting your search or filters
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
    borderWidth: 1,
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
    width: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: normalize(16),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    borderRadius: normalize(12),
    borderWidth: 1,
    marginBottom: normalize(20),
  },
  searchInput: {
    flex: 1,
    marginLeft: normalize(12),
    fontSize: normalize(16),
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
    borderWidth: 1,
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
  studentsList: {
    flex: 1,
  },
  studentCard: {
    padding: normalize(20),
    borderRadius: normalize(16),
    borderWidth: 1,
    marginBottom: normalize(12),
  },
  studentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: normalize(16),
  },
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    justifyContent: "center",
    alignItems: "center",
    marginRight: normalize(12),
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: normalize(16),
    fontWeight: "600",
    marginBottom: normalize(4),
  },
  studentGrade: {
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
  studentStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: normalize(16),
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: normalize(12),
    marginBottom: normalize(4),
  },
  statValue: {
    fontSize: normalize(14),
    fontWeight: "600",
  },
  studentContact: {
    marginBottom: normalize(16),
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: normalize(8),
  },
  contactText: {
    fontSize: normalize(14),
    marginLeft: normalize(8),
    flex: 1,
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
