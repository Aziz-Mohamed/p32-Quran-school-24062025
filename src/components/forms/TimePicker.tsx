import React, { useState, useCallback } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';
import i18n from '@/i18n/config';

import { formatTimeHHMM, formatTimeDisplay } from './time-format';

export { formatTimeHHMM, parseTimeString } from './time-format';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  placeholder?: string;
  error?: string;
  style?: ViewStyle;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TimePicker({
  label,
  value,
  onChange,
  minimumDate,
  placeholder,
  error,
  style,
}: TimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const resolvedPlaceholder = placeholder ?? i18n.t('common.select');
  const hasError = error != null && error.length > 0;

  const handleChange = useCallback(
    (_event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') setShowPicker(false);
      if (selectedDate) onChange(selectedDate);
    },
    [onChange],
  );

  return (
    <View style={[styles.root, style]}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[styles.trigger, hasError && styles.triggerError]}
        onPress={() => setShowPicker(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Ionicons name="time-outline" size={normalize(18)} color={lightTheme.textTertiary} />
        <Text style={[styles.triggerText, !value && styles.placeholderText]}>
          {value ? formatTimeDisplay(value) : resolvedPlaceholder}
        </Text>
      </Pressable>

      {hasError && <Text style={styles.errorText}>{error}</Text>}

      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="time"
          is24Hour={false}
          minuteInterval={5}
          onChange={handleChange}
          minimumDate={minimumDate}
        />
      )}

      {showPicker && Platform.OS === 'ios' && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setShowPicker(false)}>
          <Pressable style={styles.overlay} onPress={() => setShowPicker(false)}>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={value ?? new Date()}
                mode="time"
                display="spinner"
                minuteInterval={5}
                onChange={handleChange}
                minimumDate={minimumDate}
              />
              <Pressable onPress={() => setShowPicker(false)} style={styles.doneButton}>
                <Text style={styles.doneText}>{i18n.t('common.done')}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { width: '100%' },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(13),
    lineHeight: normalize(18),
    color: colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
    backgroundColor: lightTheme.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  pickerContainer: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    width: '100%',
    maxWidth: normalize(360),
    padding: spacing.lg,
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
