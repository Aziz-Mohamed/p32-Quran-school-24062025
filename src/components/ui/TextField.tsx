import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  type KeyboardTypeOptions,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { shadows } from '@/theme/shadows';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  editable?: boolean;
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TextField({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize,
  multiline = false,
  leftIcon,
  rightIcon,
  editable = true,
  style,
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  const hasError = error != null && error.length > 0;

  const inputContainerStyle: ViewStyle[] = [
    styles.inputContainer,
    ...(isFocused ? [styles.inputContainerFocused] : []),
    ...(hasError ? [styles.inputContainerError] : []),
    ...(!editable ? [styles.inputContainerDisabled] : []),
  ];

  return (
    <View style={[styles.root, style]}>
      {label != null && label.length > 0 && (
        <Text style={styles.label}>{label}</Text>
      )}

      <View style={inputContainerStyle}>
        {leftIcon != null && (
          <View style={styles.iconStart}>{leftIcon}</View>
        )}

        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            !editable && styles.inputDisabled,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={lightTheme.textTertiary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          textAlignVertical={multiline ? 'top' : 'center'}
          accessibilityLabel={label}
          accessibilityState={{ disabled: !editable }}
        />

        {rightIcon != null && (
          <View style={styles.iconEnd}>{rightIcon}</View>
        )}
      </View>

      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: lightTheme.text,
    marginBottom: spacing.xs,
    marginStart: spacing.xs,
  } as TextStyle,
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    ...shadows.sm,
  },
  inputContainerFocused: {
    borderColor: lightTheme.borderFocused,
    backgroundColor: colors.white,
    ...shadows.md,
  },
  inputContainerError: {
    borderColor: lightTheme.error,
    backgroundColor: colors.accent.rose[50],
  },
  inputContainerDisabled: {
    backgroundColor: colors.neutral[100],
    borderColor: colors.neutral[200],
    opacity: 0.7,
  },
  iconStart: {
    marginEnd: spacing.sm,
  },
  iconEnd: {
    marginStart: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.base,
    color: lightTheme.text,
    paddingVertical: spacing.sm,
    textAlign: 'auto',
  } as TextStyle,
  inputMultiline: {
    minHeight: 120,
    paddingTop: spacing.md,
  },
  inputDisabled: {
    color: lightTheme.textSecondary,
  } as TextStyle,
  errorText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: lightTheme.error,
    marginTop: spacing.xs,
    marginStart: spacing.sm,
  } as TextStyle,
});
