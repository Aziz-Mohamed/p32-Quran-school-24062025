import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';

import { useAuthStore } from '@/stores/authStore';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '../hooks/useNotificationPreferences';
import { getCategoriesForRole } from '../config/notification-categories';
import type { UserRole, NotificationPreferencesForm } from '../types/notifications.types';

const DEFAULT_PREFS: NotificationPreferencesForm = {
  sticker_awarded: true,
  trophy_earned: true,
  achievement_unlocked: true,
  homework_assigned: true,
  attendance_marked: true,
  session_completed: true,
  homework_reminder: true,
  daily_summary: true,
  student_alert: true,
  quiet_hours_enabled: false,
  quiet_hours_start: null,
  quiet_hours_end: null,
};

export function NotificationPreferencesScreen() {
  const { t } = useTranslation();
  const profile = useAuthStore((s) => s.profile);
  const role = (profile?.role as UserRole) ?? 'student';
  const userId = profile?.id;

  const { data: prefs, isLoading } = useNotificationPreferences(userId);
  const { mutate: updatePrefs } = useUpdateNotificationPreferences(userId);

  const { control, reset, watch } = useForm<NotificationPreferencesForm>({
    defaultValues: DEFAULT_PREFS,
  });

  // Sync fetched preferences into the form
  useEffect(() => {
    if (prefs) {
      reset({
        sticker_awarded: prefs.sticker_awarded,
        trophy_earned: prefs.trophy_earned,
        achievement_unlocked: prefs.achievement_unlocked,
        homework_assigned: prefs.homework_assigned,
        attendance_marked: prefs.attendance_marked,
        session_completed: prefs.session_completed,
        homework_reminder: prefs.homework_reminder,
        daily_summary: prefs.daily_summary,
        student_alert: prefs.student_alert,
        quiet_hours_enabled: prefs.quiet_hours_enabled,
        quiet_hours_start: prefs.quiet_hours_start,
        quiet_hours_end: prefs.quiet_hours_end,
      });
    }
  }, [prefs, reset]);

  // Auto-save on toggle change
  useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (name && userId) {
        updatePrefs({ [name]: values[name] });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updatePrefs, userId]);

  const categories = getCategoriesForRole(role);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2F9E44" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('notifications.preferences.title')}</Text>
      <Text style={styles.subtitle}>{t('notifications.preferences.subtitle')}</Text>

      {/* Category toggles */}
      <View style={styles.section}>
        {categories.map((cat) => (
          <View key={cat.id} style={styles.row}>
            <Text style={styles.label}>{t(cat.labelKey)}</Text>
            <Controller
              control={control}
              name={cat.preferenceColumn as keyof NotificationPreferencesForm}
              render={({ field: { value, onChange } }) => (
                <Switch
                  value={value as boolean}
                  onValueChange={onChange}
                  trackColor={{ true: '#2F9E44', false: '#ccc' }}
                  thumbColor="#fff"
                />
              )}
            />
          </View>
        ))}
      </View>

      {/* Quiet Hours */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('notifications.preferences.quietHours')}
        </Text>
        <Text style={styles.sectionDescription}>
          {t('notifications.preferences.quietHoursDescription')}
        </Text>
        <View style={styles.row}>
          <Text style={styles.label}>
            {t('notifications.preferences.quietHours')}
          </Text>
          <Controller
            control={control}
            name="quiet_hours_enabled"
            render={({ field: { value, onChange } }) => (
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ true: '#2F9E44', false: '#ccc' }}
                thumbColor="#fff"
              />
            )}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B1B1B',
    marginBlockEnd: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBlockEnd: 24,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBlockEnd: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B1B1B',
    paddingVertical: 12,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#888',
    marginBlockEnd: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
  },
  label: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    marginInlineEnd: 12,
  },
});
