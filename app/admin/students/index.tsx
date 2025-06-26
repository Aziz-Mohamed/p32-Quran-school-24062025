import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
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
  attendance: number;
  status: "active" | "inactive" | "pending";
  avatar?: string;
}

const mockStudents: Student[] = [
  {
    id: "1",
    name: "Ahmed Hassan",
    age: 12,
    grade: "Grade 6",
    parentName: "Mohammed Hassan",
    attendance: 95,
    status: "active",
  },
  {
    id: "2",
    name: "Fatima Al-Zahra",
    age: 10,
    grade: "Grade 4",
    parentName: "Ali Al-Zahra",
    attendance: 88,
    status: "active",
  },
  {
    id: "3",
    name: "Omar Khalil",
    age: 14,
    grade: "Grade 8",
    parentName: "Khalil Omar",
    attendance: 92,
    status: "active",
  },
  {
    id: "4",
    name: "Aisha Rahman",
    age: 11,
    grade: "Grade 5",
    parentName: "Rahman Ali",
    attendance: 78,
    status: "inactive",
  },
  {
    id: "5",
    name: "Yusuf Ibrahim",
    age: 13,
    grade: "Grade 7",
    parentName: "Ibrahim Yusuf",
    attendance: 96,
    status: "active",
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
            <Ionicons name="person" size={20} color={colors.primary} />
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
            Parent
          </Text>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {student.parentName}
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
      student.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" || student.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

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
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Student</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search students or parents..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={20}
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
              name="people-outline"
              size={48}
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 8,
  },
  filterCount: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: "600",
  },
  studentsList: {
    flex: 1,
  },
  studentCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  studentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  studentGrade: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  studentStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
});
