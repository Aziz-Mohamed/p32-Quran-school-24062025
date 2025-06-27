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
  subject: string;
  grade: string;
  teacher: string;
  room: string;
  students: number;
  maxStudents: number;
  schedule: string;
  status: "active" | "full" | "inactive";
  occupancy: number;
}

const mockClasses: Class[] = [
  {
    id: "1",
    name: "Quran Studies A",
    subject: "Quran Studies",
    grade: "Grade 6",
    teacher: "Ahmed Hassan",
    room: "Room 1",
    students: 18,
    maxStudents: 20,
    schedule: "Mon, Wed, Fri • 9:00 AM",
    status: "active",
    occupancy: 90,
  },
  {
    id: "2",
    name: "Islamic Studies B",
    subject: "Islamic Studies",
    grade: "Grade 4",
    teacher: "Fatima Al-Zahra",
    room: "Room 2",
    students: 20,
    maxStudents: 20,
    schedule: "Tue, Thu • 10:30 AM",
    status: "full",
    occupancy: 100,
  },
  {
    id: "3",
    name: "Arabic Language C",
    subject: "Arabic Language",
    grade: "Grade 7",
    teacher: "Omar Khalil",
    room: "Room 3",
    students: 15,
    maxStudents: 18,
    schedule: "Mon, Wed • 2:00 PM",
    status: "active",
    occupancy: 83,
  },
  {
    id: "4",
    name: "Tajweed D",
    subject: "Tajweed",
    grade: "Grade 5",
    teacher: "Aisha Rahman",
    room: "Room 4",
    students: 12,
    maxStudents: 15,
    schedule: "Tue, Thu, Sat • 11:00 AM",
    status: "active",
    occupancy: 80,
  },
  {
    id: "5",
    name: "Islamic History E",
    subject: "Islamic History",
    grade: "Grade 8",
    teacher: "Yusuf Ibrahim",
    room: "Room 5",
    students: 16,
    maxStudents: 20,
    schedule: "Fri • 3:30 PM",
    status: "active",
    occupancy: 80,
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
        return "#4CAF50";
      case "full":
        return "#FF9800";
      case "inactive":
        return "#F44336";
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
      case "Arabic Language":
        return colors.accentTeal;
      case "Tajweed":
        return "#4CAF50";
      case "Islamic History":
        return "#FF9800";
      default:
        return colors.textSecondary;
    }
  };

  const getOccupancyColor = () => {
    if (classItem.occupancy >= 90) return "#4CAF50";
    if (classItem.occupancy >= 75) return "#FF9800";
    return "#F44336";
  };

  return (
    <TouchableOpacity style={styles.classCard} onPress={onPress}>
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
          style={[styles.statusDot, { backgroundColor: getStatusColor() }]}
        />
      </View>

      <View style={styles.subjectSection}>
        <View
          style={[styles.subjectBadge, { backgroundColor: getSubjectColor() }]}
        >
          <Text style={styles.subjectText}>{classItem.subject}</Text>
        </View>
      </View>

      <View style={styles.teacherSection}>
        <Ionicons
          name="person"
          size={normalize(16)}
          color={colors.textSecondary}
        />
        <Text style={[styles.teacherText, { color: colors.textSecondary }]}>
          {classItem.teacher}
        </Text>
      </View>

      <View style={styles.occupancySection}>
        <View style={styles.occupancyHeader}>
          <Text
            style={[styles.occupancyLabel, { color: colors.textSecondary }]}
          >
            Occupancy
          </Text>
          <Text style={[styles.occupancyValue, { color: getOccupancyColor() }]}>
            {classItem.students}/{classItem.maxStudents}
          </Text>
        </View>
        <View style={[styles.occupancyBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.occupancyProgress,
              {
                backgroundColor: getOccupancyColor(),
                width: `${classItem.occupancy}%`,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.scheduleSection}>
        <Ionicons
          name="time"
          size={normalize(16)}
          color={colors.textSecondary}
        />
        <Text style={[styles.scheduleText, { color: colors.textSecondary }]}>
          {classItem.schedule}
        </Text>
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

export default function ClassesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filters = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "full", label: "Full" },
    { key: "inactive", label: "Inactive" },
  ];

  const filteredClasses = mockClasses.filter((classItem) => {
    const matchesSearch =
      classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.grade.toLowerCase().includes(searchQuery.toLowerCase());

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
  const averageOccupancy = Math.round(
    mockClasses.reduce((sum, classItem) => sum + classItem.occupancy, 0) /
      mockClasses.length
  );

  return (
    <View
      style={[styles.container, { backgroundColor: colors.primaryBackground }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Classes 📚
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {stats.total} classes running
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.accentOrange }]}
          onPress={() => router.push("/admin/classes/add" as any)}
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
            Classes
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: "#4CAF50" }]}>
            {totalStudents}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Students
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: "#FF9800" }]}>
            {stats.full}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Full
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: "#4DB6AC" }]}>
            {averageOccupancy}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Avg Occupancy
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

      {/* Classes List */}
      <ScrollView
        style={styles.classesList}
        showsVerticalScrollIndicator={false}
      >
        {filteredClasses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="library-outline"
              size={normalize(64)}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No classes found
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              {searchQuery
                ? "Try adjusting your search"
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
  classesList: {
    flex: 1,
    paddingHorizontal: normalize(24),
  },
  classesGrid: {
    gap: normalize(16),
  },
  classCard: {
    padding: normalize(20),
    borderRadius: normalize(20),
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  statusDot: {
    width: normalize(12),
    height: normalize(12),
    borderRadius: normalize(6),
  },
  subjectSection: {
    marginBottom: normalize(16),
  },
  subjectBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(16),
  },
  subjectText: {
    fontSize: normalize(12),
    fontWeight: "600",
    color: "#fff",
  },
  teacherSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(8),
    marginBottom: normalize(16),
  },
  teacherText: {
    fontSize: normalize(14),
  },
  occupancySection: {
    marginBottom: normalize(16),
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
    height: normalize(6),
    borderRadius: normalize(3),
    overflow: "hidden",
  },
  occupancyProgress: {
    height: "100%",
    borderRadius: normalize(3),
  },
  scheduleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(8),
  },
  scheduleText: {
    fontSize: normalize(14),
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
