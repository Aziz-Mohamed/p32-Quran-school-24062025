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

interface Teacher {
  id: string;
  name: string;
  subject: string;
  experience: number;
  students: number;
  rating: number;
  status: "active" | "inactive" | "on-leave";
  email: string;
  phone: string;
  avatar?: string;
}

const mockTeachers: Teacher[] = [
  {
    id: "1",
    name: "Ahmed Hassan",
    subject: "Quran Studies",
    experience: 8,
    students: 45,
    rating: 4.8,
    status: "active",
    email: "ahmed.hassan@quranschool.com",
    phone: "+966-50-123-4567",
  },
  {
    id: "2",
    name: "Fatima Al-Zahra",
    subject: "Islamic Studies",
    experience: 12,
    students: 38,
    rating: 4.9,
    status: "active",
    email: "fatima.alzahra@quranschool.com",
    phone: "+966-50-234-5678",
  },
  {
    id: "3",
    name: "Omar Khalil",
    subject: "Arabic Language",
    experience: 6,
    students: 32,
    rating: 4.6,
    status: "active",
    email: "omar.khalil@quranschool.com",
    phone: "+966-50-345-6789",
  },
  {
    id: "4",
    name: "Aisha Rahman",
    subject: "Tajweed",
    experience: 10,
    students: 28,
    rating: 4.7,
    status: "on-leave",
    email: "aisha.rahman@quranschool.com",
    phone: "+966-50-456-7890",
  },
  {
    id: "5",
    name: "Yusuf Ibrahim",
    subject: "Islamic History",
    experience: 15,
    students: 52,
    rating: 4.5,
    status: "active",
    email: "yusuf.ibrahim@quranschool.com",
    phone: "+966-50-567-8901",
  },
];

const TeacherCard: React.FC<{ teacher: Teacher; onPress: () => void }> = ({
  teacher,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const getStatusColor = () => {
    switch (teacher.status) {
      case "active":
        return "#4CAF50";
      case "inactive":
        return "#F44336";
      case "on-leave":
        return "#FF9800";
      default:
        return colors.textSecondary;
    }
  };

  const getSubjectColor = () => {
    switch (teacher.subject) {
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

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={normalize(12)} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons
          key="half"
          name="star-half"
          size={normalize(12)}
          color="#FFD700"
        />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={normalize(12)}
          color={colors.textSecondary}
        />
      );
    }

    return stars;
  };

  return (
    <TouchableOpacity style={styles.teacherCard} onPress={onPress}>
      <View style={styles.teacherHeader}>
        <View style={styles.avatarContainer}>
          <View
            style={[styles.avatar, { backgroundColor: colors.accentOrange }]}
          >
            <Text style={styles.avatarText}>
              {teacher.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Text>
          </View>
          <View
            style={[styles.statusDot, { backgroundColor: getStatusColor() }]}
          />
        </View>
        <View style={styles.teacherInfo}>
          <Text style={[styles.teacherName, { color: colors.textPrimary }]}>
            {teacher.name}
          </Text>
          <View style={styles.ratingContainer}>
            {renderStars(teacher.rating)}
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {teacher.rating}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.subjectSection}>
        <View
          style={[styles.subjectBadge, { backgroundColor: getSubjectColor() }]}
        >
          <Text style={styles.subjectText}>{teacher.subject}</Text>
        </View>
      </View>

      <View style={styles.teacherStatsRow}>
        <View style={styles.teacherStatItem}>
          <Ionicons
            name="school"
            size={normalize(16)}
            color={colors.textSecondary}
          />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {teacher.students} students
          </Text>
        </View>
        <View style={styles.teacherStatItem}>
          <Ionicons
            name="time"
            size={normalize(16)}
            color={colors.textSecondary}
          />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {teacher.experience} years
          </Text>
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

export default function TeachersScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filters = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
    { key: "on-leave", label: "On Leave" },
  ];

  const filteredTeachers = mockTeachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" || teacher.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: mockTeachers.length,
    active: mockTeachers.filter((t) => t.status === "active").length,
    inactive: mockTeachers.filter((t) => t.status === "inactive").length,
    onLeave: mockTeachers.filter((t) => t.status === "on-leave").length,
  };

  const averageRating = (
    mockTeachers.reduce((sum, teacher) => sum + teacher.rating, 0) /
    mockTeachers.length
  ).toFixed(1);

  return (
    <View
      style={[styles.container, { backgroundColor: colors.primaryBackground }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Teachers 👨‍🏫
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {stats.total} teachers on staff
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.accentOrange }]}
          onPress={() => router.push("/admin/teachers/add" as any)}
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
          <Text style={[styles.statValue, { color: "#FF9800" }]}>
            {stats.onLeave}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            On Leave
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: "#FFD700" }]}>
            {averageRating}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Avg Rating
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
            placeholder="Search teachers..."
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

      {/* Teachers List */}
      <ScrollView
        style={styles.teachersList}
        showsVerticalScrollIndicator={false}
      >
        {filteredTeachers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={normalize(64)}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No teachers found
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              {searchQuery
                ? "Try adjusting your search"
                : "Add your first teacher to get started"}
            </Text>
          </View>
        ) : (
          <View style={styles.teachersGrid}>
            {filteredTeachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                onPress={() =>
                  router.push(`/admin/teachers/${teacher.id}` as any)
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
  teachersList: {
    flex: 1,
    paddingHorizontal: normalize(24),
  },
  teachersGrid: {
    gap: normalize(16),
  },
  teacherCard: {
    padding: normalize(20),
    borderRadius: normalize(20),
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  teacherHeader: {
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
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: normalize(18),
    fontWeight: "600",
    marginBottom: normalize(4),
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(4),
  },
  ratingText: {
    fontSize: normalize(12),
    fontWeight: "600",
    marginLeft: normalize(4),
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
  teacherStatsRow: {
    flexDirection: "row",
    gap: normalize(16),
  },
  teacherStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(8),
  },
  statText: {
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
