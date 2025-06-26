import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ParentDashboard() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Parent Dashboard</Text>
        <Text style={styles.subtitle}>Child: Fatimah Ahmed</Text>
      </View>

      {/* Child Overview */}
      <View style={styles.overviewSection}>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>[95%]</Text>
          <Text style={styles.overviewLabel}>Attendance</Text>
        </View>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>[4.2]</Text>
          <Text style={styles.overviewLabel}>Avg Rating</Text>
        </View>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>[8]</Text>
          <Text style={styles.overviewLabel}>Stickers</Text>
        </View>
      </View>

      {/* Current Homework */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Homework</Text>
        <View style={styles.homeworkCard}>
          <Text style={styles.homeworkTitle}>[Surah Al-Baqarah: 1-10]</Text>
          <Text style={styles.homeworkDescription}>
            [Memorize and recite with tajweed]
          </Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressText}>[75% Complete]</Text>
        </View>
      </View>

      {/* Last Session */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Last Session</Text>
        <View style={styles.sessionCard}>
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionDate}>[March 15, 2024]</Text>
            <View style={styles.stars}>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.starEmpty}>☆</Text>
            </View>
          </View>
          <Text style={styles.teacherNote}>
            [Teacher's Note: Excellent recitation, good tajweed]
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionCardText}>[Attendance]</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionCardText}>[Sessions]</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionCardText}>[Class Standing]</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionCardText}>[Message Teacher]</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>
              [Attended session with Ustadh Ahmed]
            </Text>
            <Text style={styles.activityTime}>[2 days ago]</Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>
              [Received sticker for perfect recitation]
            </Text>
            <Text style={styles.activityTime}>[1 week ago]</Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>
              [Completed homework assignment]
            </Text>
            <Text style={styles.activityTime}>[1 week ago]</Text>
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
  overviewSection: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
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
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  homeworkCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  homeworkTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  homeworkDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3A7D5D",
    borderRadius: 4,
    width: "75%",
  },
  progressText: {
    fontSize: 12,
    color: "#666",
  },
  sessionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sessionDate: {
    fontSize: 14,
    fontWeight: "600",
  },
  stars: {
    flexDirection: "row",
  },
  star: {
    fontSize: 16,
    marginHorizontal: 1,
  },
  starEmpty: {
    fontSize: 16,
    marginHorizontal: 1,
    color: "#ccc",
  },
  teacherNote: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
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
  activityList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activityText: {
    fontSize: 14,
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
    color: "#666",
  },
});
