import React, { useState, useMemo, useCallback } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';
import { getSurah } from '@/lib/quran-metadata';
import { SurahAyahPicker } from './SurahAyahPicker';
import {
  useAllRubReferences,
  resolveRubRange,
  resolveHizbRange,
  resolveJuzRange,
} from '@/features/scheduling/hooks/useQuranRubReference';
import type { SelectionMode } from '@/features/scheduling/types/recitation-plan.types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface QuranRangePickerProps {
  selectionMode: SelectionMode;
  onChangeSelectionMode: (mode: SelectionMode) => void;
  surahNumber: number | null;
  fromAyah: number | null;
  toAyah: number | null;
  onChangeSurah: (surah: number) => void;
  onChangeFromAyah: (ayah: number) => void;
  onChangeToAyah: (ayah: number) => void;
  rubNumber: number | null;
  hizbNumber: number | null;
  juzNumber: number | null;
  onChangeRub: (rub: number) => void;
  onChangeHizb: (hizb: number) => void;
  onChangeJuz: (juz: number) => void;
  /** Called when juz/hizb/rub resolves to an ayah range */
  onResolvedRange: (range: { start_surah: number; start_ayah: number; end_surah: number; end_ayah: number }) => void;
  style?: ViewStyle;
}

const MODES: SelectionMode[] = ['ayah_range', 'rub', 'hizb', 'juz'];

// ─── Component ───────────────────────────────────────────────────────────────

