import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { lightTheme, colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';
import type { TeacherActivitySummary } from '../types/reports.types';

interface TeacherActivityCardProps {
  teacher: TeacherActivitySummary;
  inactive?: boolean;
}

export function TeacherActivityCard({ teacher, inactive }: TeacherActivityCardProps) {
  const { t } = useTranslation();

  return (
    <View style={[styles.card, inactive && styles.cardInactive]}>
      <View style={styles.header}>
        <View style={[styles.avatar, inactive && styles.avatarInactive]}>
          <Text style={[styles.avatarText, inactive && styles.avatarTextInactive]}>
            {teacher.fullName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.name, inactive && styles.nameInactive]} numberOfLines={1}>
          {teacher.fullName}
        </Text>
      </View>
      <View style={styles.statsGrid}>
        <View style={styles.stat}>
          <Ionicons
            name="document-text-outline"
            size={normalize(16)}
            color={inactive ? lightTheme.textTertiary : colors.primary[500]}
          />
          <Text style={[styles.statValue, inactive && styles.textMuted]}>
            {teacher.sessionsLogged}
          </Text>
          <Text style={[styles.statLabel, inactive && styles.textMuted]}>
            {t('reports.teacherActivityDetail.sessionsLogged')}
          </Text>
        </View>
        <View style={styles.stat}>
          <Ionicons
            name="people-outline"
            size={normalize(16)}
            color={inactive ? lightTheme.textTertiary : colors.primary[500]}
          />
          <Text style={[styles.statValue, inactive && styles.textMuted]}>
            {teacher.uniqueStudentsEvaluated}
          </Text>
          <Text style={[styles.statLabel, inactive && styles.textMuted]}>
            {t('reports.teacherActivityDetail.studentsEvaluated')}
          </Text>
        </View>
        <View style={styles.stat}>
          <Ionicons
            name="star-outline"
            size={normalize(16)}
            color={inactive ? lightTheme.textTertiary : colors.primary[500]}
          />
          <Text style={[styles.statValue, inactive && styles.textMuted]}>
            {teacher.stickersAwarded}
          </Text>
          <Text style={[styles.statLabel, inactive && styles.textMuted]}>
            {t('reports.teacherActivityDetail.stickersAwarded')}
          </Text>
        </View>
      </View>
      {teacher.lastActiveDate && (
        <Text style={[styles.lastActive, inactive && styles.textMuted]}>
          {t('reports.teacherActivityDetail.lastActive')}: {teacher.lastActiveDate}
        </Text>
      )}
      {inactive && (
        <Text style={styles.inactiveLabel}>
          {t('reports.teacherActivityDetail.zeroSessions')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: lightTheme.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: lightTheme.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardInactive: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInactive: {
    backgroundColor: lightTheme.border,
  },
  avatarText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.sm,
    color: lightTheme.primary,
  },
  avatarTextInactive: {
    color: lightTheme.textTertiary,
  },
  name: {
    flex: 1,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.base,
    color: lightTheme.text,
  },
  nameInactive: {
    color: lightTheme.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: normalize(2),
  },
  statValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.md,
    color: lightTheme.text,
  },
  statLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: lightTheme.textSecondary,
    textAlign: 'center',
  },
  textMuted: {
    color: lightTheme.textTertiary,
  },
  lastActive: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: lightTheme.textSecondary,
  },
  inactiveLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    color: lightTheme.textTertiary,
  },
});
