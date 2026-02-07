import React from 'react';
import { Stack } from 'expo-router';

// ─── Teacher Layout ───────────────────────────────────────────────────────────

export default function TeacherLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
