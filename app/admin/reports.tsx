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

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface ReportCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const ReportCard: React.FC<ReportCardProps> = ({
  title,
  value,
  change,
  isPositive,
  icon,
  color,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View
      style={[
        styles.reportCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.reportHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + "15" }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={styles.changeContainer}>
          <Ionicons
            name={isPositive ? "trending-up" : "trending-down"}
            size={12}
            color={isPositive ? colors.success : colors.error}
          />
          <Text
            style={[
              styles.changeText,
              { color: isPositive ? colors.success : colors.error },
            ]}
          >
            {change}
          </Text>
        </View>
      </View>
      <Text style={[styles.reportValue, { color: colors.textPrimary }]}>
        {value}
      </Text>
      <Text style={[styles.reportTitle, { color: colors.textSecondary }]}>
        {title}
      </Text>
    </View>
  );
};

const SimpleChart: React.FC<{ data: ChartData[]; title: string }> = ({
  data,
  title,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <View
      style={[
        styles.chartContainer,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
        {title}
      </Text>
      <View style={styles.chartContent}>
        {data.map((item, index) => (
          <View key={index} style={styles.chartBar}>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    backgroundColor: item.color,
                    height: (item.value / maxValue) * 120,
                  },
                ]}
              />
            </View>
            <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
              {item.label}
            </Text>
            <Text style={[styles.barValue, { color: colors.textPrimary }]}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function ReportsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");

  const periods = [
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "quarter", label: "This Quarter" },
    { key: "year", label: "This Year" },
  ];

  const overviewStats = [
    {
      title: "Total Attendance",
      value: "94.2%",
      change: "+2.1%",
      isPositive: true,
      icon: "checkmark-circle" as const,
      color: colors.success,
    },
    {
      title: "Active Students",
      value: "1,247",
      change: "+12",
      isPositive: true,
      icon: "people" as const,
      color: colors.primary,
    },
    {
      title: "Classes Conducted",
      value: "156",
      change: "+8",
      isPositive: true,
      icon: "school" as const,
      color: colors.secondary,
    },
    {
      title: "Teacher Performance",
      value: "4.8/5",
      change: "+0.2",
      isPositive: true,
      icon: "star" as const,
      color: colors.warning,
    },
  ];

  const attendanceData: ChartData[] = [
    { label: "Mon", value: 95, color: colors.primary },
    { label: "Tue", value: 92, color: colors.primary },
    { label: "Wed", value: 88, color: colors.primary },
    { label: "Thu", value: 96, color: colors.primary },
    { label: "Fri", value: 91, color: colors.primary },
    { label: "Sat", value: 89, color: colors.primary },
    { label: "Sun", value: 85, color: colors.primary },
  ];

  const gradePerformanceData: ChartData[] = [
    { label: "Grade 1", value: 92, color: colors.success },
    { label: "Grade 2", value: 88, color: colors.success },
    { label: "Grade 3", value: 95, color: colors.success },
    { label: "Grade 4", value: 87, color: colors.warning },
    { label: "Grade 5", value: 91, color: colors.success },
    { label: "Grade 6", value: 89, color: colors.success },
  ];

  const teacherPerformanceData: ChartData[] = [
    { label: "Ahmed", value: 4.8, color: colors.primary },
    { label: "Fatima", value: 4.9, color: colors.primary },
    { label: "Omar", value: 4.6, color: colors.secondary },
    { label: "Aisha", value: 4.7, color: colors.primary },
    { label: "Yusuf", value: 4.5, color: colors.secondary },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Reports & Analytics
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Comprehensive insights into your Quran school
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="download" size={20} color="#fff" />
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.periodContainer}
      >
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodChip,
              selectedPeriod === period.key && {
                backgroundColor: colors.primary + "15",
              },
              { borderColor: colors.border },
            ]}
            onPress={() => setSelectedPeriod(period.key as any)}
          >
            <Text
              style={[
                styles.periodText,
                {
                  color:
                    selectedPeriod === period.key
                      ? colors.primary
                      : colors.textSecondary,
                },
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Overview
          </Text>
          <View style={styles.statsGrid}>
            {overviewStats.map((stat, index) => (
              <ReportCard key={index} {...stat} />
            ))}
          </View>
        </View>

        {/* Attendance Chart */}
        <View style={styles.section}>
          <SimpleChart data={attendanceData} title="Weekly Attendance Rate" />
        </View>

        {/* Grade Performance */}
        <View style={styles.section}>
          <SimpleChart data={gradePerformanceData} title="Grade Performance" />
        </View>

        {/* Teacher Performance */}
        <View style={styles.section}>
          <SimpleChart
            data={teacherPerformanceData}
            title="Teacher Performance Rating"
          />
        </View>

        {/* Key Insights */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Key Insights
          </Text>
          <View
            style={[
              styles.insightsCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.insightItem}>
              <View
                style={[
                  styles.insightIcon,
                  { backgroundColor: colors.success + "15" },
                ]}
              >
                <Ionicons name="trending-up" size={16} color={colors.success} />
              </View>
              <View style={styles.insightContent}>
                <Text
                  style={[styles.insightTitle, { color: colors.textPrimary }]}
                >
                  Attendance Improving
                </Text>
                <Text
                  style={[
                    styles.insightDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Overall attendance has increased by 2.1% this month compared
                  to last month.
                </Text>
              </View>
            </View>

            <View style={styles.insightItem}>
              <View
                style={[
                  styles.insightIcon,
                  { backgroundColor: colors.warning + "15" },
                ]}
              >
                <Ionicons name="warning" size={16} color={colors.warning} />
              </View>
              <View style={styles.insightContent}>
                <Text
                  style={[styles.insightTitle, { color: colors.textPrimary }]}
                >
                  Grade 4 Needs Attention
                </Text>
                <Text
                  style={[
                    styles.insightDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Grade 4 attendance is below 90%. Consider intervention
                  strategies.
                </Text>
              </View>
            </View>

            <View style={styles.insightItem}>
              <View
                style={[
                  styles.insightIcon,
                  { backgroundColor: colors.accent + "15" },
                ]}
              >
                <Ionicons name="star" size={16} color={colors.accent} />
              </View>
              <View style={styles.insightContent}>
                <Text
                  style={[styles.insightTitle, { color: colors.textPrimary }]}
                >
                  Teacher Excellence
                </Text>
                <Text
                  style={[
                    styles.insightDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Teacher Fatima has the highest performance rating at 4.9/5.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
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
  periodContainer: {
    marginBottom: 24,
  },
  periodChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
  },
  periodText: {
    fontSize: 14,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  reportCard: {
    width: (width - 72) / 2,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  reportValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  chartContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  chartContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 160,
  },
  chartBar: {
    flex: 1,
    alignItems: "center",
  },
  barContainer: {
    height: 120,
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  barValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  insightsCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 24,
  },
});
