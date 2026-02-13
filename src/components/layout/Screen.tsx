import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Edge } from 'react-native-safe-area-context';

import { useRTL } from '@/hooks/useRTL';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ScreenProps {
  children: React.ReactNode;
  /** Wrap content in a ScrollView. @default true */
  scroll?: boolean;
  /** Apply horizontal padding to the content. @default true */
  padding?: boolean;
  /** SafeAreaView edges to respect. @default ['top', 'bottom'] */
  edges?: Edge[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Screen: React.FC<ScreenProps> = ({
  children,
  scroll = true,
  padding = true,
  edges = ['top', 'bottom'],
}) => {
  const { direction } = useRTL();

  const contentStyle = padding
    ? { paddingStart: spacing.base, paddingEnd: spacing.base }
    : undefined;

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={lightTheme.background}
      />

      {scroll ? (
        <ScrollView
          style={[styles.scroll, { direction }]}
          contentContainerStyle={[styles.scrollContent, contentStyle]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.container, contentStyle, { direction }]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: lightTheme.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  container: {
    flex: 1,
  },
});
