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
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  gradient: string[];
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  gradient,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={styles.statCard}>
      <View style={[styles.iconCircle, { backgroundColor: gradient[0] }]}>
        <Ionicons name={icon} size={normalize(24)} color="#fff" />
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

interface ActionCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  icon,
  color,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <TouchableOpacity
      style={[styles.actionCard, { backgroundColor: colors.surface }]}
      onPress={onPress}
    >
      <View style={[styles.actionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={normalize(28)} color="#fff" />
      </View>
      <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default function AdminDashboard() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const stats = [
    {
      title: "Students",
      value: "1,247",
      icon: "school" as const,
      color: colors.accentOrange,
      gradient: ["#FF9800", "#FFB74D"],
    },
    {
      title: "Teachers",
      value: "24",
      icon: "people" as const,
      color: colors.accentTeal,
      gradient: ["#4DB6AC", "#80CBC4"],
    },
    {
      title: "Classes",
      value: "18",
      icon: "library" as const,
      color: colors.success,
      gradient: ["#81C784", "#A5D6A7"],
    },
    {
      title: "Attendance",
      value: "94%",
      icon: "checkmark-circle" as const,
      color: colors.warning,
      gradient: ["#FFB74D", "#FFCC80"],
    },
  ];

  const actions = [
    {
      title: "Add Student",
      icon: "person-add" as const,
      color: colors.accentOrange,
      onPress: () => router.push("/admin/students/add" as any),
    },
    {
      title: "Add Teacher",
      icon: "person-add" as const,
      color: colors.accentTeal,
      onPress: () => router.push("/admin/teachers/add" as any),
    },
    {
      title: "View Classes",
      icon: "library" as const,
      color: colors.success,
      onPress: () => router.push("/admin/classes" as any),
    },
    {
      title: "Reports",
      icon: "bar-chart" as const,
      color: colors.warning,
      onPress: () => router.push("/admin/reports" as any),
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.primaryBackground }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            Welcome back! 👋
          </Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Admin Dashboard
          </Text>
        </View>
        <View
          style={[
            styles.profileCircle,
            { backgroundColor: colors.accentOrange },
          ]}
        >
          <Text style={styles.profileText}>A</Text>
        </View>
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
          {actions.map((action, index) => (
            <ActionCard key={index} {...action} />
          ))}
        </View>
      </View>

      {/* Today's Highlight */}
      <View style={styles.highlightSection}>
        <View
          style={[styles.highlightCard, { backgroundColor: colors.surface }]}
        >
          <View style={styles.highlightHeader}>
            <Ionicons
              name="sunny"
              size={normalize(24)}
              color={colors.accentOrange}
            />
            <Text
              style={[styles.highlightTitle, { color: colors.textPrimary }]}
            >
              Today's Focus
            </Text>
          </View>
          <Text style={[styles.highlightText, { color: colors.textSecondary }]}>
            You have 3 classes scheduled today. Great day for learning! 📚
          </Text>
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
    paddingHorizontal: normalize(24),
    paddingTop: normalize(20),
    paddingBottom: normalize(32),
  },
  greeting: {
    fontSize: normalize(16),
    marginBottom: normalize(4),
  },
  title: {
    fontSize: normalize(28),
    fontWeight: "700",
  },
  profileCircle: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    justifyContent: "center",
    alignItems: "center",
  },
  profileText: {
    color: "#fff",
    fontSize: normalize(20),
    fontWeight: "700",
  },
  statsSection: {
    paddingHorizontal: normalize(24),
    marginBottom: normalize(40),
  },
  sectionTitle: {
    fontSize: normalize(20),
    fontWeight: "600",
    marginBottom: normalize(20),
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: normalize(16),
  },
  statCard: {
    width: (width - normalize(80)) / 2,
    padding: normalize(20),
    borderRadius: normalize(20),
    backgroundColor: "#fff",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(28),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: normalize(12),
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
    paddingHorizontal: normalize(24),
    marginBottom: normalize(40),
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: normalize(16),
  },
  actionCard: {
    width: (width - normalize(80)) / 2,
    padding: normalize(24),
    borderRadius: normalize(20),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(28),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: normalize(12),
  },
  actionTitle: {
    fontSize: normalize(16),
    fontWeight: "600",
    textAlign: "center",
  },
  highlightSection: {
    paddingHorizontal: normalize(24),
    marginBottom: normalize(40),
  },
  highlightCard: {
    padding: normalize(24),
    borderRadius: normalize(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  highlightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: normalize(12),
  },
  highlightTitle: {
    fontSize: normalize(18),
    fontWeight: "600",
    marginLeft: normalize(12),
  },
  highlightText: {
    fontSize: normalize(16),
    lineHeight: normalize(24),
  },
  bottomSpacing: {
    height: normalize(20),
  },
});
