import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/layout';
import { typography } from '@/theme/typography';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Sessions Screen ──────────────────────────────────────────────────────────

export default function SessionsScreen() {
  const { t } = useTranslation();

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('teacher.sessions.title')}</Text>
        <Text style={styles.subtitle}>{t('teacher.sessions.subtitle')}</Text>
      </View>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    marginBlockEnd: spacing.sm,
  },
  subtitle: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
    textAlign: 'center',
  },
});
