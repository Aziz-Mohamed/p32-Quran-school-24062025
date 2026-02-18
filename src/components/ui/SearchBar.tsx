import React, { useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { shadows } from '@/theme/shadows';
import { normalize } from '@/theme/normalize';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
  style,
}: SearchBarProps) {
  const inputRef = useRef<TextInput>(null);
  const hasText = value.length > 0;

  const handleClear = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChangeText('');
    onClear?.();
    inputRef.current?.focus();
  }, [onChangeText, onClear]);

  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name="search-outline"
        size={normalize(20)}
        color={lightTheme.textSecondary}
        style={styles.searchIcon}
      />

      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={lightTheme.textTertiary}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        accessibilityRole="search"
        accessibilityLabel={placeholder}
      />

      {hasText && (
        <Pressable
          onPress={handleClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.clearButton}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <Ionicons
            name="close-circle"
            size={normalize(20)}
            color={colors.neutral[400]}
          />
        </Pressable>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.full,
    minHeight: normalize(48),
    paddingHorizontal: spacing.lg,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  searchIcon: {
    marginEnd: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.base,
    color: lightTheme.text,
    paddingVertical: spacing.sm,
  } as TextStyle,
  clearButton: {
    marginStart: spacing.sm,
    width: normalize(32),
    height: normalize(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
