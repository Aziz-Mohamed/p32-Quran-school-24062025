import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { lightTheme, colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import type { StudentNeedingAttention } from '../types/reports.types';

interface StudentAttentionCardProps {
  student: StudentNeedingAttention;
}

export function StudentAttentionCard({ student }: StudentAttentionCardProps) {
  const { t } = useTranslation();

  const reasonLabel =
    student.flagReason === 'declining'
      ? t('reports.attention.declining')
      : t('reports.attention.lowScores');

  const reasonColor =
    student.flagReason === 'declining'
      ? colors.semantic.warning
      : colors.semantic.error;

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {student.fullName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{student.fullName}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.score}>
            {student.currentAvg.toFixed(1)}
          </Text>
          <View style={styles.declineIndicator}>
            <Ionicons
              name="arrow-down"
              size={12}
              color={colors.semantic.error}
            />
            <Text style={styles.declineText}>
              {student.declineAmount.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>
      <View style={[styles.badge, { backgroundColor: reasonColor + '1A' }]}>
        <Text style={[styles.badgeText, { color: reasonColor }]}>
          {reasonLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightTheme.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: lightTheme.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.sm,
    color: lightTheme.primary,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: lightTheme.text,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  score: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.sm,
    color: lightTheme.text,
  },
  declineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  declineText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: colors.semantic.error,
  },
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
  },
});
