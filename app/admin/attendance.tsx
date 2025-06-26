import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
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
        return colors.accent;
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
        isSelected && { backgroundColor: colors.primary },
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
            { backgroundColor: isSelected ? "#fff" : colors.primary },
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          style={[styles.exportButton, { backgroundColor: colors.primary }]}
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
            <Text style={[styles.overviewValue, { color: colors.success }]}>
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
            <Text style={[styles.overviewValue, { color: colors.primary }]}>
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
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  exportButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  overviewSection: {
    marginBottom: 24,
  },
  overviewCard: {
    flexDirection: "row",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  overviewItem: {
    flex: 1,
    alignItems: "center",
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  overviewDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 8,
  },
  calendarSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  calendarContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  calendarHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  calendarHeaderText: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDay: {
    width: (width - 80) / 7,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    margin: 2,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
  },
  attendanceDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: "absolute",
    bottom: 4,
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
  attendanceList: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  attendanceCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  attendanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  studentInfo: {
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  attendanceDetails: {
    marginBottom: 8,
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
    fontSize: 14,
    marginLeft: 8,
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
