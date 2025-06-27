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
        return colors.success;
      case "inactive":
        return colors.error;
      case "on-leave":
        return colors.warning;
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
        return colors.success;
      case "Islamic History":
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
        <Ionicons
          key={i}
          name="star"
          size={normalize(10)}
          color={colors.warning}
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons
          key="half"
          name="star-half"
          size={normalize(10)}
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
          size={normalize(10)}
          color={colors.textSecondary}
        />
      );
    }

    return stars;
  };

  return (
    <TouchableOpacity
      style={[
        styles.teacherCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={onPress}
    >
      <View style={styles.teacherHeader}>
        <View style={styles.teacherInfo}>
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
          <View style={styles.teacherDetails}>
            <Text style={[styles.teacherName, { color: colors.textPrimary }]}>
              {teacher.name}
            </Text>
            <View style={styles.ratingContainer}>
              {renderStars(teacher.rating)}
              <Text
                style={[styles.ratingText, { color: colors.textSecondary }]}
              >
                {teacher.rating}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor() + "15" },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {teacher.status === "on-leave"
              ? "On Leave"
              : teacher.status.charAt(0).toUpperCase() +
                teacher.status.slice(1)}
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
            {teacher.subject}
          </Text>
        </View>
      </View>

      <View style={styles.teacherStats}>
        <View style={styles.statItem}>
          <Ionicons
            name="school"
            size={normalize(12)}
            color={colors.textSecondary}
          />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {teacher.students} students
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons
            name="time"
            size={normalize(12)}
            color={colors.textSecondary}
          />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {teacher.experience} years
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons
            name="mail"
            size={normalize(12)}
            color={colors.textSecondary}
          />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {teacher.email}
          </Text>
        </View>
      </View>

      <View style={styles.contactSection}>
        <View style={styles.contactItem}>
          <Ionicons
            name="call"
            size={normalize(12)}
            color={colors.textSecondary}
          />
          <Text style={[styles.contactText, { color: colors.textSecondary }]}>
            {teacher.phone}
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

export default function TeachersScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filters = [
    { key: "all", label: "All Teachers" },
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
            Teachers
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Manage teaching staff
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.accentOrange }]}
          onPress={() => router.push("/admin/teachers/add" as any)}
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
            {stats.onLeave}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            On Leave
          </Text>
        </View>
        <View
          style={[styles.statsRowItem, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.statValue, { color: colors.accentOrange }]}>
            {averageRating}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Avg Rating
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
              size={normalize(48)}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No teachers found
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              {searchQuery
                ? "Try adjusting your search or filters"
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
  teachersList: {
    flex: 1,
    paddingHorizontal: normalize(20),
  },
  teachersGrid: {
    gap: normalize(16),
  },
  teacherCard: {
    padding: normalize(16),
    borderRadius: normalize(16),
    borderWidth: normalize(1),
  },
  teacherHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: normalize(12),
  },
  teacherInfo: {
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
  teacherDetails: {
    flex: 1,
  },
  teacherName: {
    fontSize: normalize(16),
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
  teacherStats: {
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
  contactSection: {
    gap: normalize(8),
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(8),
  },
  contactText: {
    fontSize: normalize(14),
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
