import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import type { EnrichedCertification } from '../types/gamification.types';
import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';

type RevisionAction = 'good' | 'poor' | 'recertify';

interface RevisionSheetProps {
  visible: boolean;
  certification: EnrichedCertification | null;
  onAction: (action: RevisionAction) => void;
  onClose: () => void;
}

/**
 * Revision modal for certified rubʿ.
 *
 * For active rubʿ: shows "Good" and "Poor" options.
 * For dormant rubʿ:
 *   - 0-90 days: shows "Good" revision (restores)
 *   - 90+ days: shows "Re-certify" option
 *   - "Poor" is disabled for dormant rubʿ (cannot restore dormancy)
 */
export function RevisionSheet({
  visible,
  certification,
  onAction,
  onClose,
}: RevisionSheetProps) {
  const { t } = useTranslation();

  if (!certification) return null;

  const isDormant = certification.freshness.state === 'dormant';
  const dormantDays = certification.dormant_since
    ? (Date.now() - Date.parse(certification.dormant_since)) / (24 * 60 * 60 * 1000)
    : 0;
  const needsRecertification = isDormant && dormantDays >= 90;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {t('gamification.rub')} {certification.rub_number}
            </Text>
            <View style={[
              styles.freshnessChip,
              { backgroundColor: FRESHNESS_CHIP_COLORS[certification.freshness.state] },
            ]}>
              <Text style={styles.freshnessText}>
                {t(`gamification.freshness.${certification.freshness.state}`)}
              </Text>
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('gamification.freshness.fresh')}</Text>
            <Text style={styles.infoValue}>{certification.freshness.percentage}%</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {needsRecertification ? (
              <ActionButton
                icon="refresh-circle"
                label={t('gamification.revision.recertify')}
                description={t('gamification.revision.recertifyDesc')}
                color={colors.accent.violet[500]}
                onPress={() => onAction('recertify')}
              />
            ) : (
              <>
                <ActionButton
                  icon="checkmark-circle"
                  label={t('gamification.revision.good')}
                  description={t('gamification.revision.goodDesc')}
                  color={colors.primary[500]}
                  onPress={() => onAction('good')}
                />
                {!isDormant && (
                  <ActionButton
                    icon="alert-circle"
                    label={t('gamification.revision.poor')}
                    description={t('gamification.revision.poorDesc')}
                    color={colors.secondary[500]}
                    onPress={() => onAction('poor')}
                  />
                )}
              </>
            )}
          </View>

          {/* Cancel */}
          <Pressable
            style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text style={styles.cancelLabel}>{t('common.cancel')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ActionButton({
  icon,
  label,
  description,
  color,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  description: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Ionicons name={icon} size={24} color={color} />
      <View style={styles.actionText}>
        <Text style={[styles.actionLabel, { color }]}>{label}</Text>
        <Text style={styles.actionDesc}>{description}</Text>
      </View>
    </Pressable>
  );
}

const FRESHNESS_CHIP_COLORS: Record<string, string> = {
  fresh: '#DCFCE7',
  fading: '#FEF9C3',
  warning: '#FFEDD5',
  critical: '#FEE2E2',
  dormant: '#F3F4F6',
  uncertified: '#F3F4F6',
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopStartRadius: radius.xl,
    borderTopEndRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  title: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
  },
  freshnessChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  freshnessText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(12),
    color: colors.neutral[700],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: radius.sm,
    marginBottom: spacing.base,
  },
  infoLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(13),
    color: colors.neutral[500],
  },
  infoValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(13),
    color: colors.neutral[800],
  },
  actions: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
  },
  pressed: {
    opacity: 0.7,
  },
  actionText: {
    flex: 1,
    gap: normalize(2),
  },
  actionLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(15),
  },
  actionDesc: {
    fontFamily: typography.fontFamily.regular,
    fontSize: normalize(12),
    color: colors.neutral[500],
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  cancelLabel: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[500],
  },
});
