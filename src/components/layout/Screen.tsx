import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Edge } from 'react-native-safe-area-context';

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
  /** Whether the screen is within a tab layout with the floating tab bar. @default false */
  hasTabBar?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
// Layout direction is driven by the root View's `direction` style in _layout.tsx,
// backed by I18nManager.forceRTL() for native components.

export const Screen: React.FC<ScreenProps> = ({
  children,
  scroll = true,
  padding = true,
  edges = ['top', 'bottom'],
  hasTabBar = false,
}) => {
  const contentStyle = padding
    ? { paddingStart: spacing.base, paddingEnd: spacing.base }
    : undefined;

  const bottomPadding = hasTabBar ? 110 : spacing.xl;

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={lightTheme.background}
      />

      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent, 
            contentStyle,
            { paddingBottom: bottomPadding }
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.container, contentStyle, { paddingBottom: bottomPadding }]}>
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
