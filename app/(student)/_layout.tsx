import React from 'react';
import { Stack } from 'expo-router';

// ─── Student Layout ───────────────────────────────────────────────────────────

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
