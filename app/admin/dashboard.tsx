import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { normalize } from "@/utils/normalize";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
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
        styles.statCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.statHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + "15" }]}>
          <Ionicons name={icon} size={normalize(20)} color={color} />
        </View>
        <View style={styles.changeContainer}>
          <Ionicons
            name={isPositive ? "trending-up" : "trending-down"}
            size={normalize(12)}
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
      <Text style={[styles.statValue, { color: colors.textPrimary }]}>
        {value}
      </Text>
      <Text style={[styles.statTitle, { color: colors.textSecondary }]}>
        {title}
      </Text>
    </View>
  );
};

interface QuickActionProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({
  title,
  subtitle,
  icon,
  color,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <TouchableOpacity
      style={[
        styles.quickActionCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={onPress}
    >
      <View style={[styles.actionIcon, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={normalize(24)} color={color} />
      </View>
      <View style={styles.actionContent}>
        <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
        <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={normalize(20)}
        color={colors.textSecondary}
      />
    </TouchableOpacity>
  );
};

interface ActivityItemProps {
  title: string;
  time: string;
  type: "success" | "warning" | "info";
  icon: keyof typeof Ionicons.glyphMap;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  title,
  time,
  type,
  icon,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const getTypeColor = () => {
    switch (type) {
      case "success":
        return colors.success;
      case "warning":
        return colors.warning;
      case "info":
        return colors.accentTeal;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={styles.activityItem}>
      <View
        style={[
          styles.activityIcon,
          { backgroundColor: getTypeColor() + "15" },
        ]}
      >
        <Ionicons name={icon} size={normalize(16)} color={getTypeColor()} />
      </View>
      <View style={styles.activityContent}>
        <Text style={[styles.activityTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
        <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
          {time}
        </Text>
      </View>
    </View>
  );
};

export default function AdminDashboard() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const stats = [
    {
      title: "Total Students",
      value: "1,247",
      change: "+12%",
      isPositive: true,
      icon: "people" as const,
      color: colors.accentOrange,
    },
    {
      title: "Active Teachers",
      value: "24",
      change: "+2",
      isPositive: true,
      icon: "person" as const,
      color: colors.accentTeal,
    },
    {
      title: "Classes Today",
      value: "18",
      change: "-1",
      isPositive: false,
      icon: "school" as const,
      color: colors.accentOrange,
    },
    {
      title: "Attendance Rate",
      value: "94.2%",
      change: "+2.1%",
      isPositive: true,
      icon: "checkmark-circle" as const,
      color: colors.success,
    },
  ];

  const quickActions = [
    {
      title: "Add New Student",
      subtitle: "Register a new student",
      icon: "person-add" as const,
      color: colors.accentOrange,
      onPress: () => router.push("/admin/students/add"),
    },
    {
      title: "Add New Teacher",
      subtitle: "Hire a new teacher",
      icon: "person-add" as const,
      color: colors.accentTeal,
      onPress: () => router.push("/admin/teachers/add"),
    },
    {
      title: "View Reports",
      subtitle: "Analytics & insights",
      icon: "bar-chart" as const,
      color: colors.accentOrange,
      onPress: () => router.push("/admin/reports"),
    },
    {
      title: "Manage Classes",
      subtitle: "Schedule & assignments",
      icon: "calendar" as const,
      color: colors.warning,
      onPress: () => router.push("/admin/classes"),
    },
  ];

  const recentActivity = [
    {
      title: "New student registered: Ahmed Hassan",
      time: "2 hours ago",
      type: "success" as const,
      icon: "person-add" as const,
    },
    {
      title: "Teacher Fatima completed session",
      time: "4 hours ago",
      type: "info" as const,
      icon: "checkmark-circle" as const,
    },
    {
      title: "Weekly attendance report generated",
      time: "1 day ago",
      type: "info" as const,
      icon: "document-text" as const,
    },
    {
      title: "Low attendance alert: Class 3B",
      time: "2 days ago",
      type: "warning" as const,
      icon: "warning" as const,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.primaryBackground }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View>
          <Text style={[styles.welcomeTitle, { color: colors.textPrimary }]}>
            Welcome back, Admin
          </Text>
          <Text
            style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}
          >
            Here&apos;s what&apos;s happening at your Quran school today
          </Text>
        </View>
        <View
          style={[
            styles.dateCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.dateText, { color: colors.textPrimary }]}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>
      </View>

      {/* Statistics Grid */}
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Overview
        </Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Quick Actions
        </Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <View style={styles.activityHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Recent Activity
          </Text>
          <TouchableOpacity>
            <Text style={[styles.viewAllText, { color: colors.accentOrange }]}>
              View All
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.activityCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {recentActivity.map((activity, index) => (
            <ActivityItem key={index} {...activity} />
          ))}
        </View>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: normalize(32),
  },
  welcomeTitle: {
    fontSize: normalize(28),
    fontWeight: "700",
    marginBottom: normalize(4),
  },
  welcomeSubtitle: {
    fontSize: normalize(16),
    lineHeight: normalize(22),
  },
  dateCard: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    borderRadius: normalize(12),
    borderWidth: 1,
    alignItems: "center",
  },
  dateText: {
    fontSize: normalize(14),
    fontWeight: "600",
  },
  statsSection: {
    marginBottom: normalize(32),
  },
  sectionTitle: {
    fontSize: normalize(20),
    fontWeight: "600",
    marginBottom: normalize(16),
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: normalize(12),
  },
  statCard: {
    width: (width - normalize(72)) / 2 - normalize(6),
    padding: normalize(20),
    borderRadius: normalize(16),
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: normalize(12),
  },
  iconContainer: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(12),
    justifyContent: "center",
    alignItems: "center",
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(4),
  },
  changeText: {
    fontSize: normalize(12),
    fontWeight: "600",
  },
  statValue: {
    fontSize: normalize(24),
    fontWeight: "700",
    marginBottom: normalize(4),
  },
  statTitle: {
    fontSize: normalize(14),
    fontWeight: "500",
  },
  actionsSection: {
    marginBottom: normalize(32),
  },
  actionsGrid: {
    gap: normalize(12),
  },
  quickActionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: normalize(20),
    borderRadius: normalize(16),
    borderWidth: 1,
  },
  actionIcon: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(12),
    justifyContent: "center",
    alignItems: "center",
    marginRight: normalize(16),
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: normalize(16),
    fontWeight: "600",
    marginBottom: normalize(2),
  },
  actionSubtitle: {
    fontSize: normalize(14),
  },
  activitySection: {
    marginBottom: normalize(32),
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: normalize(16),
  },
  viewAllText: {
    fontSize: normalize(14),
    fontWeight: "600",
  },
  activityCard: {
    borderRadius: normalize(16),
    borderWidth: 1,
    padding: normalize(20),
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: normalize(12),
  },
  activityIcon: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(8),
    justifyContent: "center",
    alignItems: "center",
    marginRight: normalize(12),
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: normalize(14),
    fontWeight: "500",
    marginBottom: normalize(2),
  },
  activityTime: {
    fontSize: normalize(12),
  },
  bottomSpacing: {
    height: normalize(24),
  },
});
