import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Screen } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { LoadingState, ErrorState } from '@/components/feedback';
import { gamificationService } from '@/features/gamification/services/gamification.service';
import { typography } from '@/theme/typography';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Edit Sticker Screen ────────────────────────────────────────────────────

export default function EditStickerScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: sticker, isLoading, error, refetch } = useQuery({
    queryKey: ['sticker', id],
    queryFn: async () => {
      const { data, error } = await gamificationService.getStickerById(id!);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [pointsValue, setPointsValue] = useState('5');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (sticker) {
      setName(sticker.name);
      setCategory(sticker.category ?? '');
      setPointsValue(String(sticker.points_value));
      setIsActive(sticker.is_active);
    }
  }, [sticker]);

  const updateSticker = useMutation({
    mutationFn: () =>
      gamificationService.updateSticker(id!, {
        name: name.trim(),
        category: category.trim() || null,
        points_value: parseInt(pointsValue, 10) || 5,
        is_active: isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stickers'] });
      queryClient.invalidateQueries({ queryKey: ['sticker', id] });
      router.back();
    },
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={(error as Error).message} onRetry={refetch} />;
  if (!sticker) return <ErrorState description={t('admin.stickers.notFound')} />;

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('admin.stickers.nameRequired'));
      return;
    }
    updateSticker.mutate();
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

        <Text style={styles.title}>{t('admin.stickers.editTitle')}</Text>

        <TextField
          label={t('admin.stickers.name')}
          value={name}
          onChangeText={setName}
          placeholder={t('admin.stickers.namePlaceholder')}
        />

        <TextField
          label={t('admin.stickers.category')}
          value={category}
          onChangeText={setCategory}
          placeholder={t('admin.stickers.categoryPlaceholder')}
        />

        <TextField
          label={t('admin.stickers.pointsValue')}
          value={pointsValue}
          onChangeText={setPointsValue}
          keyboardType="numeric"
          placeholder="5"
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t('common.active')}</Text>
          <Switch value={isActive} onValueChange={setIsActive} />
        </View>

        <Button
          title={t('common.save')}
          onPress={handleSave}
          variant="primary"
          size="lg"
          loading={updateSticker.isPending}
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  switchLabel: {
    ...typography.textStyles.body,
    color: lightTheme.text,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
