import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TeacherDashboard() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Teacher Dashboard</Text>
        <Text style={styles.subtitle}>Welcome, Ustadh Ahmed</Text>
      </View>

      {/* Check In Section */}
      <View style={styles.checkInSection}>
        <TouchableOpacity style={styles.checkInButton}>
          <Text style={styles.checkInButtonText}>[Check In]</Text>
        </TouchableOpacity>
        <Text style={styles.checkInStatus}>[WiFi Status: Connected]</Text>
      </View>

      {/* Today's Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.overviewCards}>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewNumber}>[10]</Text>
            <Text style={styles.overviewLabel}>Students</Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewNumber}>[3]</Text>
            <Text style={styles.overviewLabel}>Sessions</Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewNumber}>[85%]</Text>
            <Text style={styles.overviewLabel}>Attendance</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionCardText}>[My Students]</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionCardText}>[Session Log]</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionCardText}>[Award Sticker]</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionCardText}>[Class Progress]</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Alerts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alerts</Text>
        <View style={styles.alertList}>
          <View style={styles.alertItem}>
            <Text style={styles.alertText}>[2 students need support]</Text>
          </View>
          <View style={styles.alertItem}>
            <Text style={styles.alertText}>[3 students ready for praise]</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF7",
  },
  header: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  checkInSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
    alignItems: "center",
  },
  checkInButton: {
    backgroundColor: "#3A7D5D",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 8,
  },
  checkInButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  checkInStatus: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  overviewCards: {
    flexDirection: "row",
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3A7D5D",
  },
  overviewLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionCardText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  alertList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  alertItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  alertText: {
    fontSize: 14,
  },
});
