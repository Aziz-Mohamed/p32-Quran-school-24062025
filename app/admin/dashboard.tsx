import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Card from "@/components/ui/Card";
import { useThemeColor } from "@/hooks/useThemeColor";
import { normalize } from "@/utils/normalize";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function AdminDashboard() {
  const router = useRouter();
  const surface = useThemeColor("surface");
  const textPrimary = useThemeColor("textPrimary");
  const textSecondary = useThemeColor("textSecondary");
  const accentOrange = useThemeColor("accentOrange");
  const success = useThemeColor("success");
  const border = useThemeColor("border");

  // WiFi Configuration State
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [ssid, setSsid] = useState("QuranSchool_WiFi");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);

  // Quick Stats
  const stats = {
    totalStudents: 156,
    totalTeachers: 12,
    activeClasses: 8,
    todayAttendance: 142,
  };

  const handleNavigation = (path: string) => {
    router.push(`/admin/${path}` as any);
  };

  const handleWifiToggle = (value: boolean) => {
    setWifiEnabled(value);
    Alert.alert(
      "WiFi Status",
      `WiFi has been ${value ? "enabled" : "disabled"}`,
      [{ text: "OK" }]
    );
  };

  const handleSaveWifi = () => {
    Alert.alert("Success", "WiFi configuration saved successfully!", [
      { text: "OK" },
    ]);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Section */}
        <ThemedView style={styles.welcomeSection}>
          <ThemedText type="title" style={styles.welcomeTitle}>
            Welcome Back
          </ThemedText>
          <ThemedText
            type="subtitle"
            style={[styles.welcomeSubtitle, { color: textSecondary }]}
          >
            Manage your Quran school efficiently
          </ThemedText>
        </ThemedView>

        {/* Quick Stats */}
        <ThemedView style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => handleNavigation("students")}
          >
            <ThemedView
              style={[
                styles.statIcon,
                { backgroundColor: `${accentOrange}20` },
              ]}
            >
              <Ionicons
                name="school"
                size={normalize(24)}
                color={accentOrange}
              />
            </ThemedView>
            <ThemedText type="title" style={styles.statNumber}>
              {stats.totalStudents}
            </ThemedText>
            <ThemedText
              type="default"
              style={[styles.statLabel, { color: textSecondary }]}
            >
              Students
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => handleNavigation("teachers")}
          >
            <ThemedView
              style={[styles.statIcon, { backgroundColor: `${success}20` }]}
            >
              <Ionicons name="people" size={normalize(24)} color={success} />
            </ThemedView>
            <ThemedText type="title" style={styles.statNumber}>
              {stats.totalTeachers}
            </ThemedText>
            <ThemedText
              type="default"
              style={[styles.statLabel, { color: textSecondary }]}
            >
              Teachers
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => handleNavigation("classes")}
          >
            <ThemedView
              style={[
                styles.statIcon,
                { backgroundColor: `${accentOrange}20` },
              ]}
            >
              <Ionicons
                name="library"
                size={normalize(24)}
                color={accentOrange}
              />
            </ThemedView>
            <ThemedText type="title" style={styles.statNumber}>
              {stats.activeClasses}
            </ThemedText>
            <ThemedText
              type="default"
              style={[styles.statLabel, { color: textSecondary }]}
            >
              Classes
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => handleNavigation("attendance")}
          >
            <ThemedView
              style={[styles.statIcon, { backgroundColor: `${success}20` }]}
            >
              <Ionicons
                name="checkmark-circle"
                size={normalize(24)}
                color={success}
              />
            </ThemedView>
            <ThemedText type="title" style={styles.statNumber}>
              {stats.todayAttendance}
            </ThemedText>
            <ThemedText
              type="default"
              style={[styles.statLabel, { color: textSecondary }]}
            >
              Today&apos;s Attendance
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* WiFi Configuration */}
        <Card style={styles.wifiSection}>
          <ThemedView style={styles.sectionHeader}>
            <Ionicons name="wifi" size={normalize(20)} color={accentOrange} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              WiFi Configuration
            </ThemedText>
            <Switch
              value={wifiEnabled}
              onValueChange={handleWifiToggle}
              trackColor={{ false: textSecondary, true: accentOrange }}
              thumbColor="#fff"
            />
          </ThemedView>

          {wifiEnabled && (
            <ThemedView style={styles.wifiForm}>
              <ThemedView style={styles.inputContainer}>
                <ThemedText
                  type="default"
                  style={[styles.inputLabel, { color: textSecondary }]}
                >
                  Network Name (SSID)
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: surface,
                      color: textPrimary,
                      borderColor: border,
                    },
                  ]}
                  value={ssid}
                  onChangeText={setSsid}
                  placeholder="Enter network name"
                  placeholderTextColor={textSecondary}
                />
              </ThemedView>

              <ThemedView style={styles.inputContainer}>
                <ThemedText
                  type="default"
                  style={[styles.inputLabel, { color: textSecondary }]}
                >
                  Password
                </ThemedText>
                <ThemedView style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      {
                        backgroundColor: surface,
                        color: textPrimary,
                        borderColor: border,
                      },
                    ]}
                    value={showPassword ? password : "••••••••"}
                    onChangeText={setPassword}
                    placeholder="Enter password"
                    placeholderTextColor={textSecondary}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={togglePasswordVisibility}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={normalize(20)}
                      color={textSecondary}
                    />
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: accentOrange }]}
                onPress={handleSaveWifi}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.saveButtonText}
                >
                  Save Configuration
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick Actions
          </ThemedText>

          <ThemedView style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleNavigation("students/add")}
            >
              <ThemedView
                style={[
                  styles.actionIcon,
                  { backgroundColor: `${accentOrange}20` },
                ]}
              >
                <Ionicons
                  name="person-add"
                  size={normalize(24)}
                  color={accentOrange}
                />
              </ThemedView>
              <ThemedText type="defaultSemiBold" style={styles.actionText}>
                Add Student
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleNavigation("teachers/add")}
            >
              <ThemedView
                style={[styles.actionIcon, { backgroundColor: `${success}20` }]}
              >
                <Ionicons
                  name="person-add"
                  size={normalize(24)}
                  color={success}
                />
              </ThemedView>
              <ThemedText type="defaultSemiBold" style={styles.actionText}>
                Add Teacher
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleNavigation("classes/add")}
            >
              <ThemedView
                style={[
                  styles.actionIcon,
                  { backgroundColor: `${accentOrange}20` },
                ]}
              >
                <Ionicons
                  name="add-circle"
                  size={normalize(24)}
                  color={accentOrange}
                />
              </ThemedView>
              <ThemedText type="defaultSemiBold" style={styles.actionText}>
                Create Class
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleNavigation("attendance")}
            >
              <ThemedView
                style={[styles.actionIcon, { backgroundColor: `${success}20` }]}
              >
                <Ionicons
                  name="calendar"
                  size={normalize(24)}
                  color={success}
                />
              </ThemedView>
              <ThemedText type="defaultSemiBold" style={styles.actionText}>
                Take Attendance
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: normalize(20),
    paddingTop: normalize(60),
    paddingBottom: normalize(100),
  },
  welcomeSection: {
    marginBottom: normalize(24),
  },
  welcomeTitle: {
    marginBottom: normalize(4),
  },
  welcomeSubtitle: {
    fontSize: normalize(16),
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: normalize(12),
    marginBottom: normalize(24),
  },
  statCard: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: normalize(16),
    padding: normalize(16),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: normalize(8),
    elevation: 3,
  },
  statIcon: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: normalize(12),
  },
  statNumber: {
    fontSize: normalize(24),
    marginBottom: normalize(4),
  },
  statLabel: {
    fontSize: normalize(14),
    textAlign: "center",
  },
  wifiSection: {
    marginBottom: normalize(24),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: normalize(20),
  },
  sectionTitle: {
    flex: 1,
    marginLeft: normalize(12),
  },
  wifiForm: {
    gap: normalize(16),
  },
  inputContainer: {
    gap: normalize(8),
  },
  inputLabel: {
    fontSize: normalize(14),
  },
  input: {
    borderWidth: 1,
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    fontSize: normalize(16),
    fontWeight: "400",
    fontFamily: "System",
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    paddingRight: normalize(48),
    fontSize: normalize(16),
    fontWeight: "400",
    fontFamily: "System",
  },
  eyeButton: {
    position: "absolute",
    right: normalize(12),
    top: normalize(12),
    width: normalize(24),
    height: normalize(24),
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    paddingVertical: normalize(12),
    borderRadius: normalize(12),
    alignItems: "center",
    marginTop: normalize(8),
  },
  saveButtonText: {
    color: "#fff",
  },
  actionsSection: {
    marginBottom: normalize(24),
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: normalize(12),
    marginTop: normalize(16),
  },
  actionButton: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: normalize(12),
    padding: normalize(16),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: normalize(4),
    elevation: 2,
  },
  actionIcon: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: normalize(8),
  },
  actionText: {
    fontSize: normalize(14),
    textAlign: "center",
  },
});
