import { View, type ViewProps } from "react-native";

import { useRTLStyles } from "@/hooks/useRTLStyles";
import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  row?: boolean;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  row = false,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );
  const { rtlStyles } = useRTLStyles();

  return (
    <View
      style={[{ backgroundColor }, row ? rtlStyles.row : undefined, style]}
      {...otherProps}
    />
  );
}
