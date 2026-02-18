import React, { useState, useCallback } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  error?: string;
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Select({
  label,
  placeholder = 'Select...',
  options,
  value,
  onChange,
  error,
  style,
}: SelectProps) {
  const [visible, setVisible] = useState(false);
  const hasError = error != null && error.length > 0;
  const selectedOption = options.find((o) => o.value === value);

  const handleSelect = useCallback(
    (optionValue: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(optionValue);
      setVisible(false);
    },
    [onChange],
  );

  return (
    <View style={[styles.root, style]}>
      {label != null && label.length > 0 && (
        <Text style={styles.label}>{label}</Text>
      )}

      <Pressable
        onPress={() => setVisible(true)}
        style={[
          styles.trigger,
          hasError && styles.triggerError,
        ]}
        accessibilityRole="combobox"
        accessibilityLabel={label ?? placeholder}
      >
        <Text
          style={[
            styles.triggerText,
            !selectedOption && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {selectedOption?.label ?? placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={normalize(20)}
          color={lightTheme.textTertiary}
        />
      </Pressable>

      {hasError && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.dropdown} onStartShouldSetResponder={() => true}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    onPress={() => handleSelect(item.value)}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      pressed && styles.optionPressed,
                    ]}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={normalize(20)}
                        color={colors.primary[500]}
                      />
                    )}
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
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
    marginBottom: spacing.sm,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: lightTheme.border,
    borderRadius: radius.md,
    backgroundColor: lightTheme.background,
    minHeight: normalize(48),
    paddingHorizontal: spacing.md,
  },
  triggerError: {
    borderColor: lightTheme.error,
    borderWidth: 1.5,
  },
  triggerText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.base,
    color: lightTheme.text,
  },
  placeholderText: {
    color: lightTheme.textTertiary,
  },
  errorText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: lightTheme.error,
    marginTop: spacing.xs,
    marginStart: spacing.xs,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  dropdown: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    width: '100%',
    maxWidth: normalize(340),
    maxHeight: normalize(320),
    paddingVertical: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  optionSelected: {
    backgroundColor: colors.primary[50],
  },
  optionPressed: {
    backgroundColor: colors.neutral[100],
  },
  optionText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.base,
    color: lightTheme.text,
  },
  optionTextSelected: {
    fontFamily: typography.fontFamily.medium,
    color: colors.primary[700],
  },
});
