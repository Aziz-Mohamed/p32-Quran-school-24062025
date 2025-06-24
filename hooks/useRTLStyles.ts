import { I18nManager, TextStyle, ViewStyle } from "react-native";

export const useRTLStyles = () => {
  const isRTL = I18nManager.isRTL;

  const rtlStyles = {
    // Text direction
    textDirection: {
      writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
      textAlign: (isRTL ? "right" : "left") as "right" | "left",
    } as TextStyle,

    // Flex direction utilities
    row: {
      flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
    } as ViewStyle,
    rowReverse: {
      flexDirection: (isRTL ? "row" : "row-reverse") as "row" | "row-reverse",
    } as ViewStyle,

    // Margin utilities
    marginStart: (value: number): ViewStyle => ({
      marginLeft: isRTL ? undefined : value,
      marginRight: isRTL ? value : undefined,
    }),
    marginEnd: (value: number): ViewStyle => ({
      marginLeft: isRTL ? value : undefined,
      marginRight: isRTL ? undefined : value,
    }),

    // Padding utilities
    paddingStart: (value: number): ViewStyle => ({
      paddingLeft: isRTL ? undefined : value,
      paddingRight: isRTL ? value : undefined,
    }),
    paddingEnd: (value: number): ViewStyle => ({
      paddingLeft: isRTL ? value : undefined,
      paddingRight: isRTL ? undefined : value,
    }),

    // Border utilities
    borderStart: (value: number, color: string): ViewStyle => ({
      borderLeftWidth: isRTL ? undefined : value,
      borderLeftColor: isRTL ? undefined : color,
      borderRightWidth: isRTL ? value : undefined,
      borderRightColor: isRTL ? color : undefined,
    }),
    borderEnd: (value: number, color: string): ViewStyle => ({
      borderLeftWidth: isRTL ? value : undefined,
      borderLeftColor: isRTL ? color : undefined,
      borderRightWidth: isRTL ? undefined : value,
      borderRightColor: isRTL ? undefined : color,
    }),
  };

  return { isRTL, rtlStyles };
};
