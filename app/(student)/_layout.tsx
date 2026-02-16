import React from 'react';
import { Stack } from 'expo-router';
import { ErrorBoundary } from '@/components/feedback';

// ─── Student Layout ───────────────────────────────────────────────────────────

export default function StudentLayout() {
  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="lessons/[id]" />
        <Stack.Screen name="sessions/index" />
        <Stack.Screen name="sessions/[id]" />
        <Stack.Screen name="trophy-room" />
        <Stack.Screen name="leaderboard" />
        <Stack.Screen name="schedule" />
      </Stack>
    </ErrorBoundary>
  );
}
