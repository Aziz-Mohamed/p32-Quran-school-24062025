import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface NavItem {
  name: string;
  path: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const navItems: NavItem[] = [
  { name: "Dashboard", path: "dashboard", icon: "grid" },
  { name: "Students", path: "students", icon: "school" },
  { name: "Teachers", path: "teachers", icon: "people" },
  { name: "Classes", path: "classes", icon: "library" },
  { name: "Attendance", path: "attendance", icon: "calendar" },
  { name: "Reports", path: "reports", icon: "bar-chart" },
  { name: "WiFi Config", path: "wifi-config", icon: "wifi" },
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarAnimation = useRef(new Animated.Value(0)).current;

  const isActive = (path: string) => {
    if (path === "dashboard") {
      return (
        pathname === "/admin" ||
        pathname === "/admin/" ||
        pathname === "/admin/dashboard"
      );
    }
    return pathname.includes(`/admin/${path}`);
  };

  const handleNavigation = (path: string) => {
    if (path === "dashboard") {
      router.push("/admin/dashboard" as any);
    } else {
      router.push(`/admin/${path}` as any);
    }
    closeSidebar();
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
    Animated.spring(sidebarAnimation, {
      toValue: 1,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  const closeSidebar = () => {
    Animated.spring(sidebarAnimation, {
      toValue: 0,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start(() => {
      setIsSidebarOpen(false);
    });
  };

  const getCurrentPageTitle = () => {
    const activeItem = navItems.find((item) => isActive(item.path));
    return activeItem?.name || "Admin";
  };

  return (
    <>
      <StatusBar
        backgroundColor={colors.primaryBackground}
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        translucent={false}
      />
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.primaryBackground }]}
        edges={["top", "left", "right"]}
      >
        {/* Overlay */}
        {isSidebarOpen && (
          <TouchableWithoutFeedback onPress={closeSidebar}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
        )}

        {/* Animated Sidebar */}
        <Animated.View
          style={[
            styles.sidebar,
            {
              backgroundColor: colors.surface,
              transform: [
                {
                  translateX: sidebarAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-280, 0],
                  }),
                },
              ],
              opacity: sidebarAnimation,
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeSidebar}
            accessibilityLabel="Close menu"
          >
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View
              style={[
                styles.profileAvatar,
                { backgroundColor: colors.accentTeal },
              ]}
            >
              <Text style={styles.profileAvatarText}>A</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.textPrimary }]}>
                Admin
              </Text>
              <Text
                style={[styles.profileRole, { color: colors.textSecondary }]}
              >
                Administrator
              </Text>
            </View>
          </View>

          {/* Navigation Items */}
          <View style={styles.navSection}>
            {navItems.map((item) => (
              <TouchableOpacity
                key={item.path}
                style={[
                  styles.navItem,
                  isActive(item.path) && {
                    backgroundColor: colors.cardBackgroundLightOrange,
                  },
                ]}
                onPress={() => handleNavigation(item.path)}
                accessibilityLabel={item.name}
              >
                <View style={styles.navItemContent}>
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={
                      isActive(item.path)
                        ? colors.accentOrange
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.navItemText,
                      {
                        color: isActive(item.path)
                          ? colors.accentOrange
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {item.name}
                  </Text>
                </View>
                {isActive(item.path) && (
                  <View
                    style={[
                      styles.activeIndicator,
                      { backgroundColor: colors.accentOrange },
                    ]}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Top Bar */}
        <View style={styles.topBarWrap}>
          <View style={[styles.topBar, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={styles.hamburgerButton}
              onPress={openSidebar}
              accessibilityLabel="Open menu"
            >
              <Ionicons name="menu" size={24} color={colors.accentOrange} />
            </TouchableOpacity>
            <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>
              {getCurrentPageTitle()}
            </Text>
            <View style={styles.topBarActions}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.cardBackgroundLightBlue },
                ]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={colors.accentTeal}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.cardBackgroundLightBlue },
                ]}
              >
                <Ionicons
                  name="settings-outline"
                  size={22}
                  color={colors.accentTeal}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View
          style={[
            styles.mainContent,
            { backgroundColor: colors.primaryBackground },
          ]}
        >
          {children}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFAF7",
  },
  hamburgerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 40,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    zIndex: 45,
    paddingTop: 80,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  closeButton: {
    position: "absolute",
    top: 24,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.08)",
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  profileAvatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 20,
    fontFamily: Platform.OS === "ios" ? "Times New Roman" : "serif",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontWeight: "700",
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Times New Roman" : "serif",
  },
  profileRole: {
    fontWeight: "500",
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  navSection: {
    flex: 1,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  navItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  navItemText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  activeIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  topBarWrap: {
    backgroundColor: "#FAFAF7",
    paddingTop: Platform.OS === "android" ? 8 : 0,
    paddingBottom: 8,
    zIndex: 10,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  pageTitle: {
    fontFamily: Platform.OS === "ios" ? "Times New Roman" : "serif",
    fontSize: 22,
    fontWeight: "700",
    color: "#2D1E10",
    flex: 1,
    textAlign: "left",
  },
  topBarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    backgroundColor: "#F2F8F7",
    borderRadius: 16,
    padding: 8,
    marginLeft: 4,
  },
  mainContent: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FAFAF7",
  },
});
