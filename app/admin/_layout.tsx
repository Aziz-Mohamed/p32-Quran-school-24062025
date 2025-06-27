import BottomNavBar, { BottomNavItem } from "@/components/ui/BottomNavBar";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { normalize } from "@/utils/normalize";
import { Ionicons } from "@expo/vector-icons";
import { Slot, usePathname, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
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
}

const bottomNavItems: NavItem[] = [
  { name: "Dashboard", path: "dashboard", icon: "grid" },
  { name: "Students", path: "students", icon: "school" },
  { name: "Teachers", path: "teachers", icon: "people" },
  { name: "Classes", path: "classes", icon: "library" },
  { name: "Attendance", path: "attendance", icon: "checkmark-circle" },
];

export default function AdminLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const pathname = usePathname();
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

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
  };

  const getCurrentPageTitle = () => {
    const activeItem = bottomNavItems.find((item) => isActive(item.path));
    return activeItem?.name || "Admin";
  };

  const navItems: BottomNavItem[] = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: "grid",
      onPress: () => handleNavigation("dashboard"),
      active: isActive("dashboard"),
    },
    {
      key: "students",
      label: "Students",
      icon: "school",
      onPress: () => handleNavigation("students"),
      active: isActive("students"),
    },
    {
      key: "teachers",
      label: "Teachers",
      icon: "people",
      onPress: () => handleNavigation("teachers"),
      active: isActive("teachers"),
    },
    {
      key: "classes",
      label: "Classes",
      icon: "library",
      onPress: () => handleNavigation("classes"),
      active: isActive("classes"),
    },
    {
      key: "attendance",
      label: "Attendance",
      icon: "checkmark-circle",
      onPress: () => handleNavigation("attendance"),
      active: isActive("attendance"),
    },
  ];

  const handleSettingsPress = () => {
    setShowSettingsMenu(!showSettingsMenu);
  };

  const handleWifiConfig = () => {
    setShowSettingsMenu(false);
    router.push("/admin/wifi-config" as any);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.primaryBackground }}
    >
      {/* Top Bar */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: colors.primaryBackground,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>
          {getCurrentPageTitle()}
        </Text>

        {/* Settings Menu */}
        <TouchableOpacity
          style={[styles.settingsButton, { backgroundColor: colors.surface }]}
          onPress={handleSettingsPress}
        >
          <Ionicons
            name="settings"
            size={normalize(20)}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Settings Menu Overlay */}
      {showSettingsMenu && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setShowSettingsMenu(false)}
        >
          <View
            style={[styles.settingsMenu, { backgroundColor: colors.surface }]}
          >
            <TouchableOpacity
              style={styles.settingsMenuItem}
              onPress={handleWifiConfig}
            >
              <Ionicons
                name="wifi"
                size={normalize(20)}
                color={colors.textPrimary}
              />
              <Text
                style={[styles.settingsMenuText, { color: colors.textPrimary }]}
              >
                WiFi Configuration
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* Main Content */}
      <View style={{ flex: 1 }}>
        <Slot />
      </View>

      {/* Floating Bottom Navigation */}
      <BottomNavBar items={navItems} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: normalize(56),
    borderBottomWidth: 1,
    paddingHorizontal: normalize(20),
    zIndex: 10,
  },
  pageTitle: {
    fontSize: normalize(24),
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Times New Roman" : "serif",
  },
  settingsButton: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(22),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: normalize(8),
    elevation: 2,
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
  settingsMenu: {
    position: "absolute",
    top: normalize(70),
    right: normalize(20),
    borderRadius: normalize(16),
    padding: normalize(8),
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: normalize(12),
    elevation: 4,
    minWidth: normalize(200),
  },
  settingsMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    borderRadius: normalize(8),
  },
  settingsMenuText: {
    fontSize: normalize(16),
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
    marginLeft: normalize(12),
  },
});
