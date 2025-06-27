import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View, ViewProps } from "react-native";

interface MinimalListItemProps extends ViewProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}

const MinimalListItem: React.FC<MinimalListItemProps> = ({
  left,
  right,
  title,
  subtitle,
  style,
  onPress,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={({ pressed: isPressed }) => [
        styles.row,
        {
          backgroundColor:
            isPressed || pressed
              ? colors.cardBackgroundLightBlue
              : "transparent",
          borderRadius: 16,
        },
        style,
      ]}
      accessibilityRole={onPress ? "button" : undefined}
      {...props}
    >
      {left && <View style={styles.left}>{left}</View>}
      <View style={styles.center}>
        <Text
          style={[
            styles.title,
            {
              color: colors.textPrimary,
              fontFamily: "serif",
              fontWeight: "700",
            },
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
                fontFamily: "System",
                fontWeight: "400",
              },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {right && <View style={styles.right}>{right}</View>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 12,
    minHeight: 56,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  left: {
    marginRight: 16,
  },
  center: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    marginTop: 2,
  },
  right: {
    marginLeft: 16,
  },
});

export default MinimalListItem;
