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
import type { SelectOption } from './Select';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  error?: string;
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MultiSelect({
  label,
  placeholder = 'Select...',
  options,
  value,
  onChange,
  error,
  style,
}: MultiSelectProps) {
  const [visible, setVisible] = useState(false);
  const hasError = error != null && error.length > 0;

  const selectedLabels = options
    .filter((o) => value.includes(o.value))
    .map((o) => o.label)
    .join(', ');

  const handleToggle = useCallback(
    (optionValue: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const next = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onChange(next);
    },
    [value, onChange],
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
            value.length === 0 && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {value.length > 0 ? selectedLabels : placeholder}
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
                const isSelected = value.includes(item.value);
                return (
                  <Pressable
                    onPress={() => handleToggle(item.value)}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      pressed && styles.optionPressed,
                    ]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                  >
                    <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={normalize(14)} color={colors.white} />
                      )}
                    </View>
                    <Text style={styles.optionText}>{item.label}</Text>
                  </Pressable>
                );
              }}
            />

            <Pressable
              onPress={() => setVisible(false)}
              style={styles.doneButton}
              accessibilityRole="button"
            >
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
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
    maxHeight: normalize(400),
    paddingVertical: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  optionSelected: {
    backgroundColor: colors.primary[50],
  },
  optionPressed: {
    backgroundColor: colors.neutral[100],
  },
  checkbox: {
    width: normalize(22),
    height: normalize(22),
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: lightTheme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  optionText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.base,
    color: lightTheme.text,
  },
  doneButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: lightTheme.border,
    marginTop: spacing.sm,
  },
  doneText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.base,
    color: colors.primary[500],
  },
});
