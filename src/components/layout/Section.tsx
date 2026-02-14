import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { lightTheme } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { textStyles } from '@/theme/typography';

// ─── Props ────────────────────────────────────────────────────────────────────

interface SectionProps {
  /** Optional section heading. */
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

// ─── Component ────────────────────────────────────────────────────────────────
// Text alignment is handled globally by I18nManager.forceRTL() + app reload.

export const Section: React.FC<SectionProps> = ({ title, children, style }) => {
  return (
    <View style={[styles.container, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightTheme.surface,
    borderRadius: radius.lg,
    paddingStart: spacing.base,
    paddingEnd: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.base,
    marginBottom: spacing.md,
  },
  title: {
    ...textStyles.subheading,
    color: lightTheme.text,
    marginBottom: spacing.sm,
  },
});
