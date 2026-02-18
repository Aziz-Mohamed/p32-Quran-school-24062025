import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/layout';
import { typography } from '@/theme/typography';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

// ─── Not Found Screen ─────────────────────────────────────────────────────────

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>{t('common.notFound')}</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>{t('common.goHome')}</Text>
        </Link>
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
    fontSize: normalize(72),
    color: lightTheme.primary,
    marginBlockEnd: spacing.sm,
  },
  subtitle: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
    textAlign: 'center',
    marginBlockEnd: spacing.xl,
  },
  link: {
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
  },
  linkText: {
    ...typography.textStyles.label,
    color: lightTheme.primary,
  },
});
