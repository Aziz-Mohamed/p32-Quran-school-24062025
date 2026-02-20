import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';

interface RevisionWarningProps {
  count: number;
}

export function RevisionWarning({ count }: RevisionWarningProps) {
  const { t } = useTranslation();

  if (count <= 0) return null;

  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle" size={18} color="#92400E" />
      <Text style={styles.text}>
        {t('gamification.revisionWarning', { count })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FEF3C7',
    borderRadius: normalize(8),
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  text: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(13),
    color: '#92400E',
    flex: 1,
  },
});
