import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';

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
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBlockEnd: 16,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B1B1B',
    textAlign: 'center',
    marginBlockEnd: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    textAlign: 'center',
    marginBlockEnd: 24,
  },
  enableButton: {
    backgroundColor: '#2F9E44',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginBlockEnd: 12,
  },
  enableButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    color: '#888',
    fontSize: 14,
  },
});
