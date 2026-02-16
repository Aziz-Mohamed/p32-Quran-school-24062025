import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { LoadingState, ErrorState } from '@/components/feedback';
import { useParentById, useUpdateParent } from '@/features/parents/hooks/useParents';
import { typography } from '@/theme/typography';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Edit Parent Screen ─────────────────────────────────────────────────────

export default function EditParentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: parent, isLoading, error, refetch } = useParentById(id);
  const updateParent = useUpdateParent();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (parent) {
      setFullName(parent.full_name);
      setPhone(parent.phone ?? '');
    }
  }, [parent]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={(error as Error).message} onRetry={refetch} />;
  if (!parent) return <ErrorState description={t('admin.parents.notFound')} />;

  const handleSave = async () => {
    await updateParent.mutateAsync({
      id: parent.id,
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

        <Text style={styles.title}>{t('admin.parents.editTitle')}</Text>

        <TextField
          label={t('admin.parents.fullName')}
          value={fullName}
          onChangeText={setFullName}
          placeholder={t('admin.parents.fullNamePlaceholder')}
        />

        <TextField
          label={t('common.phone')}
          value={phone}
          onChangeText={setPhone}
          placeholder="Optional"
          keyboardType="phone-pad"
        />

        <Button
          title={t('common.save')}
          onPress={handleSave}
          variant="primary"
          size="lg"
          loading={updateParent.isPending}
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
