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
import { i18nInitPromise } from "@/hooks/useI18n";
import { initializeRTL } from "@/hooks/useRTL";

const LANGUAGE_KEY = "@quran_school_language";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [i18nReady, setI18nReady] = useState(false);
  const [rtlInitialized, setRtlInitialized] = useState(false);

  // Wait for i18n to be ready and initialize RTL
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Wait for i18n to be ready
        await i18nInitPromise;
        setI18nReady(true);
        console.log("i18n ready state:", true);

        // Initialize RTL based on stored language preference
        const rtlChanged = await initializeRTL();
        setRtlInitialized(true);

        console.log("Current RTL state:", I18nManager.isRTL);
        if (rtlChanged) {
          console.log("RTL was changed during initialization");
        }
      } catch (error) {
        console.error("Error initializing app:", error);
        setI18nReady(true);
        setRtlInitialized(true);
      }
    };

    initializeApp();
  }, []);

  // Show loading screen while fonts, i18n, and RTL are loading
  if (!loaded || !i18nReady || !rtlInitialized) {
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
        {!i18nReady && (
          <Text
            style={{
              marginTop: 8,
              fontSize: 14,
              color: "#999",
            }}
          >
            Initializing translations...
          </Text>
        )}
        {!rtlInitialized && (
          <Text
            style={{
              marginTop: 8,
              fontSize: 14,
              color: "#999",
            }}
          >
            Setting up layout...
          </Text>
        )}
      </View>
    );
  }

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
