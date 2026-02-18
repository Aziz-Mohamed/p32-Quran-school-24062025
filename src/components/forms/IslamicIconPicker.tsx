import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { StickerIcon } from '@/components/ui/StickerIcon';
import {
  ISLAMIC_ICON_CATEGORIES,
  DEFAULT_STICKER_ICON,
} from '@/lib/islamicIcons';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';

interface IslamicIconPickerProps {
  label?: string;
  value: string;
  onChange: (iconKey: string) => void;
}

export function IslamicIconPicker({ label, value, onChange }: IslamicIconPickerProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Pressable style={styles.preview} onPress={() => setExpanded(!expanded)}>
        <StickerIcon value={value || DEFAULT_STICKER_ICON} size={normalize(36)} color={colors.primary[500]} />
        <Text style={styles.previewHint}>
          {expanded ? t('common.tapToClose') : t('common.tapToChoose')}
        </Text>
      </Pressable>

      {expanded && (
        <ScrollView style={styles.grid} nestedScrollEnabled>
          {ISLAMIC_ICON_CATEGORIES.map((category) => (
            <View key={category.key}>
              <Text style={styles.categoryLabel}>
                {t(`iconCategories.${category.key}`)}
              </Text>
              <View style={styles.categoryRow}>
                {category.icons.map((iconName) => {
                  const isSelected = iconName === value;
                  return (
                    <Pressable
                      key={iconName}
                      onPress={() => {
                        onChange(iconName);
                        setExpanded(false);
                      }}
                      style={[
                        styles.iconButton,
                        isSelected && styles.iconButtonSelected,
                      ]}
                      accessibilityLabel={t(`iconNames.${iconName}`)}
                    >
                      <StickerIcon
                        value={iconName}
                        size={normalize(28)}
                        color={isSelected ? colors.primary[600] : colors.neutral[700]}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.textStyles.label,
    color: lightTheme.text,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: lightTheme.border,
    borderRadius: radius.md,
    backgroundColor: lightTheme.surface,
  },
  previewHint: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
  },
  grid: {
    maxHeight: normalize(320),
    borderWidth: 1,
    borderColor: lightTheme.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: lightTheme.surface,
  },
  categoryLabel: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    fontFamily: typography.fontFamily.semiBold,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  iconButton: {
    width: normalize(48),
    height: normalize(48),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconButtonSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
});
