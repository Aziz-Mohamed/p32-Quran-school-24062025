import React, { useState } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/forms/Select';
import { DatePicker } from '@/components/forms/DatePicker';
import { TextField } from '@/components/ui/TextField';
import { SurahAyahPicker } from '@/features/memorization/components/SurahAyahPicker';
import { RecitationTypeChips } from '@/features/memorization/components/RecitationTypeChip';
import { useCreateAssignment } from '@/features/memorization/hooks/useAssignments';
import { useAuth } from '@/hooks/useAuth';
import { useStudents } from '@/features/students/hooks/useStudents';
import { getSurah } from '@/lib/quran-metadata';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { RecitationType } from '@/types/common.types';

// ─── Create Assignment Screen ────────────────────────────────────────────────

export default function CreateAssignmentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { studentId: preselectedStudentId } = useLocalSearchParams<{ studentId?: string }>();
  const { profile, schoolId } = useAuth();

  const { data: students = [] } = useStudents({});
  const createAssignment = useCreateAssignment();

  // Form state
  const [studentId, setStudentId] = useState(preselectedStudentId ?? '');
  const [surahNumber, setSurahNumber] = useState<number>(0);
  const [fromAyah, setFromAyah] = useState<number>(0);
  const [toAyah, setToAyah] = useState<number>(0);
  const [assignmentType, setAssignmentType] = useState<RecitationType>('new_hifz');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const studentOptions = students.map((s: any) => ({
    label: s.profiles?.full_name ?? s.id,
    value: s.id,
  }));

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!studentId) errs.studentId = 'Please select a student';
    if (surahNumber < 1 || surahNumber > 114) errs.surah = 'Please select a surah';

    const surah = surahNumber > 0 ? getSurah(surahNumber) : null;
    const maxAyah = surah?.ayahCount ?? 0;

    if (fromAyah < 1) errs.fromAyah = 'Required';
    else if (surah && fromAyah > maxAyah) errs.fromAyah = `Max ${maxAyah}`;

    if (toAyah < 1) errs.toAyah = 'Required';
    else if (surah && toAyah > maxAyah) errs.toAyah = `Max ${maxAyah}`;
    else if (toAyah < fromAyah) errs.toAyah = 'Must be >= from ayah';

    if (!dueDate) errs.dueDate = 'Please set a due date';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || !profile?.id || !schoolId) return;

    createAssignment.mutate(
      {
        student_id: studentId,
        assigned_by: profile.id,
        school_id: schoolId,
        surah_number: surahNumber,
        from_ayah: fromAyah,
        to_ayah: toAyah,
        assignment_type: assignmentType,
        due_date: dueDate!.toISOString().split('T')[0],
        notes: notes.trim() || null,
      },
      {
        onSuccess: () => {
          Alert.alert(t('common.success'), 'Assignment created successfully', [
            { text: t('common.done'), onPress: () => router.back() },
          ]);
        },
        onError: (err) => {
          Alert.alert(t('common.error'), err.message);
        },
      },
    );
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Button
          title={t('common.back')}
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
        />

        <Text style={styles.title}>Assign Memorization</Text>
        <Text style={styles.subtitle}>Assign new memorization or review to a student</Text>

        <Card variant="outlined" style={styles.formCard}>
          {/* Student Select */}
          <Select
            label="Student"
            placeholder="Select student..."
            options={studentOptions}
            value={studentId}
            onChange={(v) => {
              setStudentId(v);
              setErrors((prev) => ({ ...prev, studentId: '' }));
            }}
            error={errors.studentId}
          />

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

          {/* Assignment Type */}
          <RecitationTypeChips
            value={assignmentType}
            onChange={setAssignmentType}
          />

          {/* Due Date */}
          <DatePicker
            label="Due Date"
            placeholder="Select due date..."
            value={dueDate}
            onChange={(d) => {
              setDueDate(d);
              setErrors((prev) => ({ ...prev, dueDate: '' }));
            }}
            minimumDate={new Date()}
            error={errors.dueDate}
          />

          {/* Notes */}
          <TextField
            label="Notes (optional)"
            placeholder="Instructions for the student..."
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </Card>

        <Button
          title="Create Assignment"
          onPress={handleSubmit}
          variant="primary"
          size="lg"
          loading={createAssignment.isPending}
          icon={<Ionicons name="checkmark-circle" size={20} color={colors.white} />}
          style={styles.submitButton}
        />
      </View>
    </Screen>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
  },
  subtitle: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
  },
  formCard: {
    gap: spacing.md,
  },
  submitButton: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
