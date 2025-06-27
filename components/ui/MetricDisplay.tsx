import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Card from "@/components/ui/Card";
import { useThemeColor } from "@/hooks/useThemeColor";
import { normalize } from "@/utils/normalize";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet } from "react-native";

export interface MetricDisplayProps {
  attendance: number;
  recitingRate: number;
  trophies: number;
}

export function MetricDisplay({
  attendance,
  recitingRate,
  trophies,
}: MetricDisplayProps) {
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
    <Card style={styles.container}>
      <ThemedView style={styles.metrics}>
        {/* Attendance */}
        <ThemedView style={styles.metric}>
          <ThemedView style={styles.metricIcon}>
            <Ionicons
              name="calendar"
              size={normalize(24)}
              color={getMetricColor(attendance)}
            />
          </ThemedView>
          <ThemedView style={styles.metricContent}>
            <ThemedText
              style={[
                styles.metricValue,
                { color: getMetricColor(attendance) },
              ]}
            >
              {attendance}%
            </ThemedText>
            <ThemedText style={[styles.metricLabel, { color: textSecondary }]}>
              Attendance
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Reciting Rate */}
        <ThemedView style={styles.metric}>
          <ThemedView style={styles.metricIcon}>
            <Ionicons
              name="book"
              size={normalize(24)}
              color={getMetricColor(recitingRate)}
            />
          </ThemedView>
          <ThemedView style={styles.metricContent}>
            <ThemedText
              style={[
                styles.metricValue,
                { color: getMetricColor(recitingRate) },
              ]}
            >
              {recitingRate}%
            </ThemedText>
            <ThemedText style={[styles.metricLabel, { color: textSecondary }]}>
              Reciting Rate
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Trophies */}
        <ThemedView style={styles.metric}>
          <ThemedView style={styles.metricIcon}>
            <Ionicons name="trophy" size={normalize(24)} color={accentOrange} />
          </ThemedView>
          <ThemedView style={styles.metricContent}>
            <ThemedText style={[styles.metricValue, { color: accentOrange }]}>
              {trophies}
            </ThemedText>
            <ThemedText style={[styles.metricLabel, { color: textSecondary }]}>
              Trophies
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: normalize(24),
  },
  metrics: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  metric: {
    alignItems: "center",
    flex: 1,
  },
  metricIcon: {
    marginBottom: normalize(8),
  },
  metricContent: {
    alignItems: "center",
  },
  metricValue: {
    fontSize: normalize(24),
    fontWeight: "700",
    marginBottom: normalize(4),
  },
  metricLabel: {
    fontSize: normalize(14),
    textAlign: "center",
  },
});
