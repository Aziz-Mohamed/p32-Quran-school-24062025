import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { STICKER_EMOJI_CATEGORIES } from '@/lib/stickerEmojis';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';

interface EmojiPickerProps {
  label?: string;
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ label, value, onChange }: EmojiPickerProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Pressable style={styles.preview} onPress={() => setExpanded(!expanded)}>
        <Text style={styles.previewEmoji}>{value || '⭐'}</Text>
        <Text style={styles.previewHint}>
          {expanded ? 'Tap to close' : 'Tap to choose icon'}
        </Text>
      </Pressable>

      {expanded && (
        <ScrollView style={styles.grid} nestedScrollEnabled>
          {STICKER_EMOJI_CATEGORIES.map((category) => (
            <View key={category.key} style={styles.categoryRow}>
              {category.emojis.map((opt) => {
                const isSelected = opt.emoji === value;
                return (
                  <Pressable
                    key={opt.emoji}
                    onPress={() => {
                      onChange(opt.emoji);
                      setExpanded(false);
                    }}
                    style={[
                      styles.emojiButton,
                      isSelected && styles.emojiButtonSelected,
                    ]}
                    accessibilityLabel={opt.label}
                  >
                    <Text style={styles.emoji}>{opt.emoji}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.textStyles.label,
    color: lightTheme.text,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: lightTheme.border,
    borderRadius: radius.md,
    backgroundColor: lightTheme.surface,
  },
  previewEmoji: {
    fontSize: 36,
  },
  previewHint: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
  },
  grid: {
    maxHeight: 260,
    borderWidth: 1,
    borderColor: lightTheme.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: lightTheme.surface,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  emojiButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiButtonSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  emoji: {
    fontSize: 28,
  },
});
