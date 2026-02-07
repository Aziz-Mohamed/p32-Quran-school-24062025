import BottomNavBar, { BottomNavItem } from "@/components/ui/BottomNavBar";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Slot, usePathname, useRouter } from "expo-router";
import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const backgroundColor = useThemeColor("primaryBackground");

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

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Status Bar - Matches app background */}
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle="dark-content"
        translucent={false}
      />

      {/* Main Content - Uses full screen */}
      <Slot />

      {/* Floating Bottom Navigation - Has its own safe area */}
      <BottomNavBar items={navItems} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
