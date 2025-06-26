import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { normalize } from "@/utils/normalize";
import { Ionicons } from "@expo/vector-icons";
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

interface AttendanceRecord {
  id: string;
  studentName: string;
  grade: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  time: string;
  teacher: string;
}

const mockAttendance: AttendanceRecord[] = [
  {
    id: "1",
    studentName: "Ahmed Hassan",
    grade: "Grade 6",
    date: "2024-01-15",
    status: "present",
    time: "9:00 AM",
    teacher: "Fatima Al-Zahra",
  },
  {
    id: "2",
    studentName: "Omar Khalil",
    grade: "Grade 7",
    date: "2024-01-15",
    status: "late",
    time: "9:15 AM",
    teacher: "Ahmed Hassan",
  },
  {
    id: "3",
    studentName: "Aisha Rahman",
    grade: "Grade 5",
    date: "2024-01-15",
    status: "present",
    time: "8:55 AM",
    teacher: "Omar Khalil",
  },
  {
    id: "4",
    studentName: "Yusuf Ibrahim",
    grade: "Grade 8",
    date: "2024-01-15",
    status: "absent",
    time: "-",
    teacher: "Aisha Rahman",
  },
  {
    id: "5",
    studentName: "Fatima Al-Zahra",
    grade: "Grade 4",
    date: "2024-01-15",
    status: "present",
    time: "9:02 AM",
    teacher: "Yusuf Ibrahim",
  },
];

