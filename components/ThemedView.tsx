import { View, type ViewProps } from "react-native";

import { useRTLStyles } from "@/hooks/useRTLStyles";
import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedViewProps = ViewProps & {
  row?: boolean;
};

export function ThemedView({
  style,
  row = false,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor("background");
  const { rtlStyles } = useRTLStyles();

  return (
    <View
      style={[{ backgroundColor }, row ? rtlStyles.row : undefined, style]}
      {...otherProps}
    />
  );
}
