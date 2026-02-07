import React from 'react';
import { Stack } from 'expo-router';

// ─── Parent Layout ────────────────────────────────────────────────────────────

export default function ParentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
