import React from 'react';
import { Stack } from 'expo-router';
import { ErrorBoundary } from '@/components/feedback';

// ─── Admin Layout ─────────────────────────────────────────────────────────────

export default function AdminLayout() {
  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="students/index" />
        <Stack.Screen name="students/create" />
        <Stack.Screen name="students/[id]/index" />
        <Stack.Screen name="students/[id]/edit" />
        <Stack.Screen name="teachers/index" />
        <Stack.Screen name="teachers/create" />
        <Stack.Screen name="teachers/[id]/index" />
        <Stack.Screen name="teachers/[id]/edit" />
        <Stack.Screen name="classes/index" />
        <Stack.Screen name="classes/create" />
        <Stack.Screen name="classes/[id]/index" />
        <Stack.Screen name="classes/[id]/edit" />
        <Stack.Screen name="attendance/index" />
        <Stack.Screen name="members/reset-password" />
        <Stack.Screen name="stickers/index" />
        <Stack.Screen name="stickers/create" />
        <Stack.Screen name="stickers/[id]/edit" />
      </Stack>
    </ErrorBoundary>
  );
}
