import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';
import { SCORE_RANGE } from '@/lib/constants';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ScoreInputProps {
  label?: string;
  value: number | null;
  onChange: (score: number) => void;
  error?: string;
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────────────────

const scores = Array.from(
  { length: SCORE_RANGE.max - SCORE_RANGE.min + 1 },
  (_, i) => SCORE_RANGE.min + i,
);

export function ScoreInput({ label, value, onChange, error, style }: ScoreInputProps) {
  const hasError = error != null && error.length > 0;

  return (
    <View style={[styles.root, style]}>
      {label != null && label.length > 0 && (
        <Text style={styles.label}>{label}</Text>
      )}

      <View style={styles.row}>
        {scores.map((score) => {
          const isSelected = value === score;
          return (
            <Pressable
              key={score}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChange(score);
              }}
              style={({ pressed }) => [
                styles.scoreButton,
                isSelected && styles.scoreButtonSelected,
                hasError && !isSelected && styles.scoreButtonError,
                pressed && styles.scoreButtonPressed,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Score ${score}`}
            >
              <Text
                style={[
                  styles.scoreText,
                  isSelected && styles.scoreTextSelected,
                ]}
              >
                {score}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: lightTheme.text,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  scoreButton: {
    flex: 1,
    minHeight: normalize(48),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: lightTheme.border,
    borderRadius: radius.md,
    backgroundColor: lightTheme.background,
  },
  scoreButtonSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  scoreButtonError: {
    borderColor: lightTheme.error,
  },
  scoreButtonPressed: {
    opacity: 0.7,
  },
  scoreText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    color: lightTheme.textSecondary,
  },
  scoreTextSelected: {
    color: colors.primary[700],
  },
  errorText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: lightTheme.error,
    marginTop: spacing.xs,
    marginStart: spacing.xs,
  },
});
