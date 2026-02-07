import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { normalize } from "@/utils/normalize";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface BottomNavItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  active: boolean;
}

interface BottomNavBarProps {
  items: BottomNavItem[];
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ items }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  return (
    <View style={styles.fabWrap} pointerEvents="box-none">
      <View
        style={[
          styles.bar,
          { backgroundColor: colors.surface, shadowColor: "#000" },
        ]}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item.key}
            onPress={item.onPress}
            style={[
              styles.tab,
              item.active && { backgroundColor: colors.accentOrange + "22" },
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: item.active }}
            accessibilityLabel={item.label}
          >
            <Ionicons
              name={item.icon}
              size={normalize(24)}
              color={item.active ? colors.accentOrange : colors.textSecondary}
            />
            <Text
              style={[
                styles.label,
                {
                  color: item.active
                    ? colors.accentOrange
                    : colors.textSecondary,
                  fontWeight: item.active ? "700" : "500",
                  fontFamily: "System",
                },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fabWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: normalize(24),
    alignItems: "center",
    zIndex: 20,
    pointerEvents: "box-none",
  },
  bar: {
    flexDirection: "row",
    borderRadius: 999,
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: normalize(16),
    elevation: 4,
    backgroundColor: "#fff",
    minWidth: normalize(320),
    maxWidth: normalize(480),
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(8),
    borderRadius: 999,
    marginHorizontal: normalize(2),
    minWidth: normalize(56),
  },
  label: {
    fontSize: normalize(10),
    marginTop: normalize(2),
    fontWeight: "500",
    letterSpacing: 0.3,
    textAlign: "center",
    maxWidth: normalize(85),
  },
});

export default BottomNavBar;