const AttendanceCard: React.FC<{ record: AttendanceRecord }> = ({ record }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const getStatusColor = () => {
    switch (record.status) {
      case "present":
        return colors.success;
      case "absent":
        return colors.error;
      case "late":
        return colors.warning;
      case "excused":
        return colors.accentTeal;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = () => {
    switch (record.status) {
      case "present":
        return "checkmark-circle";
      case "absent":
        return "close-circle";
      case "late":
        return "time";
      case "excused":
        return "medical";
      default:
        return "help-circle";
    }
  };

  return (
    <View
      style={[
        styles.attendanceCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.attendanceHeader}>
        <View style={styles.studentInfo}>
          <Text style={[styles.studentName, { color: colors.textPrimary }]}>
            {record.studentName}
          </Text>
          <Text style={[styles.studentGrade, { color: colors.textSecondary }]}>
            {record.grade}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor() + "15" },
          ]}
        >
          <Ionicons
            name={getStatusIcon() as any}
            size={16}
            color={getStatusColor()}
          />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.attendanceDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="time" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {record.time}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="person" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {record.teacher}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const CalendarDay: React.FC<{
  day: number;
  isSelected: boolean;
  hasAttendance: boolean;
  onPress: () => void;
}> = ({ day, isSelected, hasAttendance, onPress }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <TouchableOpacity
      style={[
        styles.calendarDay,
        isSelected && { backgroundColor: colors.accentOrange },
        { borderColor: colors.border },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.dayText,
          { color: isSelected ? "#fff" : colors.textPrimary },
        ]}
      >
        {day}
      </Text>
      {hasAttendance && (
        <View
          style={[
            styles.attendanceDot,
            { backgroundColor: isSelected ? "#fff" : colors.accentOrange },
          ]}
        />
      )}
    </TouchableOpacity>
  );
};

export default function AttendanceScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [selectedDate, setSelectedDate] = useState(15);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "present" | "absent" | "late" | "excused"
  >("all");

  const filters = [
    { key: "all", label: "All", count: mockAttendance.length },
    {
      key: "present",
      label: "Present",
      count: mockAttendance.filter((a) => a.status === "present").length,
    },
    {
      key: "absent",
      label: "Absent",
      count: mockAttendance.filter((a) => a.status === "absent").length,
    },
    {
      key: "late",
      label: "Late",
      count: mockAttendance.filter((a) => a.status === "late").length,
    },
    {
      key: "excused",
      label: "Excused",
      count: mockAttendance.filter((a) => a.status === "excused").length,
    },
  ];

  const filteredAttendance = mockAttendance.filter((record) => {
    return selectedFilter === "all" || record.status === selectedFilter;
  });

  const totalStudents = mockAttendance.length;
  const presentCount = mockAttendance.filter(
    (a) => a.status === "present"
  ).length;
  const absentCount = mockAttendance.filter(
    (a) => a.status === "absent"
  ).length;
  const lateCount = mockAttendance.filter((a) => a.status === "late").length;
  const attendanceRate = Math.round((presentCount / totalStudents) * 100);

  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <View
      style={[styles.container, { backgroundColor: colors.primaryBackground }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Attendance
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track student attendance and manage records
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.exportButton,
            { backgroundColor: colors.accentOrange },
          ]}
          onPress={() => {
            /* Export attendance */
          }}
        >
          <Ionicons name="download" size={20} color="#fff" />
          <Text style={styles.exportButtonText}>Export</Text>
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
              {presentCount}
            </Text>
            <Text
              style={[styles.overviewLabel, { color: colors.textSecondary }]}
            >
              Present
            </Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewValue, { color: colors.error }]}>
              {absentCount}
            </Text>
            <Text
              style={[styles.overviewLabel, { color: colors.textSecondary }]}
            >
              Absent
            </Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewValue, { color: colors.warning }]}>
              {lateCount}
            </Text>
            <Text
              style={[styles.overviewLabel, { color: colors.textSecondary }]}
            >
              Late
            </Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewItem}>
            <Text
              style={[styles.overviewValue, { color: colors.accentOrange }]}
            >
              {attendanceRate}%
            </Text>
            <Text
              style={[styles.overviewLabel, { color: colors.textSecondary }]}
            >
              Rate
            </Text>
          </View>
        </View>
      </View>

      {/* Calendar */}
      <View style={styles.calendarSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          January 2024
        </Text>
        <View
          style={[
            styles.calendarContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.calendarHeader}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Text
                key={day}
                style={[
                  styles.calendarHeaderText,
                  { color: colors.textSecondary },
                ]}
              >
                {day}
              </Text>
            ))}
          </View>
          <View style={styles.calendarGrid}>
            {calendarDays.map((day) => (
              <CalendarDay
                key={day}
                day={day}
                isSelected={day === selectedDate}
                hasAttendance={day <= 15} // Mock data for first 15 days
                onPress={() => setSelectedDate(day)}
              />
            ))}
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

      {/* Attendance List */}
      <ScrollView
        style={styles.attendanceList}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.listTitle, { color: colors.textPrimary }]}>
          Attendance for January 15, 2024
        </Text>
        {filteredAttendance.length > 0 ? (
          filteredAttendance.map((record) => (
            <AttendanceCard key={record.id} record={record} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="calendar-outline"
              size={48}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.emptyStateTitle, { color: colors.textPrimary }]}
            >
              No attendance records
            </Text>
            <Text
              style={[
                styles.emptyStateSubtitle,
                { color: colors.textSecondary },
              ]}
            >
              Try adjusting your filters or select a different date
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
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    borderRadius: normalize(12),
    gap: normalize(8),
  },
  exportButtonText: {
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
    width: normalize(1),
    backgroundColor: "#e0e0e0",
    marginHorizontal: normalize(8),
  },
  calendarSection: {
    marginBottom: normalize(24),
  },
  sectionTitle: {
    fontSize: normalize(18),
    fontWeight: "600",
    marginBottom: normalize(12),
  },
  calendarContainer: {
    padding: normalize(16),
    borderRadius: normalize(16),
    borderWidth: normalize(1),
  },
  calendarHeader: {
    flexDirection: "row",
    marginBottom: normalize(12),
  },
  calendarHeaderText: {
    flex: 1,
    textAlign: "center",
    fontSize: normalize(12),
    fontWeight: "600",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDay: {
    width: (width - normalize(80)) / 7,
    height: normalize(40),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: normalize(8),
    borderWidth: normalize(1),
    margin: normalize(2),
  },
  dayText: {
    fontSize: normalize(14),
    fontWeight: "500",
  },
  attendanceDot: {
    width: normalize(4),
    height: normalize(4),
    borderRadius: 2,
    position: "absolute",
    bottom: normalize(4),
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
  attendanceList: {
    flex: 1,
  },
  listTitle: {
    fontSize: normalize(16),
    fontWeight: "600",
    marginBottom: normalize(16),
  },
  attendanceCard: {
    padding: normalize(16),
    borderRadius: normalize(12),
    borderWidth: normalize(1),
    marginBottom: normalize(8),
  },
  attendanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: normalize(12),
  },
  studentInfo: {
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(12),
    gap: normalize(4),
  },
  statusText: {
    fontSize: normalize(12),
    fontWeight: "600",
  },
  attendanceDetails: {
    marginBottom: normalize(8),
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
