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

  const occupancyPercentage =
    (classItem.students / classItem.maxStudents) * 100;

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
            {classItem.grade} • {classItem.room}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor() + "15" },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {classItem.status.charAt(0).toUpperCase() +
              classItem.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.subjectSection}>
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
      </View>

      <View style={styles.classStats}>
        <View style={styles.statItem}>
          <Ionicons
            name="person"
            size={normalize(12)}
            color={colors.textSecondary}
          />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {classItem.teacher}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons
            name="time"
            size={normalize(12)}
            color={colors.textSecondary}
          />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {classItem.schedule}
          </Text>
        </View>
      </View>

      <View style={styles.occupancySection}>
        <View style={styles.occupancyHeader}>
          <Text
            style={[styles.occupancyLabel, { color: colors.textSecondary }]}
          >
            Occupancy
          </Text>
          <Text style={[styles.occupancyValue, { color: colors.textPrimary }]}>
            {classItem.students}/{classItem.maxStudents}
          </Text>
        </View>
        <View style={[styles.occupancyBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.occupancyProgress,
              {
                backgroundColor: getStatusColor(),
                width: `${occupancyPercentage}%`,
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

export default function ClassesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filters = [
    { key: "all", label: "All Classes" },
    { key: "active", label: "Active" },
    { key: "full", label: "Full" },
    { key: "inactive", label: "Inactive" },
  ];

  const filteredClasses = mockClasses.filter((classItem) => {
    const matchesSearch =
      classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" || classItem.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: mockClasses.length,
    active: mockClasses.filter((c) => c.status === "active").length,
    full: mockClasses.filter((c) => c.status === "full").length,
    inactive: mockClasses.filter((c) => c.status === "inactive").length,
  };

  const totalStudents = mockClasses.reduce(
    (sum, classItem) => sum + classItem.students,
    0
  );
  const totalCapacity = mockClasses.reduce(
    (sum, classItem) => sum + classItem.maxStudents,
    0
  );
  const occupancyRate = ((totalStudents / totalCapacity) * 100).toFixed(1);

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
            Manage class schedules
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.accentOrange }]}
          onPress={() => router.push("/admin/classes/add" as any)}
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
          <Text style={[styles.statValue, { color: colors.warning }]}>
            {stats.full}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Full
          </Text>
        </View>
        <View
          style={[styles.statsRowItem, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.statValue, { color: colors.accentOrange }]}>
            {occupancyRate}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Occupancy
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
            placeholder="Search classes..."
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

      {/* Classes List */}
      <ScrollView
        style={styles.classesList}
        showsVerticalScrollIndicator={false}
      >
        {filteredClasses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="library-outline"
              size={normalize(48)}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No classes found
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Add your first class to get started"}
            </Text>
          </View>
        ) : (
          <View style={styles.classesGrid}>
            {filteredClasses.map((classItem) => (
              <ClassCard
                key={classItem.id}
                classItem={classItem}
                onPress={() =>
                  router.push(`/admin/classes/${classItem.id}` as any)
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
  classesList: {
    flex: 1,
    paddingHorizontal: normalize(20),
  },
  classesGrid: {
    gap: normalize(16),
  },
  classCard: {
    padding: normalize(16),
    borderRadius: normalize(16),
    borderWidth: normalize(1),
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: normalize(12),
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: normalize(16),
    fontWeight: "600",
    marginBottom: normalize(2),
  },
  classGrade: {
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
  subjectSection: {
    marginBottom: normalize(12),
  },
  subjectBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    borderRadius: normalize(12),
  },
  subjectText: {
    fontSize: normalize(12),
    fontWeight: "600",
  },
  classStats: {
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
  occupancySection: {
    gap: normalize(8),
  },
  occupancyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  occupancyLabel: {
    fontSize: normalize(14),
    fontWeight: "500",
  },
  occupancyValue: {
    fontSize: normalize(14),
    fontWeight: "600",
  },
  occupancyBar: {
    height: normalize(4),
    borderRadius: normalize(2),
    overflow: "hidden",
  },
  occupancyProgress: {
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
