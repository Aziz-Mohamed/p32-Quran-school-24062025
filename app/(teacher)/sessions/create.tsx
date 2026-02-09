import React, { useState } from 'react';
import { StyleSheet, View, Text, Alert, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Select, type SelectOption } from '@/components/forms/Select';
import { ScoreInput } from '@/components/forms/ScoreInput';
import { DatePicker } from '@/components/forms/DatePicker';
import { useAuth } from '@/hooks/useAuth';
import { useStudents } from '@/features/students/hooks/useStudents';
import { useCreateSession } from '@/features/sessions/hooks/useSessions';
import { typography } from '@/theme/typography';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Create Session Screen ───────────────────────────────────────────────────

export default function CreateSessionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();

  // Form state
  const [studentId, setStudentId] = useState<string | null>(null);
  const [sessionDate, setSessionDate] = useState<Date>(new Date());
  const [memorizationScore, setMemorizationScore] = useState<number | null>(null);
  const [tajweedScore, setTajweedScore] = useState<number | null>(null);
  const [recitationQuality, setRecitationQuality] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [homeworkDescription, setHomeworkDescription] = useState('');
  const [homeworkDueDate, setHomeworkDueDate] = useState<Date | null>(null);

  // Data
  const { data: students = [] } = useStudents({ isActive: true });
  const createSession = useCreateSession();

  const studentOptions: SelectOption[] = students.map((s: any) => ({
    label: s.profiles?.full_name ?? s.id,
    value: s.id,
  }));

  const handleSubmit = () => {
    if (!studentId) {
      Alert.alert(t('common.error'), t('teacher.sessions.selectStudentError'));
      return;
    }
    if (!profile?.id) return;

    createSession.mutate(
      {
        student_id: studentId,
        teacher_id: profile.id,
        session_date: sessionDate.toISOString().split('T')[0],
        memorization_score: memorizationScore,
        tajweed_score: tajweedScore,
        recitation_quality: recitationQuality,
        notes: notes.trim() || null,
        homework_assigned: homeworkDescription.trim() || null,
        homework_due_date: homeworkDueDate
          ? homeworkDueDate.toISOString().split('T')[0]
          : null,
      },
      {
        onSuccess: () => {
          router.back();
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
        <Text style={styles.title}>{t('teacher.sessions.createTitle')}</Text>

        {/* Student Select */}
        <Select
          label={t('teacher.sessions.student')}
          placeholder={t('teacher.sessions.selectStudent')}
          options={studentOptions}
          value={studentId}
          onChange={setStudentId}
        />

        {/* Date */}
        <DatePicker
          label={t('teacher.sessions.date')}
          value={sessionDate}
          onChange={setSessionDate}
          maximumDate={new Date()}
        />

        {/* Scores */}
        <Text style={styles.sectionTitle}>{t('teacher.sessions.scores')}</Text>
        <ScoreInput
          label={t('teacher.sessions.memorization')}
          value={memorizationScore}
          onChange={setMemorizationScore}
        />
        <ScoreInput
          label={t('teacher.sessions.tajweed')}
          value={tajweedScore}
          onChange={setTajweedScore}
        />
        <ScoreInput
          label={t('teacher.sessions.recitation')}
          value={recitationQuality}
          onChange={setRecitationQuality}
        />

        {/* Notes */}
        <TextField
          label={t('teacher.sessions.notes')}
          placeholder={t('teacher.sessions.notesPlaceholder')}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {/* Optional Homework */}
        <Text style={styles.sectionTitle}>{t('teacher.sessions.homework')}</Text>
        <TextField
          label={t('teacher.sessions.homeworkDescription')}
          placeholder={t('teacher.sessions.homeworkPlaceholder')}
          value={homeworkDescription}
          onChangeText={setHomeworkDescription}
          multiline
        />
        {homeworkDescription.trim().length > 0 && (
          <DatePicker
            label={t('teacher.sessions.homeworkDueDate')}
            value={homeworkDueDate}
            onChange={setHomeworkDueDate}
            minimumDate={new Date()}
          />
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title={t('common.cancel')}
            onPress={() => router.back()}
            variant="ghost"
            size="lg"
            style={styles.actionButton}
          />
          <Button
            title={t('common.save')}
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            loading={createSession.isPending}
            style={styles.actionButton}
          />
        </View>
      </View>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
});
