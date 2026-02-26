import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getSurah } from '@/lib/quran-metadata';
import { useAllRubReferences, findRubForAyah } from '@/features/scheduling/hooks/useQuranRubReference';
import type { RecitationPlanWithDetails } from '@/features/scheduling/types/recitation-plan.types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RecitationPlanCardProps {
  plan: RecitationPlanWithDetails;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RecitationPlanCard({
  plan,
  canManage,
  onEdit,
  onDelete,
}: RecitationPlanCardProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { data: rubData = [] } = useAllRubReferences();

  const rangeText = useMemo(() => {
    const startSurah = getSurah(plan.start_surah);
    const endSurah = getSurah(plan.end_surah);
    const startName = isArabic
      ? (startSurah?.nameArabic ?? startSurah?.nameEnglish ?? String(plan.start_surah))
      : (startSurah?.nameEnglish ?? String(plan.start_surah));
    const endName = isArabic
      ? (endSurah?.nameArabic ?? endSurah?.nameEnglish ?? String(plan.end_surah))
      : (endSurah?.nameEnglish ?? String(plan.end_surah));

    if (plan.start_surah === plan.end_surah) {
      return `${startName} ${plan.start_ayah}–${plan.end_ayah}`;
    }
    return `${startName} ${plan.start_ayah} – ${endName} ${plan.end_ayah}`;
  }, [plan.start_surah, plan.start_ayah, plan.end_surah, plan.end_ayah, isArabic]);

  const rubContext = useMemo(() => {
    if (rubData.length === 0) return null;
    const info = findRubForAyah(rubData, plan.start_surah, plan.start_ayah);
    if (!info) return null;
    return `${t('gamification.rub')} ${info.rub_number} · ${t('gamification.juz')} ${info.juz_number}`;
  }, [rubData, plan.start_surah, plan.start_ayah, t]);

  const setterName = plan.setter?.full_name;

  return (
    <Card variant="outlined" style={styles.card}>
      {/* Header row: range + badges */}
      <View style={styles.headerRow}>
        <View style={styles.rangeContainer}>
          <Ionicons
            name="book-outline"
            size={normalize(18)}
            color={colors.primary[500]}
          />
          <Text style={styles.rangeText} numberOfLines={2}>
            {rangeText}
          </Text>
        </View>
      </View>

      {/* Rub/Juz context */}
      {rubContext != null && (
        <Text style={styles.rubContextText}>{rubContext}</Text>
      )}

      {/* Set-by attribution */}
      {setterName != null && (
        <View style={styles.attributionRow}>
          <Ionicons
            name="person-outline"
            size={normalize(14)}
            color={lightTheme.textTertiary}
          />
          <Text style={styles.attributionText}>
            {t('scheduling.recitationPlan.setBy', { name: setterName })}
          </Text>
        </View>
      )}

      {/* Notes */}
      {plan.notes != null && plan.notes.length > 0 && (
        <Text style={styles.notesText} numberOfLines={3}>
          {plan.notes}
        </Text>
      )}

      {/* Action buttons */}
      {canManage && (
        <View style={styles.actionRow}>
          <Button
            title={t('scheduling.recitationPlan.editPlan')}
            onPress={onEdit}
            variant="ghost"
            size="sm"
            icon={
              <Ionicons
                name="pencil-outline"
                size={normalize(16)}
                color={colors.primary[600]}
              />
            }
          />
          <Button
            title={t('scheduling.recitationPlan.removePlan')}
            onPress={onDelete}
            variant="ghost"
            size="sm"
            icon={
              <Ionicons
                name="trash-outline"
                size={normalize(16)}
                color={lightTheme.error}
              />
            }
            style={styles.deleteButton}
          />
        </View>
      )}
    </Card>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    padding: spacing.base,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  rangeText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.base,
    color: lightTheme.text,
    flex: 1,
  },
  rubContextText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: lightTheme.textTertiary,
  },
  attributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  attributionText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: lightTheme.textSecondary,
  },
  notesText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: lightTheme.textSecondary,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  deleteButton: {
    opacity: 0.8,
  },
});
