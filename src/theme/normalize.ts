/**
 * Design System — Responsive Normalize
 *
 * Scales numeric sizes proportionally on Android so layouts designed
 * for a 430 px-wide baseline (iPhone 16 Pro Max) look correct on
 * narrower / wider Android screens.
 *
 * iOS values are returned unchanged — the native point system already
 * handles scaling.
 */
import { PixelRatio, Dimensions, Platform } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const baseWidth = 430; // iPhone 16 Pro Max baseline

const scale = SCREEN_WIDTH / baseWidth;

export function normalize(size: number): number {
  if (Platform.OS === "ios") {
    return size;
  }

  // Android correction
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}
