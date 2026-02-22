import React from 'react';
import { I18nManager, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import type { RubCoverage } from '../utils/rub-coverage';
import { formatRubVerseRange } from '@/lib/quran-metadata';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { normalize } from '@/theme/normalize';
import i18next from 'i18next';

interface RubBuildingBlockProps {
  coverage: RubCoverage;
  isComplete: boolean;
}

const BLOCK_HEIGHT = normalize(80);

export function RubBuildingBlock({ coverage, isComplete }: RubBuildingBlockProps) {
  const { t } = useTranslation();
  const lang = (i18next.language === 'ar' ? 'ar' : 'en') as 'ar' | 'en';

  const fillPercent = useDerivedValue(() => coverage.percentage / 100);
  const fillHeight = useDerivedValue(() =>
    withSpring(fillPercent.value * BLOCK_HEIGHT, {
      damping: 20,
      stiffness: 90,
    }),
  );

  const fillStyle = useAnimatedStyle(() => ({
    height: fillHeight.value,
  }));

  const fillColor = isComplete ? colors.primary[400] : colors.accent.indigo[500];
  const borderColor = isComplete ? colors.primary[500] : colors.accent.indigo[100];

  const verseRange = formatRubVerseRange(
    coverage.startSurah,
    coverage.startAyah,
    coverage.endSurah,
    coverage.endAyah,
    lang,
  );

  return (
    <View style={[styles.container, { borderColor }]}>
      {/* Fill bar — animated from bottom */}
      <Animated.View
        style={[
          styles.fill,
          fillStyle,
          { backgroundColor: fillColor },
        ]}
      />

      {/* Content overlay */}
      <View style={styles.overlay}>
        <View style={styles.topRow}>
          <Text style={styles.rubLabel}>
            {t('gamification.rub')} {coverage.rubNumber}
          </Text>
          <Text style={styles.juzLabel}>
            {t('gamification.juz')} {coverage.juzNumber}
          </Text>
        </View>

        <Text style={styles.ayahProgress}>
          {t('student.blockBuilder.ayahProgress', {
            memorized: coverage.memorizedAyahs,
            total: coverage.totalAyahs,
          })}
        </Text>

        <Text style={styles.verseRange} numberOfLines={1}>
          {verseRange}
        </Text>

        {isComplete && (
          <View style={styles.readyBadge}>
            <Ionicons name="checkmark-circle" size={normalize(14)} color={colors.primary[700]} />
            <Text style={styles.readyText}>
              {t('student.blockBuilder.ready')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: BLOCK_HEIGHT,
    borderRadius: radius.md,
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: colors.neutral[50],
    marginBottom: spacing.sm,
  },
  fill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: radius.md - 1,
    opacity: 0.25,
  },
  overlay: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    gap: normalize(2),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rubLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(15),
    color: colors.neutral[900],
  },
  juzLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(11),
    color: colors.neutral[500],
  },
  ayahProgress: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(13),
    color: colors.accent.indigo[600],
  },
  verseRange: {
    fontFamily: typography.fontFamily.regular,
    fontSize: normalize(11),
    color: colors.neutral[500],
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
    marginTop: normalize(2),
  },
  readyText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(11),
    color: colors.primary[700],
  },
});
