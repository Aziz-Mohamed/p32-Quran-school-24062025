import React from "react";
import { StyleSheet, View } from "react-native";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View style={styles.container}>
      {/* TODO: Student navigation/sidebar goes here */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    minHeight: "100%",
  },
  content: {
    flex: 1,
    padding: 24,
  },
});
