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
          size={normalize(12)}
          color={colors.warning}
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons
          key="half"
          name="star-half"
          size={normalize(12)}
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
          size={normalize(12)}
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
              size={normalize(20)}
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
            {teacher.status.replace("-", " ").charAt(0).toUpperCase() +
              teacher.status.slice(1).replace("-", " ")}
          </Text>
        </View>
      </View>

      <View style={styles.teacherStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Subject
          </Text>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {teacher.subject}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Experience
          </Text>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {teacher.experience} years
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Students
          </Text>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {teacher.students}
          </Text>
        </View>
      </View>

      <View style={styles.teacherContact}>
        <View style={styles.contactItem}>
          <Ionicons
            name="mail"
            size={normalize(14)}
            color={colors.textSecondary}
          />
          <Text
            style={[styles.contactText, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {teacher.email}
          </Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons
            name="call"
            size={normalize(14)}
            color={colors.textSecondary}
          />
          <Text style={[styles.contactText, { color: colors.textSecondary }]}>
            {teacher.phone}
          </Text>
        </View>
      </View>

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
    </TouchableOpacity>
  );
};

export default function TeachersScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "active" | "inactive" | "on-leave"
  >("all");

  const filters = [
    { key: "all", label: "All", count: mockTeachers.length },
    {
      key: "active",
      label: "Active",
      count: mockTeachers.filter((t) => t.status === "active").length,
    },
    {
      key: "inactive",
      label: "Inactive",
      count: mockTeachers.filter((t) => t.status === "inactive").length,
    },
    {
      key: "on-leave",
      label: "On Leave",
      count: mockTeachers.filter((t) => t.status === "on-leave").length,
    },
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

  const totalStudents = mockTeachers.reduce(
    (sum, teacher) => sum + teacher.students,
    0
  );
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
            Manage {mockTeachers.length} teachers
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.accentOrange }]}
          onPress={() => router.push("/admin/teachers/add")}
        >
          <Ionicons name="add" size={normalize(20)} color="#fff" />
          <Text style={styles.addButtonText}>Add Teacher</Text>
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
              {mockTeachers.length}
            </Text>
            <Text
              style={[styles.overviewLabel, { color: colors.textSecondary }]}
            >
              Total Teachers
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
              {averageRating}
            </Text>
            <Text
              style={[styles.overviewLabel, { color: colors.textSecondary }]}
            >
              Avg Rating
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
          placeholder="Search teachers, subjects, or email..."
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

      {/* Teachers List */}
      <ScrollView
        style={styles.teachersList}
        showsVerticalScrollIndicator={false}
      >
        {filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              onPress={() => router.push(`/admin/teachers/${teacher.id}`)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="person-outline"
              size={normalize(48)}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.emptyStateTitle, { color: colors.textPrimary }]}
            >
              No teachers found
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
  teachersList: {
    flex: 1,
  },
  teacherCard: {
    padding: normalize(20),
    borderRadius: normalize(16),
    borderWidth: 1,
    marginBottom: normalize(12),
  },
  teacherHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: normalize(16),
  },
  teacherInfo: {
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
    marginLeft: normalize(4),
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
  teacherStats: {
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
  teacherContact: {
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
