import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface NavItem {
  name: string;
  path: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: number;
}

const navItems: NavItem[] = [
  { name: "Dashboard", path: "dashboard", icon: "grid-outline" },
  { name: "Students", path: "students", icon: "people-outline" },
  { name: "Teachers", path: "teachers", icon: "person-outline" },
  { name: "Classes", path: "classes", icon: "school-outline" },
  { name: "Attendance", path: "attendance", icon: "calendar-outline" },
  { name: "Reports", path: "reports", icon: "bar-chart-outline" },
  { name: "WiFi Config", path: "wifi-config", icon: "wifi-outline" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleNavigation = (path: string) => {
    router.push(`/admin/${path}` as any);
  };

  const getCurrentPath = () => {
    const segments = pathname.split("/");
    return segments[segments.length - 1] || "dashboard";
  };

  return (
    <>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        translucent={false}
      />
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
        edges={["top", "left", "right"]}
      >
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          {/* Sidebar */}
          {isSidebarOpen && (
            <View
              style={[
                styles.sidebar,
                {
                  backgroundColor: colors.surface,
                  borderRightColor: colors.border,
                },
              ]}
            >
              {/* Header */}
              <View style={styles.sidebarHeader}>
                <View
                  style={[
                    styles.logoContainer,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Ionicons name="book-outline" size={24} color="#fff" />
                </View>
                <Text style={[styles.logoText, { color: colors.textPrimary }]}>
                  Quran School
                </Text>
                <Text
                  style={[styles.adminLabel, { color: colors.textSecondary }]}
                >
                  Admin Panel
                </Text>
              </View>

              {/* Navigation */}
              <ScrollView
                style={styles.navContainer}
                showsVerticalScrollIndicator={false}
              >
                {navItems.map((item) => {
                  const isActive = getCurrentPath() === item.path;
                  return (
                    <TouchableOpacity
                      key={item.path}
                      style={[
                        styles.navItem,
                        isActive && { backgroundColor: colors.primary + "15" },
                      ]}
                      onPress={() => handleNavigation(item.path)}
                    >
                      <View style={styles.navItemContent}>
                        <Ionicons
                          name={item.icon}
                          size={20}
                          color={
                            isActive ? colors.primary : colors.textSecondary
                          }
                        />
                        <Text
                          style={[
                            styles.navItemText,
                            {
                              color: isActive
                                ? colors.primary
                                : colors.textSecondary,
                            },
                          ]}
                        >
                          {item.name}
                        </Text>
                      </View>
                      {item.badge && (
                        <View
                          style={[
                            styles.badge,
                            { backgroundColor: colors.accent },
                          ]}
                        >
                          <Text style={styles.badgeText}>{item.badge}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Footer */}
              <View style={styles.sidebarFooter}>
                <TouchableOpacity style={styles.profileButton}>
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: colors.secondary },
                    ]}
                  >
                    <Ionicons
                      name="person"
                      size={16}
                      color={colors.textPrimary}
                    />
                  </View>
                  <View style={styles.profileInfo}>
                    <Text
                      style={[
                        styles.profileName,
                        { color: colors.textPrimary },
                      ]}
                    >
                      Admin User
                    </Text>
                    <Text
                      style={[
                        styles.profileRole,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Administrator
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Top Bar */}
            <View
              style={[
                styles.topBar,
                {
                  backgroundColor: colors.surface,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <TouchableOpacity
                onPress={toggleSidebar}
                style={styles.menuButton}
              >
                <Ionicons name="menu" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>
                {navItems.find((item) => getCurrentPath() === item.path)
                  ?.name || "Admin"}
              </Text>
              <View style={styles.topBarActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons
                    name="settings-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Content Area */}
            <View style={styles.content}>{children}</View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 280,
    borderRightWidth: 1,
    flexDirection: "column",
  },
  sidebarHeader: {
    padding: 24,
    paddingBottom: 16,
    alignItems: "center",
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  adminLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  navContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  navItem: {
    borderRadius: 12,
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  navItemText: {
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 12,
  },
  badge: {
    position: "absolute",
    right: 16,
    top: 12,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  sidebarFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 14,
    fontWeight: "600",
  },
  profileRole: {
    fontSize: 12,
  },
  mainContent: {
    flex: 1,
    flexDirection: "column",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    minHeight: 64,
  },
  menuButton: {
    padding: 8,
    marginRight: 16,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
  },
  topBarActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 24,
  },
});
