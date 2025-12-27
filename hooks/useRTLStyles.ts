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

    // Margin utilities using logical properties
    marginStart: (value: number): ViewStyle => ({
      marginLeft: isRTL ? undefined : value,
      marginRight: isRTL ? value : undefined,
    }),
    marginEnd: (value: number): ViewStyle => ({
      marginLeft: isRTL ? value : undefined,
      marginRight: isRTL ? undefined : value,
    }),

    // Padding utilities using logical properties
    paddingStart: (value: number): ViewStyle => ({
      paddingLeft: isRTL ? undefined : value,
      paddingRight: isRTL ? value : undefined,
    }),
    paddingEnd: (value: number): ViewStyle => ({
      paddingLeft: isRTL ? value : undefined,
      paddingRight: isRTL ? undefined : value,
    }),

    // Border utilities using logical properties
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

    // Additional RTL utilities
    alignStart: {
      alignItems: (isRTL ? "flex-end" : "flex-start") as
        | "flex-start"
        | "flex-end",
    } as ViewStyle,
    alignEnd: {
      alignItems: (isRTL ? "flex-start" : "flex-end") as
        | "flex-start"
        | "flex-end",
    } as ViewStyle,
    justifyStart: {
      justifyContent: (isRTL ? "flex-end" : "flex-start") as
        | "flex-start"
        | "flex-end",
    } as ViewStyle,
    justifyEnd: {
      justifyContent: (isRTL ? "flex-start" : "flex-end") as
        | "flex-start"
        | "flex-end",
    } as ViewStyle,

    // Text alignment utilities
    textStart: {
      textAlign: (isRTL ? "right" : "left") as "left" | "right",
    } as TextStyle,
    textEnd: {
      textAlign: (isRTL ? "left" : "right") as "left" | "right",
    } as TextStyle,
    textCenter: {
      textAlign: "center" as const,
    } as TextStyle,

    // Position utilities
    positionStart: (value: number): ViewStyle => ({
      left: isRTL ? undefined : value,
      right: isRTL ? value : undefined,
    }),
    positionEnd: (value: number): ViewStyle => ({
      left: isRTL ? value : undefined,
      right: isRTL ? undefined : value,
    }),
  };

  return { isRTL, rtlStyles };
};
