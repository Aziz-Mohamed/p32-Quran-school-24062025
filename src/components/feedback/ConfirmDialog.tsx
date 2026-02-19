import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { rippleConfigs } from '@/theme/ripple';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  const resolvedConfirmLabel = confirmLabel ?? t('common.confirm');
  const resolvedCancelLabel = cancelLabel ?? t('common.cancel');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.dialog} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onCancel}
              android_ripple={rippleConfigs.dark}
              accessibilityRole="button"
            >
              <Text style={styles.cancelLabel}>{resolvedCancelLabel}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                destructive ? styles.destructiveButton : styles.confirmButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onConfirm}
              android_ripple={rippleConfigs.light}
              accessibilityRole="button"
            >
              <Text style={styles.confirmLabel}>{resolvedConfirmLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  dialog: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    width: '100%',
    maxWidth: 340,
  },
  title: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
    marginBottom: spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  cancelButton: {
    backgroundColor: colors.neutral[100],
  },
  confirmButton: {
    backgroundColor: colors.primary[500],
  },
  destructiveButton: {
    backgroundColor: colors.semantic.error,
  },
  cancelLabel: {
    ...typography.textStyles.bodyMedium,
    color: lightTheme.text,
  },
  confirmLabel: {
    ...typography.textStyles.bodyMedium,
    color: colors.white,
  },
});
