import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Card from "@/components/ui/Card";
import { useThemeColor } from "@/hooks/useThemeColor";
import { normalize } from "@/utils/normalize";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

export interface StudentCardProps {
  id: string;
  name: string;
  grade: string;
  avatar: string;
  attendance: number;
  recitingRate: number;
  trophies: number;
  onPress: (id: string) => void;
}

export function StudentCard({
  id,
  name,
  grade,
  avatar,
  attendance,
  recitingRate,
  trophies,
  onPress,
}: StudentCardProps) {
  const cardBackground = useThemeColor("card");
  const textSecondary = useThemeColor("textSecondary");
  const accentOrange = useThemeColor("accentOrange");
  const success = useThemeColor("success");
  const warning = useThemeColor("warning");

  const getMetricColor = (value: number) => {
    if (value >= 80) return success;
    if (value >= 60) return warning;
    return textSecondary;
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(id)}
      activeOpacity={0.7}
      style={styles.container}
    >
      <Card style={styles.card}>
        <ThemedView row style={styles.header}>
          <ThemedView style={styles.avatarContainer}>
            <ThemedText style={styles.avatar}>{avatar}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.info}>
            <ThemedText type="defaultSemiBold" style={styles.name}>
              {name}
            </ThemedText>
            <ThemedText
              type="subtitle"
              style={[styles.grade, { color: textSecondary }]}
            >
              {grade}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.metrics}>
          {/* Attendance */}
          <ThemedView style={styles.metric}>
            <ThemedView style={styles.metricHeader}>
              <Ionicons
                name="calendar"
                size={normalize(16)}
                color={getMetricColor(attendance)}
              />
              <ThemedText
                style={[
                  styles.metricValue,
                  { color: getMetricColor(attendance) },
                ]}
              >
                {attendance}%
              </ThemedText>
            </ThemedView>
            <ThemedText style={[styles.metricLabel, { color: textSecondary }]}>
              Attendance
            </ThemedText>
          </ThemedView>

          {/* Reciting Rate */}
          <ThemedView style={styles.metric}>
            <ThemedView style={styles.metricHeader}>
              <Ionicons
                name="book"
                size={normalize(16)}
                color={getMetricColor(recitingRate)}
              />
              <ThemedText
                style={[
                  styles.metricValue,
                  { color: getMetricColor(recitingRate) },
                ]}
              >
                {recitingRate}%
              </ThemedText>
            </ThemedView>
            <ThemedText style={[styles.metricLabel, { color: textSecondary }]}>
              Reciting Rate
            </ThemedText>
          </ThemedView>

          {/* Trophies */}
          <ThemedView style={styles.metric}>
            <ThemedView style={styles.metricHeader}>
              <Ionicons
                name="trophy"
                size={normalize(16)}
                color={accentOrange}
              />
              <ThemedText style={[styles.metricValue, { color: accentOrange }]}>
                {trophies}
              </ThemedText>
            </ThemedView>
            <ThemedText style={[styles.metricLabel, { color: textSecondary }]}>
              Trophies
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: normalize(14),
  },
  card: {
    padding: normalize(16),
  },
  header: {
    alignItems: "center",
    marginBottom: normalize(16),
  },
  avatarContainer: {
    marginRight: normalize(12),
    width: normalize(48),
    height: normalize(48),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: normalize(24),
    backgroundColor: "rgba(255, 215, 0, 0.1)", // Light gold background
  },
  avatar: {
    fontSize: normalize(32),
    lineHeight: normalize(32),
    textAlign: "center",
    textAlignVertical: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    marginBottom: normalize(4),
  },
  grade: {
    fontSize: normalize(14),
  },
  metrics: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metric: {
    alignItems: "center",
    flex: 1,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: normalize(4),
  },
  metricValue: {
    fontSize: normalize(16),
    fontWeight: "600",
    marginLeft: normalize(4),
  },
  metricLabel: {
    fontSize: normalize(12),
    textAlign: "center",
  },
});
