import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

import type { RubCoverage } from '../utils/rub-coverage';
import { ProgressBar } from '@/components/ui';
import { formatRubVerseRange, getMushafPage } from '@/lib/quran-metadata';
import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';

// ─── Props ──────────────────────────────────────────────────────────────────

interface RubDetailSheetProps {
  visible: boolean;
  coverage: RubCoverage | null;
  isComplete: boolean;
  onClose: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function RubDetailSheet({ visible, coverage, isComplete, onClose }: RubDetailSheetProps) {
  const { t } = useTranslation();

  if (!coverage) return null;

  const lang = i18next.language?.startsWith('ar') ? 'ar' : 'en';
  const mushafPage = getMushafPage(coverage.rubNumber);
  const verseRange = formatRubVerseRange(
    coverage.startSurah,
    coverage.startAyah,
    coverage.endSurah,
    coverage.endAyah,
    lang,
  );

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
            <View style={styles.headerLeft}>
              <Text style={styles.title}>
                {t('gamification.rub')} {coverage.rubNumber} {'\u00B7'}{' '}
                {t('gamification.juz')} {coverage.juzNumber}
              </Text>
              <Text style={styles.verseRange}>{verseRange}</Text>
            </View>
            <View
              style={[
                styles.pctChip,
                { backgroundColor: isComplete ? '#DCFCE7' : '#DBEAFE' },
              ]}
            >
              <Text
                style={[
                  styles.pctChipText,
                  { color: isComplete ? '#166534' : '#1E40AF' },
                ]}
              >
                {coverage.percentage}%
              </Text>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <InfoRow
              label={t('memorization.detail.verseRange')}
              value={verseRange}
            />
            {mushafPage != null && (
              <InfoRow
                label={t('memorization.detail.mushafPage')}
                value={`${mushafPage}`}
              />
            )}
            <InfoRow
              label={t('memorization.detail.memorized')}
              value={t('memorization.detail.ayahsCount', {
                memorized: coverage.memorizedAyahs,
                total: coverage.totalAyahs,
              })}
            />
            <InfoRow
              label={t('memorization.detail.status')}
              value={
                isComplete
                  ? t('memorization.detail.complete')
                  : t('memorization.detail.inProgress')
              }
            />

            {/* Progress bar */}
            <View style={styles.progressRow}>
              <View style={styles.progressBarContainer}>
                <ProgressBar
                  progress={coverage.percentage / 100}
                  variant="primary"
                  height={6}
                />
              </View>
              <Text style={styles.progressPct}>{coverage.percentage}%</Text>
            </View>
          </View>

          {/* Close */}
          <Pressable
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text style={styles.closeLabel}>{t('common.close')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  headerLeft: {
    flex: 1,
    gap: normalize(2),
  },
  title: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
  },
  verseRange: {
    fontFamily: typography.fontFamily.regular,
    fontSize: normalize(13),
    color: colors.neutral[500],
    marginTop: normalize(2),
  },
  pctChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginStart: spacing.sm,
  },
  pctChipText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(13),
  },

  // Info Card
  infoCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.base,
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(13),
    color: colors.neutral[500],
  },
  infoValue: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(13),
    color: colors.neutral[800],
  },

  // Progress bar
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  progressBarContainer: {
    flex: 1,
  },
  progressPct: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(12),
    color: colors.neutral[600],
    minWidth: normalize(32),
    textAlign: 'right',
  },

  // Close
  closeButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  closeLabel: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[500],
  },
});
