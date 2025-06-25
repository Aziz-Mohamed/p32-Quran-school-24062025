import { useColorScheme as _useColorScheme } from "react-native";

// Light | Dark | null
export function useColorScheme() {
  return _useColorScheme() ?? "light";
}
