import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';
import { shadows } from '@/theme/shadows';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RecitationTypeChip } from '@/features/memorization/components/RecitationTypeChip';
import { getSurah } from '@/lib/quran-metadata';
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
  const { t } = useTranslation();

  const rangeText = useMemo(() => {
    const startSurah = getSurah(plan.start_surah);
    const endSurah = getSurah(plan.end_surah);
    const startName = startSurah?.nameEnglish ?? String(plan.start_surah);
    const endName = endSurah?.nameEnglish ?? String(plan.end_surah);

    if (plan.start_surah === plan.end_surah) {
      return `${startName} ${plan.start_ayah}–${plan.end_ayah}`;
    }
    return `${startName} ${plan.start_ayah} – ${endName} ${plan.end_ayah}`;
  }, [plan.start_surah, plan.start_ayah, plan.end_surah, plan.end_ayah]);

  const modeBadgeLabel = t(`scheduling.recitationPlan.modes.${plan.selection_mode}`);
  const sourceBadgeLabel =
    plan.source === 'from_assignment'
      ? t('scheduling.recitationPlan.fromAssignment')
      : t('scheduling.recitationPlan.manual');

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

      {/* Badges row */}
      <View style={styles.badgeRow}>
        <Badge label={modeBadgeLabel} variant="info" size="sm" />
        <Badge
          label={sourceBadgeLabel}
          variant={plan.source === 'from_assignment' ? 'indigo' : 'default'}
          size="sm"
        />
        <RecitationTypeChip
          type={plan.recitation_type as 'new_hifz' | 'recent_review' | 'old_review'}
        />
      </View>

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
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
    alignItems: 'center',
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
