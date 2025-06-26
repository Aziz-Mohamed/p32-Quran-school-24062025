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
import { ActivityIndicator, I18nManager, Text, View } from "react-native";
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
  const [isRTLReady, setIsRTLReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Get stored language
        const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        const shouldBeRTL = storedLanguage === "ar";

        console.log("RootLayout: Checking RTL...");
        console.log("Stored language:", storedLanguage);
        console.log("Should be RTL:", shouldBeRTL);
        console.log("Currently RTL:", I18nManager.isRTL);

        // Only force RTL if there's a mismatch and we have a stored language
        if (storedLanguage && shouldBeRTL !== I18nManager.isRTL) {
          console.log("RootLayout: Forcing RTL change...");
          I18nManager.forceRTL(shouldBeRTL);

          // Note: RTL changes require app restart, but we won't show alert here
          // to avoid navigation issues
        }

        setIsRTLReady(true);
      } catch (error) {
        console.log("Error checking RTL:", error);
        setIsRTLReady(true); // Continue anyway
      }
    };

    // Initialize RTL check
    initializeApp();

    // Give i18n time to initialize
    const timer = setTimeout(() => {
      setIsI18nReady(true);
    }, 300); // Reduced timeout

    return () => clearTimeout(timer);
  }, []);

  // Show loading screen while initializing
  if (!loaded || !isI18nReady || !isRTLReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#FAFAF7",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#3A7D5D" />
        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            color: "#666",
          }}
        >
          Loading Quran School...
        </Text>
      </View>
    );
  }

  // TODO: Insert role-based layout switching here in the future.
  // For example: if (role === 'admin') return <AdminLayout>{children}</AdminLayout>
  // else if (role === 'teacher') ... etc.

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="teacher" options={{ headerShown: false }} />
        <Stack.Screen name="student" options={{ headerShown: false }} />
        <Stack.Screen name="parent" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="shared" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
