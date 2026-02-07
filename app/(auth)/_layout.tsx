import React from 'react';
import { Stack } from 'expo-router';

// ─── Auth Layout ──────────────────────────────────────────────────────────────

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
