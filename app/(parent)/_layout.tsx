import React from 'react';
import { Stack } from 'expo-router';
import { ErrorBoundary } from '@/components/feedback';

// ─── Parent Layout ────────────────────────────────────────────────────────────

export default function ParentLayout() {
  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="children/[id]" />
        <Stack.Screen name="attendance/[childId]" />
        <Stack.Screen name="class-standing/[childId]" />
        <Stack.Screen name="progress/[childId]" />
        <Stack.Screen name="schedule/[childId]" />
        <Stack.Screen name="sessions/[id]" />
      </Stack>
    </ErrorBoundary>
  );
}
