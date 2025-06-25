import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { I18nManager } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import "@/hooks/useI18n"; // Initialize i18n

const LANGUAGE_KEY = "@quran_school_language";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    const forceRTLIfNeeded = async () => {
      try {
        // Get stored language
        const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        const shouldBeRTL = storedLanguage === "ar";

        console.log("RootLayout: Checking RTL...");
        console.log("Stored language:", storedLanguage);
        console.log("Should be RTL:", shouldBeRTL);
        console.log("Currently RTL:", I18nManager.isRTL);

        // Force RTL if needed
        if (shouldBeRTL && !I18nManager.isRTL) {
          console.log("RootLayout: Forcing RTL...");
          I18nManager.forceRTL(true);

          // Show alert to user
          alert(
            "RTL mode activated. Please restart the app to see the changes."
          );
        } else if (!shouldBeRTL && I18nManager.isRTL) {
          console.log("RootLayout: Forcing LTR...");
          I18nManager.forceRTL(false);

          // Show alert to user
          alert(
            "LTR mode activated. Please restart the app to see the changes."
          );
        }
      } catch (error) {
        console.log("Error checking RTL:", error);
      }
    };

    // Force RTL check immediately
    forceRTLIfNeeded();

    // Give i18n time to initialize
    const timer = setTimeout(() => {
      setIsI18nReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!loaded || !isI18nReady) {
    // Async font loading and i18n initialization
    return null;
  }

  // TODO: Insert role-based layout switching here in the future.
  // For example: if (role === 'admin') return <AdminLayout>{children}</AdminLayout>
  // else if (role === 'teacher') ... etc.

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
