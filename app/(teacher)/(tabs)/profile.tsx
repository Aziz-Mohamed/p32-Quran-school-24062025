import React, { useCallback } from 'react';
import { StyleSheet, View, Text, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import * as Updates from 'expo-updates';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useLocaleStore } from '@/stores/localeStore';
import { typography } from '@/theme/typography';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Teacher Profile ──────────────────────────────────────────────────────────

export default function TeacherProfile() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  const { logout, isPending: isLoggingOut } = useLogout();
  const { locale, setLocale } = useLocaleStore();

  const toggleLanguage = useCallback(async () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    setLocale(newLocale);
    await i18n.changeLanguage(newLocale);
    const isRTL = newLocale === 'ar';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
      I18nManager.allowRTL(isRTL);
      try {
        await Updates.reloadAsync();
      } catch {
        // In dev mode, reload may not be available
      }
    }
  }, [locale, setLocale, i18n]);

  const handleSignOut = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Text style={styles.title}>{t('teacher.profile.title')}</Text>

        {/* Profile Info */}
        <Card variant="elevated" style={styles.profileCard}>
          <Text style={styles.profileName}>{profile?.full_name ?? '—'}</Text>
          <Text style={styles.profileUsername}>@{profile?.username ?? '—'}</Text>
          <Badge label={t('roles.teacher')} variant="info" size="md" />
        </Card>

        {/* Notification Preferences */}
        <Card
          variant="outlined"
          style={styles.settingCard}
          onPress={() => router.push('/notification-preferences')}
        >
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('notifications.preferences.title')}</Text>
            <Text style={styles.chevron}>{'>'}</Text>
          </View>
        </Card>

        {/* Language */}
        <Card variant="outlined" style={styles.settingCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('common.language')}</Text>
            <Button
              title={locale === 'en' ? t('common.arabic') : t('common.english')}
              onPress={toggleLanguage}
              variant="secondary"
              size="sm"
            />
          </View>
        </Card>

        {/* Sign Out */}
        <Button
          title={t('common.signOut')}
          onPress={handleSignOut}
          variant="ghost"
          size="md"
          disabled={isLoggingOut}
        />
      </View>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  profileName: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    fontSize: typography.fontSize.xl,
  },
  profileUsername: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
  },
  settingCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    ...typography.textStyles.body,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.medium,
  },
  chevron: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
    fontSize: typography.fontSize.lg,
  },
});
