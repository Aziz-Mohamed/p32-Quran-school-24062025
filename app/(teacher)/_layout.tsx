import React from 'react';
import { Stack } from 'expo-router';
import { ErrorBoundary } from '@/components/feedback';

// ─── Teacher Layout ───────────────────────────────────────────────────────────

export default function TeacherLayout() {
  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="sessions/create" />
        <Stack.Screen name="sessions/[id]" />
        <Stack.Screen name="awards/index" />
        <Stack.Screen name="students/[id]" />
        <Stack.Screen name="students/top-performers" />
        <Stack.Screen name="students/needs-support" />
      </Stack>
    </ErrorBoundary>
  );
}