export function QuranRangePicker({
  selectionMode,
  onChangeSelectionMode,
  surahNumber,
  fromAyah,
  toAyah,
  onChangeSurah,
  onChangeFromAyah,
  onChangeToAyah,
  rubNumber,
  hizbNumber,
  juzNumber,
  onChangeRub,
  onChangeHizb,
  onChangeJuz,
  onResolvedRange,
  style,
}: QuranRangePickerProps) {
  const { t } = useTranslation();
  const { data: rubData = [] } = useAllRubReferences();

  const resolvedRangeText = useMemo(() => {
    let range: ReturnType<typeof resolveRubRange> = null;

    if (selectionMode === 'rub' && rubNumber) {
      range = resolveRubRange(rubData, rubNumber);
    } else if (selectionMode === 'hizb' && hizbNumber) {
      range = resolveHizbRange(rubData, hizbNumber);
    } else if (selectionMode === 'juz' && juzNumber) {
      range = resolveJuzRange(rubData, juzNumber);
    }

    if (!range) return null;

    const startSurah = getSurah(range.start_surah);
    const endSurah = getSurah(range.end_surah);

    return t('scheduling.recitationPlan.resolvedRange', {
      startSurah: startSurah?.nameEnglish ?? range.start_surah,
      startAyah: range.start_ayah,
      endSurah: endSurah?.nameEnglish ?? range.end_surah,
      endAyah: range.end_ayah,
    });
  }, [selectionMode, rubNumber, hizbNumber, juzNumber, rubData, t]);

  const handleModeChange = useCallback(
    (mode: SelectionMode) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChangeSelectionMode(mode);
    },
    [onChangeSelectionMode],
  );

  const handleNumberSelect = useCallback(
    (value: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (selectionMode === 'rub') {
        onChangeRub(value);
        const range = resolveRubRange(rubData, value);
        if (range) onResolvedRange(range);
      } else if (selectionMode === 'hizb') {
        onChangeHizb(value);
        const range = resolveHizbRange(rubData, value);
        if (range) onResolvedRange(range);
      } else if (selectionMode === 'juz') {
        onChangeJuz(value);
        const range = resolveJuzRange(rubData, value);
        if (range) onResolvedRange(range);
      }
    },
    [selectionMode, rubData, onChangeRub, onChangeHizb, onChangeJuz, onResolvedRange],
  );

  return (
    <View style={[styles.root, style]}>
      {/* Mode Selector */}
      <View style={styles.modeRow}>
        {MODES.map((mode) => {
          const isActive = selectionMode === mode;
          return (
            <Pressable
              key={mode}
              onPress={() => handleModeChange(mode)}
              style={[styles.modeChip, isActive && styles.modeChipActive]}
            >
              <Text style={[styles.modeText, isActive && styles.modeTextActive]}>
                {t(`scheduling.recitationPlan.modes.${mode}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Ayah Range Mode — wraps existing SurahAyahPicker */}
      {selectionMode === 'ayah_range' && (
        <SurahAyahPicker
          surahNumber={surahNumber}
          fromAyah={fromAyah}
          toAyah={toAyah}
          onChangeSurah={onChangeSurah}
          onChangeFromAyah={onChangeFromAyah}
          onChangeToAyah={onChangeToAyah}
        />
      )}

      {/* Rub' / Hizb / Juz Number Picker */}
      {selectionMode !== 'ayah_range' && (
        <NumberPicker
          mode={selectionMode}
          value={
            selectionMode === 'rub' ? rubNumber :
            selectionMode === 'hizb' ? hizbNumber :
            juzNumber
          }
          onSelect={handleNumberSelect}
        />
      )}

      {/* Resolved Range Display */}
      {resolvedRangeText && selectionMode !== 'ayah_range' && (
        <View style={styles.resolvedRow}>
          <Ionicons name="location-outline" size={normalize(14)} color={colors.primary[500]} />
          <Text style={styles.resolvedText}>{resolvedRangeText}</Text>
        </View>
      )}
    </View>
  );
}

// ─── NumberPicker Sub-component ──────────────────────────────────────────────

interface NumberPickerProps {
  mode: 'rub' | 'hizb' | 'juz';
  value: number | null;
  onSelect: (value: number) => void;
}

const LIMITS: Record<string, number> = { rub: 240, hizb: 60, juz: 30 };
const LABEL_KEYS: Record<string, string> = {
  rub: 'scheduling.recitationPlan.rubNumber',
  hizb: 'scheduling.recitationPlan.hizbNumber',
  juz: 'scheduling.recitationPlan.juzNumber',
};

function NumberPicker({ mode, value, onSelect }: NumberPickerProps) {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const max = LIMITS[mode];

  const numbers = useMemo(() => Array.from({ length: max }, (_, i) => i + 1), [max]);

  const handleSelect = useCallback(
    (num: number) => {
      onSelect(num);
      setModalVisible(false);
    },
    [onSelect],
  );

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{t(LABEL_KEYS[mode])}</Text>
      <Pressable
        onPress={() => setModalVisible(true)}
        style={styles.trigger}
        accessibilityRole="combobox"
      >
        {value ? (
          <Text style={styles.triggerValue}>{value}</Text>
        ) : (
          <Text style={styles.placeholderText}>{t('common.select')}</Text>
        )}
        <Ionicons name="chevron-down" size={normalize(20)} color={lightTheme.textTertiary} />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <View style={styles.dropdown} onStartShouldSetResponder={() => true}>
            <Text style={styles.dropdownTitle}>{t(LABEL_KEYS[mode])}</Text>
            <FlatList
              data={numbers}
              keyExtractor={(item) => String(item)}
              numColumns={5}
              columnWrapperStyle={styles.gridRow}
              renderItem={({ item }) => {
                const isSelected = item === value;
                return (
                  <Pressable
                    onPress={() => handleSelect(item)}
                    style={[styles.gridItem, isSelected && styles.gridItemSelected]}
                  >
                    <Text style={[styles.gridText, isSelected && styles.gridTextSelected]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    width: '100%',
    gap: spacing.sm,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  modeChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
  },
  modeChipActive: {
    backgroundColor: colors.primary[500],
  },
  modeText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: lightTheme.textSecondary,
  },
  modeTextActive: {
    color: colors.white,
  },
  field: {
    width: '100%',
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: lightTheme.text,
    marginBottom: spacing.sm,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: lightTheme.border,
    borderRadius: radius.md,
    backgroundColor: lightTheme.background,
    minHeight: normalize(48),
    paddingHorizontal: spacing.md,
  },
  triggerValue: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.base,
    color: lightTheme.text,
  },
  placeholderText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: lightTheme.textTertiary,
  },
  resolvedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  resolvedText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: colors.primary[600],
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  dropdown: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    width: '100%',
    maxWidth: normalize(380),
    maxHeight: normalize(480),
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  dropdownTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
    color: lightTheme.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  gridRow: {
    justifyContent: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  gridItem: {
    width: normalize(56),
    height: normalize(44),
    borderRadius: radius.md,
    backgroundColor: colors.neutral[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridItemSelected: {
    backgroundColor: colors.primary[500],
  },
  gridText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: lightTheme.text,
  },
  gridTextSelected: {
    color: colors.white,
  },
});
