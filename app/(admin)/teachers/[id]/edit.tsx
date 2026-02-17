import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { LoadingState, ErrorState } from '@/components/feedback';
import { useTeacherById, useUpdateTeacher } from '@/features/teachers/hooks/useTeachers';
import { typography } from '@/theme/typography';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Edit Teacher Screen ─────────────────────────────────────────────────────

export default function EditTeacherScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: teacher, isLoading, error, refetch } = useTeacherById(id);
  const updateTeacher = useUpdateTeacher();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (teacher) {
      setFullName(teacher.full_name);
      setPhone(teacher.phone ?? '');
    }
  }, [teacher]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={(error as Error).message} onRetry={refetch} />;
  if (!teacher) return <ErrorState description={t('admin.teachers.notFound')} />;

  const handleSave = async () => {
    await updateTeacher.mutateAsync({
      id: teacher.id,
      input: {
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      },
    });
    router.back();
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

        <Text style={styles.title}>{t('admin.teachers.editTitle')}</Text>

        <TextField
          label={t('admin.teachers.fullName')}
          value={fullName}
          onChangeText={setFullName}
          placeholder={t('admin.teachers.fullNamePlaceholder')}
        />

        <TextField
          label={t('common.phone')}
          value={phone}
          onChangeText={setPhone}
          placeholder={t('common.optional')}
          keyboardType="phone-pad"
        />

        <Button
          title={t('common.save')}
          onPress={handleSave}
          variant="primary"
          size="lg"
          loading={updateTeacher.isPending}
          style={styles.submitButton}
        />
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
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
