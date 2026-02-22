import React, { useState, useCallback } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { SurahAyahPicker } from './SurahAyahPicker';
import { useCreateAssignment } from '../hooks/useAssignments';
import { getSurah } from '@/lib/quran-metadata';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SelfAssignmentFormProps {
  visible: boolean;
  onClose: () => void;
  studentId: string;
  schoolId: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SelfAssignmentForm({
  visible,
  onClose,
  studentId,
  schoolId,
}: SelfAssignmentFormProps) {
  const { t } = useTranslation();
  const createAssignment = useCreateAssignment();

  // Form state
  const [surahNumber, setSurahNumber] = useState<number>(0);
  const [fromAyah, setFromAyah] = useState<number>(0);
  const [toAyah, setToAyah] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = useCallback(() => {
    setSurahNumber(0);
    setFromAyah(0);
    setToAyah(0);
    setNotes('');
    setErrors({});
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (surahNumber < 1 || surahNumber > 114) errs.surah = t('memorization.validation.selectSurah');

    const surah = surahNumber > 0 ? getSurah(surahNumber) : null;
    const maxAyah = surah?.ayahCount ?? 0;

    if (fromAyah < 1) errs.fromAyah = t('memorization.validation.required');
    else if (surah && fromAyah > maxAyah) errs.fromAyah = t('memorization.validation.maxAyah', { max: maxAyah });

    if (toAyah < 1) errs.toAyah = t('memorization.validation.required');
    else if (surah && toAyah > maxAyah) errs.toAyah = t('memorization.validation.maxAyah', { max: maxAyah });
    else if (toAyah < fromAyah) errs.toAyah = t('memorization.validation.mustBeAfterFrom');

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    createAssignment.mutate(
      {
        student_id: studentId,
        assigned_by: studentId, // self-assigned
        school_id: schoolId,
        surah_number: surahNumber,
        from_ayah: fromAyah,
        to_ayah: toAyah,
        assignment_type: 'new_hifz',
        due_date: new Date().toISOString().split('T')[0],
        notes: notes.trim() || null,
      },
      {
        onSuccess: () => {
          Alert.alert(t('common.success'), t('memorization.selfAssign.savedSuccess'));
          handleClose();
        },
        onError: (err) => {
          Alert.alert(t('common.error'), err.message);
        },
      },
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.title}>{t('memorization.selfAssign.title')}</Text>
            <Text style={styles.subtitle}>{t('memorization.selfAssign.subtitle')}</Text>
          </View>
          <Pressable onPress={handleClose} hitSlop={12}>
            <Ionicons name="close" size={normalize(24)} color={lightTheme.textSecondary} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Surah & Ayah Picker */}
          <SurahAyahPicker
            surahNumber={surahNumber || null}
            fromAyah={fromAyah || null}
            toAyah={toAyah || null}
            onChangeSurah={(v) => {
              setSurahNumber(v);
              setErrors((prev) => ({ ...prev, surah: '' }));
            }}
            onChangeFromAyah={(v) => {
              setFromAyah(v);
              setErrors((prev) => ({ ...prev, fromAyah: '' }));
            }}
            onChangeToAyah={(v) => {
              setToAyah(v);
              setErrors((prev) => ({ ...prev, toAyah: '' }));
            }}
            surahError={errors.surah}
            fromAyahError={errors.fromAyah}
            toAyahError={errors.toAyah}
          />

          {/* Notes */}
          <TextField
            label={t('memorization.assignment.notesLabel')}
            placeholder={t('memorization.assignment.notesPlaceholder')}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <Button
            title={t('memorization.selfAssign.saveButton')}
            onPress={handleSave}
            variant="primary"
            size="lg"
            loading={createAssignment.isPending}
            icon={<Ionicons name="checkmark-circle" size={20} color={colors.white} />}
          />
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: lightTheme.border,
  },
  headerTextBlock: {
    flex: 1,
    marginEnd: spacing.md,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.lg,
    color: lightTheme.text,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: lightTheme.textSecondary,
    marginTop: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: lightTheme.border,
  },
});
