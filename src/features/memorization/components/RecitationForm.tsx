import React, { useState } from 'react';
import { StyleSheet, Text, View, Switch, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { ScoreInput } from '@/components/forms/ScoreInput';
import { SurahAyahPicker } from './SurahAyahPicker';
import { RecitationTypeChips } from './RecitationTypeChip';

import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';
import { getSurah } from '@/lib/quran-metadata';
import type { RecitationType } from '@/types/common.types';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RecitationFormData {
  surah_number: number;
  from_ayah: number;
  to_ayah: number;
  recitation_type: RecitationType;
  accuracy_score: number | null;
  tajweed_score: number | null;
  fluency_score: number | null;
  needs_repeat: boolean;
  mistake_notes: string;
}

interface RecitationFormProps {
  index: number;
  data: RecitationFormData;
  onChange: (data: RecitationFormData) => void;
  onRemove: () => void;
  style?: ViewStyle;
}

// ─── Default Data ────────────────────────────────────────────────────────────

export const EMPTY_RECITATION: RecitationFormData = {
  surah_number: 0,
  from_ayah: 0,
  to_ayah: 0,
  recitation_type: 'new_hifz',
  accuracy_score: null,
  tajweed_score: null,
  fluency_score: null,
  needs_repeat: false,
  mistake_notes: '',
};

// ─── Validation ──────────────────────────────────────────────────────────────

export function validateRecitationForm(data: RecitationFormData): Record<string, string> | null {
  const errors: Record<string, string> = {};

  if (data.surah_number < 1 || data.surah_number > 114) {
    errors.surah_number = 'Please select a surah';
  }

  const surah = data.surah_number > 0 ? getSurah(data.surah_number) : null;
  const maxAyah = surah?.ayahCount ?? 0;

  if (data.from_ayah < 1) {
    errors.from_ayah = 'Required';
  } else if (surah && data.from_ayah > maxAyah) {
    errors.from_ayah = `Max ${maxAyah}`;
  }

  if (data.to_ayah < 1) {
    errors.to_ayah = 'Required';
  } else if (surah && data.to_ayah > maxAyah) {
    errors.to_ayah = `Max ${maxAyah}`;
  } else if (data.to_ayah < data.from_ayah) {
    errors.to_ayah = 'Must be >= from ayah';
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RecitationForm({ index, data, onChange, onRemove, style }: RecitationFormProps) {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof RecitationFormData>(field: K, value: RecitationFormData[K]) => {
    const next = { ...data, [field]: value };
    onChange(next);
    // Clear field error on change
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  return (
    <Card variant="outlined" style={StyleSheet.flatten([styles.root, style])}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('memorization.recitationForm.title', { number: index + 1 })}</Text>
        <Button
          title={t('common.remove')}
          onPress={onRemove}
          variant="ghost"
          size="sm"
          icon={<Ionicons name="close-circle-outline" size={16} color={colors.semantic.error} />}
        />
      </View>

      {/* Surah & Ayah Picker */}
      <SurahAyahPicker
        surahNumber={data.surah_number || null}
        fromAyah={data.from_ayah || null}
        toAyah={data.to_ayah || null}
        onChangeSurah={(v) => update('surah_number', v)}
        onChangeFromAyah={(v) => update('from_ayah', v)}
        onChangeToAyah={(v) => update('to_ayah', v)}
        surahError={errors.surah_number}
        fromAyahError={errors.from_ayah}
        toAyahError={errors.to_ayah}
      />

      {/* Recitation Type */}
      <RecitationTypeChips
        value={data.recitation_type}
        onChange={(v) => update('recitation_type', v)}
      />

      {/* Scores */}
      <ScoreInput
        label={t('memorization.recitationForm.accuracy')}
        value={data.accuracy_score}
        onChange={(v) => update('accuracy_score', v)}
      />
      <ScoreInput
        label={t('memorization.recitationForm.tajweed')}
        value={data.tajweed_score}
        onChange={(v) => update('tajweed_score', v)}
      />
      <ScoreInput
        label={t('memorization.recitationForm.fluency')}
        value={data.fluency_score}
        onChange={(v) => update('fluency_score', v)}
      />

      {/* Needs Repeat Toggle */}
      <View style={styles.toggleRow}>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleLabel}>{t('memorization.recitationForm.needsRepeat')}</Text>
          <Text style={styles.toggleDescription}>{t('memorization.recitationForm.needsRepeatDesc')}</Text>
        </View>
        <Switch
          value={data.needs_repeat}
          onValueChange={(v) => update('needs_repeat', v)}
          trackColor={{ false: colors.neutral[200], true: colors.primary[400] }}
          thumbColor={data.needs_repeat ? colors.primary[600] : colors.neutral[50]}
          accessibilityRole="switch"
          accessibilityLabel="Needs repeat"
        />
      </View>

      {/* Mistake Notes */}
      <TextField
        label={t('memorization.recitationForm.mistakeNotes')}
        placeholder={t('memorization.recitationForm.mistakeNotesPlaceholder')}
        value={data.mistake_notes}
        onChangeText={(v) => update('mistake_notes', v)}
        multiline
      />
    </Card>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
    fontSize: normalize(14),
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: lightTheme.text,
  },
  toggleDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: lightTheme.textTertiary,
    marginTop: normalize(2),
  },
});
