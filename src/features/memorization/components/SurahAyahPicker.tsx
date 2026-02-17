import React, { useState, useCallback, useMemo } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';
import { SURAHS, getSurah } from '@/lib/quran-metadata';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SurahAyahPickerProps {
  surahNumber: number | null;
  fromAyah: number | null;
  toAyah: number | null;
  onChangeSurah: (surah: number) => void;
  onChangeFromAyah: (ayah: number) => void;
  onChangeToAyah: (ayah: number) => void;
  surahError?: string;
  fromAyahError?: string;
  toAyahError?: string;
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SurahAyahPicker({
  surahNumber,
  fromAyah,
  toAyah,
  onChangeSurah,
  onChangeFromAyah,
  onChangeToAyah,
  surahError,
  fromAyahError,
  toAyahError,
  style,
}: SurahAyahPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selectedSurah = surahNumber ? getSurah(surahNumber) : null;
  const maxAyah = selectedSurah?.ayahCount ?? 999;

  const filteredSurahs = useMemo(() => {
    if (!search.trim()) return SURAHS;
    const q = search.trim().toLowerCase();
    return SURAHS.filter(
      (s) =>
        s.nameEnglish.toLowerCase().includes(q) ||
        s.nameArabic.includes(q) ||
        String(s.number).includes(q),
    );
  }, [search]);

  const handleSelectSurah = useCallback(
    (num: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChangeSurah(num);
      setModalVisible(false);
      setSearch('');
    },
    [onChangeSurah],
  );

  const parseAyah = (text: string): number | null => {
    const n = parseInt(text, 10);
    return isNaN(n) ? null : n;
  };

  const hasSurahError = surahError != null && surahError.length > 0;
  const hasFromError = fromAyahError != null && fromAyahError.length > 0;
  const hasToError = toAyahError != null && toAyahError.length > 0;

  return (
    <View style={[styles.root, style]}>
      {/* Surah Selector */}
      <View style={styles.field}>
        <Text style={styles.label}>Surah</Text>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={[styles.trigger, hasSurahError && styles.triggerError]}
          accessibilityRole="combobox"
          accessibilityLabel="Select surah"
        >
          {selectedSurah ? (
            <View style={styles.surahDisplay}>
              <Text style={styles.surahNumber}>{selectedSurah.number}.</Text>
              <Text style={styles.surahName}>{selectedSurah.nameEnglish}</Text>
              <Text style={styles.surahArabic}>{selectedSurah.nameArabic}</Text>
            </View>
          ) : (
            <Text style={styles.placeholderText}>Select surah...</Text>
          )}
          <Ionicons name="chevron-down" size={normalize(20)} color={lightTheme.textTertiary} />
        </Pressable>
        {hasSurahError && <Text style={styles.errorText}>{surahError}</Text>}
      </View>

      {/* Ayah Range */}
      <View style={styles.ayahRow}>
        <View style={styles.ayahField}>
          <Text style={styles.label}>From Ayah</Text>
          <TextInput
            style={[styles.ayahInput, hasFromError && styles.inputError]}
            value={fromAyah != null ? String(fromAyah) : ''}
            onChangeText={(t) => {
              const n = parseAyah(t);
              if (n !== null) onChangeFromAyah(n);
              else if (t === '') onChangeFromAyah(0);
            }}
            keyboardType="number-pad"
            placeholder="1"
            placeholderTextColor={lightTheme.textTertiary}
            accessibilityLabel="From ayah number"
          />
          {hasFromError && <Text style={styles.errorText}>{fromAyahError}</Text>}
        </View>

        <View style={styles.ayahField}>
          <Text style={styles.label}>To Ayah</Text>
          <TextInput
            style={[styles.ayahInput, hasToError && styles.inputError]}
            value={toAyah != null ? String(toAyah) : ''}
            onChangeText={(t) => {
              const n = parseAyah(t);
              if (n !== null) onChangeToAyah(n);
              else if (t === '') onChangeToAyah(0);
            }}
            keyboardType="number-pad"
            placeholder={String(maxAyah)}
            placeholderTextColor={lightTheme.textTertiary}
            accessibilityLabel="To ayah number"
          />
          {hasToError && <Text style={styles.errorText}>{toAyahError}</Text>}
        </View>
      </View>

      {/* Ayah Range Info */}
      {selectedSurah && (
        <Text style={styles.ayahInfo}>
          {selectedSurah.nameEnglish} has {selectedSurah.ayahCount} ayahs
        </Text>
      )}

      {/* Surah Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalVisible(false);
          setSearch('');
        }}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => {
            setModalVisible(false);
            setSearch('');
          }}
        >
          <View style={styles.dropdown} onStartShouldSetResponder={() => true}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={normalize(18)} color={lightTheme.textTertiary} />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search surahs..."
                placeholderTextColor={lightTheme.textTertiary}
                autoFocus
              />
            </View>

            <FlatList
              data={filteredSurahs}
              keyExtractor={(item) => String(item.number)}
              renderItem={({ item }) => {
                const isSelected = item.number === surahNumber;
                return (
                  <Pressable
                    onPress={() => handleSelectSurah(item.number)}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      pressed && styles.optionPressed,
                    ]}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text style={styles.optionNumber}>{item.number}</Text>
                    <View style={styles.optionNames}>
                      <Text
                        style={[styles.optionText, isSelected && styles.optionTextSelected]}
                      >
                        {item.nameEnglish}
                      </Text>
                      <Text style={styles.optionArabic}>{item.nameArabic}</Text>
                    </View>
                    <Text style={styles.optionAyahCount}>{item.ayahCount} ayahs</Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={normalize(20)} color={colors.primary[500]} />
                    )}
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
  triggerError: {
    borderColor: lightTheme.error,
    borderWidth: 1.5,
  },
  surahDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  surahNumber: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    color: lightTheme.textSecondary,
  },
  surahName: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.base,
    color: lightTheme.text,
  },
  surahArabic: {
    fontFamily: typography.fontFamily.arabic,
    fontSize: typography.fontSize.base,
    color: lightTheme.textSecondary,
  },
  placeholderText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: lightTheme.textTertiary,
  },
  ayahRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  ayahField: {
    flex: 1,
  },
  ayahInput: {
    borderWidth: 1,
    borderColor: lightTheme.border,
    borderRadius: radius.md,
    backgroundColor: lightTheme.background,
    minHeight: normalize(48),
    paddingHorizontal: spacing.md,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.base,
    color: lightTheme.text,
    textAlign: 'center',
  },
  inputError: {
    borderColor: lightTheme.error,
    borderWidth: 1.5,
  },
  ayahInfo: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: lightTheme.textTertiary,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: lightTheme.error,
    marginTop: spacing.xs,
    marginStart: spacing.xs,
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
    paddingVertical: spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: lightTheme.text,
    padding: 0,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  optionSelected: {
    backgroundColor: colors.primary[50],
  },
  optionPressed: {
    backgroundColor: colors.neutral[100],
  },
  optionNumber: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    color: lightTheme.textSecondary,
    width: normalize(28),
    textAlign: 'center',
  },
  optionNames: {
    flex: 1,
  },
  optionText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: lightTheme.text,
  },
  optionTextSelected: {
    fontFamily: typography.fontFamily.medium,
    color: colors.primary[700],
  },
  optionArabic: {
    fontFamily: typography.fontFamily.arabic,
    fontSize: typography.fontSize.sm,
    color: lightTheme.textSecondary,
  },
  optionAyahCount: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    color: lightTheme.textTertiary,
  },
});
