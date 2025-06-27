import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

const MinimalCard: React.FC<ViewProps> = ({ style, children, ...props }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackgroundLightOrange,
          shadowColor: "#000",
        },
        style,
      ]}
      accessibilityRole="summary"
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 20,
    minWidth: 0,
    minHeight: 0,
    transitionProperty: "box-shadow, background-color",
    transitionDuration: "0.2s",
  },
});

export default MinimalCard;
