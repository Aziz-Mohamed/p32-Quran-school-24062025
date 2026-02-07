// utils/normalize.ts
import { PixelRatio, Dimensions, Platform } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const baseWidth = 430; // iPhone 16 Pro Max baseline

const scale = SCREEN_WIDTH / baseWidth;

export function normalize(size: number, factor = 0) {
  if (Platform.OS === "ios") {
    return size; // iOS design is already perfect
  }

  // Android correction
  const newSize = size * scale;
  return Math.round(
    // PixelRatio.roundToNearestPixel(newSize + (size - newSize) * factor)
    Math.round(PixelRatio.roundToNearestPixel(newSize))

  );
}
