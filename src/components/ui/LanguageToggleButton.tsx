import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useChangeLanguage } from '@/hooks/useChangeLanguage';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { normalize } from '@/theme/normalize';
import { typography } from '@/theme/typography';
import { rippleConfigs } from '@/theme/ripple';

/**
 * Compact pill-style language toggle for auth screens.
 * Displays "EN" or "العربية" and toggles on press.
 */
export function LanguageToggleButton() {
  const { locale, toggleLanguage } = useChangeLanguage();

  return (
    <Pressable
      onPress={toggleLanguage}
      style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
      android_ripple={rippleConfigs.primary}
      hitSlop={8}
    >
      <Ionicons name="language" size={16} color={colors.primary[600]} />
      <Text style={styles.label}>
        {locale === 'en' ? 'العربية' : 'English'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: spacing.xs,
    paddingVertical: normalize(6),
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[100],
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    ...typography.textStyles.label,
    color: colors.primary[600],
    fontSize: normalize(13),
  },
});
