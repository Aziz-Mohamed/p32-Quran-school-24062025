import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function StudentDashboard() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Progress</Text>
        <Text style={styles.subtitle}>Welcome, Fatimah</Text>
      </View>

      {/* Points & Level */}
      <View style={styles.pointsSection}>
        <View style={styles.pointsCard}>
          <Text style={styles.pointsNumber}>[1,250]</Text>
          <Text style={styles.pointsLabel}>Points</Text>
        </View>
        <View style={styles.levelCard}>
          <Text style={styles.levelNumber}>[Level 5]</Text>
          <Text style={styles.levelLabel}>Qari</Text>
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

      {/* Last Session Rating */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Last Session</Text>
        <View style={styles.ratingCard}>
          <Text style={styles.ratingLabel}>Recitation Rating</Text>
          <View style={styles.stars}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.starEmpty}>☆</Text>
          </View>
          <Text style={styles.ratingText}>[Great job! Keep practicing]</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionCardText}>[My Sessions]</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionCardText}>[Leaderboard]</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionCardText}>[My Stickers]</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionCardText}>[Lessons]</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        <View style={styles.achievementList}>
          <View style={styles.achievementItem}>
            <Text style={styles.achievementText}>[🏆 Perfect Recitation]</Text>
            <Text style={styles.achievementTime}>[2 days ago]</Text>
          </View>
          <View style={styles.achievementItem}>
            <Text style={styles.achievementText}>[⭐ 5-Star Rating]</Text>
            <Text style={styles.achievementTime}>[1 week ago]</Text>
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
  pointsSection: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  pointsCard: {
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
  pointsNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#F5C16C",
  },
  pointsLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  levelCard: {
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
  levelNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3A7D5D",
  },
  levelLabel: {
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
  ratingCard: {
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
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  stars: {
    flexDirection: "row",
    marginBottom: 8,
  },
  star: {
    fontSize: 24,
    marginHorizontal: 2,
  },
  starEmpty: {
    fontSize: 24,
    marginHorizontal: 2,
    color: "#ccc",
  },
  ratingText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
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
  achievementList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  achievementItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  achievementText: {
    fontSize: 14,
    flex: 1,
  },
  achievementTime: {
    fontSize: 12,
    color: "#666",
  },
});
