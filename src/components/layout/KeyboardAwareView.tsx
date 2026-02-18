import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

// ─── Props ────────────────────────────────────────────────────────────────────

interface KeyboardAwareViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const KeyboardAwareView: React.FC<KeyboardAwareViewProps> = ({
  children,
  style,
}) => {
  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {children}
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
