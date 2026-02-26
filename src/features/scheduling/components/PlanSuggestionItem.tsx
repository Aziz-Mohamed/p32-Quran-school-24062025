import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';

interface PlanSuggestionItemProps {
  label: string;
  rubContext: string | null;
  selected: boolean;
  onToggle: () => void;
  trailing?: React.ReactNode;
}

export const PlanSuggestionItem = React.memo(function PlanSuggestionItem({
  label,
  rubContext,
  selected,
  onToggle,
  trailing,
}: PlanSuggestionItemProps) {
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [
        styles.item,
        selected && styles.itemSelected,
        pressed && styles.itemPressed,
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
    >
      <View style={styles.content}>
        <Ionicons
          name={selected ? 'checkbox' : 'square-outline'}
          size={normalize(18)}
          color={selected ? colors.primary[500] : colors.neutral[400]}
        />
        <View style={styles.textCol}>
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
          {rubContext != null && (
            <Text style={styles.rubContext}>{rubContext}</Text>
          )}
        </View>
        {trailing}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  itemSelected: {
    backgroundColor: colors.primary[50],
  },
  itemPressed: {
    backgroundColor: colors.neutral[100],
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  textCol: {
    flex: 1,
    flexShrink: 1,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: lightTheme.text,
  },
  rubContext: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: lightTheme.textTertiary,
    marginTop: normalize(1),
  },
});
