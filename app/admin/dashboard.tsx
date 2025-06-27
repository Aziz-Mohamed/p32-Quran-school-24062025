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
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive,
  icon,
  color,
  subtitle,
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
          <Ionicons name={icon} size={normalize(18)} color={color} />
        </View>
        <View style={styles.changeContainer}>
          <Ionicons
            name={isPositive ? "trending-up" : "trending-down"}
            size={normalize(10)}
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
      {subtitle && (
        <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

interface QuickActionProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  badge?: string;
}

const QuickAction: React.FC<QuickActionProps> = ({
  title,
  subtitle,
  icon,
  color,
  onPress,
  badge,
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
      <View style={styles.actionHeader}>
        <View style={[styles.actionIcon, { backgroundColor: color + "15" }]}>
          <Ionicons name={icon} size={normalize(20)} color={color} />
        </View>
        {badge && (
          <View
            style={[styles.badge, { backgroundColor: colors.accentOrange }]}
          >
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
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
        size={normalize(16)}
        color={colors.textSecondary}
      />
    </TouchableOpacity>
  );
};

interface ActivityItemProps {
  title: string;
  time: string;
  type: "success" | "warning" | "info" | "error";
  icon: keyof typeof Ionicons.glyphMap;
  subtitle?: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  title,
  time,
  type,
  icon,
  subtitle,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const getTypeColor = () => {
    switch (type) {
      case "success":
        return colors.success;
      case "warning":
        return colors.warning;
      case "error":
        return colors.error;
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
        <Ionicons name={icon} size={normalize(14)} color={getTypeColor()} />
      </View>
      <View style={styles.activityContent}>
        <Text style={[styles.activityTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.activitySubtitle, { color: colors.textSecondary }]}
          >
            {subtitle}
          </Text>
        )}
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
      icon: "school" as const,
      color: colors.accentOrange,
      subtitle: "Active enrollments",
    },
    {
      title: "Active Teachers",
      value: "24",
      change: "+2",
      isPositive: true,
      icon: "people" as const,
      color: colors.accentTeal,
      subtitle: "This month",
    },
    {
      title: "Classes Today",
      value: "18",
      change: "3",
      isPositive: true,
      icon: "library" as const,
      color: colors.success,
      subtitle: "Scheduled",
    },
    {
      title: "Attendance Rate",
      value: "94.2%",
      change: "+2.1%",
      isPositive: true,
      icon: "calendar" as const,
      color: colors.warning,
      subtitle: "This week",
    },
  ];

  const quickActions = [
    {
      title: "Add Student",
      subtitle: "Register new student",
      icon: "person-add" as const,
      color: colors.accentOrange,
      onPress: () => router.push("/admin/students/add" as any),
      badge: "New",
    },
    {
      title: "Manage Classes",
      subtitle: "View & edit classes",
      icon: "library" as const,
      color: colors.accentTeal,
      onPress: () => router.push("/admin/classes" as any),
    },
    {
      title: "Attendance",
      subtitle: "Track daily attendance",
      icon: "calendar" as const,
      color: colors.success,
      onPress: () => router.push("/admin/attendance" as any),
    },
    {
      title: "Reports",
      subtitle: "Analytics & insights",
      icon: "bar-chart" as const,
      color: colors.warning,
      onPress: () => router.push("/admin/reports" as any),
    },
  ];

  const recentActivity = [
    {
      title: "New student enrolled",
      subtitle: "Ahmed Hassan - Grade 6",
      time: "2 hours ago",
      type: "success" as const,
      icon: "person-add" as const,
    },
    {
      title: "Class schedule updated",
      subtitle: "Quran Studies - Room 3",
      time: "4 hours ago",
      type: "info" as const,
      icon: "calendar" as const,
    },
    {
      title: "Teacher on leave",
      subtitle: "Fatima Al-Zahra - 3 days",
      time: "1 day ago",
      type: "warning" as const,
      icon: "alert-circle" as const,
    },
    {
      title: "Monthly report generated",
      subtitle: "December 2024",
      time: "2 days ago",
      type: "success" as const,
      icon: "document-text" as const,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.primaryBackground }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            Welcome back,
          </Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Administrator
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.notificationButton,
            { backgroundColor: colors.surface },
          ]}
          onPress={() => router.push("/shared/notifications" as any)}
        >
          <Ionicons
            name="notifications"
            size={normalize(20)}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
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
            styles.activityContainer,
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: normalize(20),
    paddingTop: normalize(16),
    paddingBottom: normalize(24),
  },
  greeting: {
    fontSize: normalize(14),
    marginBottom: normalize(4),
  },
  title: {
    fontSize: normalize(24),
    fontWeight: "700",
  },
  notificationButton: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(22),
    justifyContent: "center",
    alignItems: "center",
  },
  statsSection: {
    paddingHorizontal: normalize(20),
    marginBottom: normalize(32),
  },
  sectionTitle: {
    fontSize: normalize(18),
    fontWeight: "600",
    marginBottom: normalize(16),
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: normalize(12),
  },
  statCard: {
    width: (width - normalize(52)) / 2,
    padding: normalize(16),
    borderRadius: normalize(16),
    borderWidth: normalize(1),
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: normalize(12),
  },
  iconContainer: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
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
  statSubtitle: {
    fontSize: normalize(12),
    marginTop: normalize(2),
  },
  actionsSection: {
    paddingHorizontal: normalize(20),
    marginBottom: normalize(32),
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: normalize(12),
  },
  quickActionCard: {
    width: (width - normalize(52)) / 2,
    padding: normalize(16),
    borderRadius: normalize(16),
    borderWidth: normalize(1),
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(12),
  },
  actionHeader: {
    position: "relative",
  },
  actionIcon: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -normalize(4),
    right: -normalize(4),
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(2),
    borderRadius: normalize(8),
  },
  badgeText: {
    color: "#fff",
    fontSize: normalize(10),
    fontWeight: "600",
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: normalize(14),
    fontWeight: "600",
    marginBottom: normalize(2),
  },
  actionSubtitle: {
    fontSize: normalize(12),
  },
  activitySection: {
    paddingHorizontal: normalize(20),
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
  activityContainer: {
    borderRadius: normalize(16),
    borderWidth: normalize(1),
    padding: normalize(16),
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: normalize(12),
    paddingVertical: normalize(12),
    borderBottomWidth: normalize(1),
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  activityIcon: {
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(14),
    justifyContent: "center",
    alignItems: "center",
    marginTop: normalize(2),
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: normalize(14),
    fontWeight: "500",
    marginBottom: normalize(2),
  },
  activitySubtitle: {
    fontSize: normalize(12),
    marginBottom: normalize(2),
  },
  activityTime: {
    fontSize: normalize(11),
  },
  bottomSpacing: {
    height: normalize(20),
  },
});
