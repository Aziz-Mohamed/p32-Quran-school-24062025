import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { RubBlock } from './RubBlock';
import type { RubProgressItem } from '../types/gamification.types';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { normalize } from '@/theme/normalize';

interface JuzRowProps {
  juzNumber: number;
  items: RubProgressItem[];
  onRubPress?: (item: RubProgressItem) => void;
}

export function JuzRow({ juzNumber, items, onRubPress }: JuzRowProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const expandAnim = useSharedValue(0);

  const certifiedCount = items.filter((i) => i.state !== 'uncertified').length;
  const total = items.length;
  const progress = total > 0 ? certifiedCount / total : 0;

  const hideContent = useCallback(() => setShowContent(false), []);

  const toggleExpanded = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = !expanded;
    setExpanded(next);
    if (next) {
      setShowContent(true);
      expandAnim.value = withTiming(1, { duration: 250 });
    } else {
      expandAnim.value = withTiming(0, { duration: 250 }, (finished) => {
        if (finished) runOnJS(hideContent)();
      });
    }
  };

  const contentStyle = useAnimatedStyle(() => ({
    opacity: expandAnim.value,
    maxHeight: expandAnim.value * 300,
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${expandAnim.value * 90}deg` }],
  }));

  return (
    <View style={styles.container}>
      <Pressable onPress={toggleExpanded} style={styles.header} accessibilityRole="button">
        <View style={styles.headerStart}>
          <View style={styles.juzBadge}>
            <Text style={styles.juzNumber}>{juzNumber}</Text>
          </View>
          <View style={styles.juzInfo}>
            <Text style={styles.juzLabel}>
              {t('gamification.juz')} {juzNumber}
            </Text>
            <Text style={styles.juzCount}>
              {certifiedCount}/{total}
            </Text>
          </View>
        </View>
        <View style={styles.headerEnd}>
          <View style={styles.miniBar}>
            <View style={[styles.miniBarFill, { width: `${progress * 100}%` }]} />
          </View>
          <Animated.View style={chevronStyle}>
            <Ionicons name="chevron-forward" size={18} color={colors.neutral[400]} />
          </Animated.View>
        </View>
      </Pressable>

      {showContent && (
        <Animated.View style={[styles.rubGrid, contentStyle]}>
          {items.map((item) => (
            <RubBlock
              key={item.reference.rub_number}
              rubNumber={item.reference.rub_number}
              state={item.state}
              onPress={onRubPress ? () => onRubPress(item) : undefined}
            />
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.04)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerStart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  juzBadge: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  juzNumber: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(13),
    color: colors.primary[700],
  },
  juzInfo: {
    gap: normalize(2),
  },
  juzLabel: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(14),
    color: colors.neutral[800],
  },
  juzCount: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(12),
    color: colors.neutral[500],
  },
  headerEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  miniBar: {
    width: normalize(48),
    height: normalize(6),
    borderRadius: normalize(3),
    backgroundColor: colors.neutral[100],
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: normalize(3),
    backgroundColor: colors.primary[500],
  },
  rubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
});
