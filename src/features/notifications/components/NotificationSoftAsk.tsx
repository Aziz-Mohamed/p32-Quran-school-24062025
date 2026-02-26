import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, lightTheme, primary, neutral, semanticSurface } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { normalize } from '@/theme/normalize';
import type { UserRole } from '../types/notifications.types';

interface NotificationSoftAskProps {
  visible: boolean;
  role: UserRole;
  onEnable: () => void;
  onDismiss: () => void;
}

export function NotificationSoftAsk({
  visible,
  role,
  onEnable,
  onDismiss,
}: NotificationSoftAskProps) {
  const { t } = useTranslation();

  const bodyKey = `notifications.softAsk.body.${role}` as const;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🔔</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{t('notifications.softAsk.title')}</Text>

          {/* Role-specific body */}
          <Text style={styles.body}>{t(bodyKey)}</Text>

          {/* Enable button */}
          <Pressable style={styles.enableButton} onPress={onEnable}>
            <Text style={styles.enableButtonText}>
              {t('notifications.softAsk.enable')}
            </Text>
          </Pressable>

          {/* Skip button */}
          <Pressable style={styles.skipButton} onPress={onDismiss}>
            <Text style={styles.skipButtonText}>
              {t('notifications.softAsk.skip')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalize(24),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingVertical: normalize(32),
    paddingHorizontal: normalize(24),
    width: '100%',
    maxWidth: normalize(360),
    alignItems: 'center',
  },
  iconContainer: {
    width: normalize(64),
    height: normalize(64),
    borderRadius: normalize(32),
    backgroundColor: semanticSurface.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBlockEnd: normalize(16),
  },
  iconText: {
    fontSize: normalize(32),
  },
  title: {
    fontSize: normalize(20),
    fontWeight: '700',
    color: lightTheme.text,
    textAlign: 'center',
    marginBlockEnd: normalize(8),
  },
  body: {
    fontSize: normalize(15),
    lineHeight: normalize(22),
    color: lightTheme.textSecondary,
    textAlign: 'center',
    marginBlockEnd: normalize(24),
  },
  enableButton: {
    backgroundColor: primary[600],
    borderRadius: radius.md,
    paddingVertical: normalize(14),
    paddingHorizontal: normalize(24),
    width: '100%',
    alignItems: 'center',
    marginBlockEnd: normalize(12),
  },
  enableButtonText: {
    color: colors.white,
    fontSize: normalize(16),
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(24),
  },
  skipButtonText: {
    color: neutral[400],
    fontSize: normalize(14),
  },
});
