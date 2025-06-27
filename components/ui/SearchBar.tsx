import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { normalize } from "@/utils/normalize";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput } from "react-native";

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
}: SearchBarProps) {
  const surface = useThemeColor("surface");
  const textPrimary = useThemeColor("textPrimary");
  const textSecondary = useThemeColor("textSecondary");

  return (
    <ThemedView style={[styles.container, { backgroundColor: surface }]}>
      <Ionicons
        name="search"
        size={normalize(20)}
        color={textSecondary}
        style={styles.icon}
      />
      <TextInput
        style={[styles.input, { color: textPrimary }]}
        placeholder={placeholder}
        placeholderTextColor={textSecondary}
        value={value}
        onChangeText={onChangeText}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    marginBottom: normalize(20),
  },
  icon: {
    marginRight: normalize(12),
  },
  input: {
    flex: 1,
    fontSize: normalize(16),
    fontWeight: "400",
    fontFamily: "System",
  },
});
