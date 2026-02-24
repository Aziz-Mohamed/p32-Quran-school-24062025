import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { TextField } from '@/components/ui/TextField';
import { SUPPORTED_LANGUAGE_CONFIGS } from '@/types/localization.types';
import type { SupportedLanguage } from '@/i18n/config';
import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface LocalizedNameInputProps {
  value: Record<string, string>;
  onChange: (nameLocalized: Record<string, string>) => void;
  label?: string;
  required?: boolean;
  error?: string;
  style?: ViewStyle;
}

export function LocalizedNameInput({
  value,
  onChange,
  label,
  required = false,
  error,
  style,
}: LocalizedNameInputProps) {
  const { t, i18n } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const currentLang = i18n.language as SupportedLanguage;

  const primaryConfig = SUPPORTED_LANGUAGE_CONFIGS.find(
    (c) => c.code === currentLang,
  ) ?? SUPPORTED_LANGUAGE_CONFIGS[0]!;

  const secondaryConfigs = SUPPORTED_LANGUAGE_CONFIGS.filter(
    (c) => c.code !== currentLang,
  );

  const handleChange = useCallback(
    (lang: string, text: string) => {
      onChange({ ...value, [lang]: text });
    },
    [value, onChange],
  );

  const hasSecondaryValues = secondaryConfigs.some(
    (c) => value[c.code]?.trim(),
  );

  return (
    <View style={[styles.root, style]}>
      <TextField
        label={label ?? t('forms.fullName')}
        value={value[primaryConfig.code] ?? ''}
        onChangeText={(text) => handleChange(primaryConfig.code, text)}
        placeholder={primaryConfig.namePlaceholder}
        writingDirection={primaryConfig.direction}
        error={error}
      />

      {!isExpanded && (
        <Pressable
          style={styles.expandButton}
          onPress={() => setIsExpanded(true)}
          accessibilityRole="button"
        >
          <Ionicons
            name="add-circle-outline"
            size={16}
            color={colors.primary[500]}
          />
          <Text style={styles.expandText}>
            {t('forms.addNameIn', {
              language: secondaryConfigs[0]?.nativeName ?? '',
            })}
          </Text>
        </Pressable>
      )}

      {isExpanded && (
        <View style={styles.secondarySection}>
          {secondaryConfigs.map((config) => (
            <TextField
              key={config.code}
              label={t('forms.nameInLanguage', {
                language: config.nativeName,
              })}
              value={value[config.code] ?? ''}
              onChangeText={(text) => handleChange(config.code, text)}
              placeholder={config.namePlaceholder}
              writingDirection={config.direction}
            />
          ))}

          {!hasSecondaryValues && (
            <Pressable
              style={styles.collapseButton}
              onPress={() => setIsExpanded(false)}
              accessibilityRole="button"
            >
              <Text style={styles.collapseText}>
                {t('forms.hideOtherLanguages')}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  expandText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
  },
  secondarySection: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  collapseButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  collapseText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: lightTheme.textSecondary,
  },
});
