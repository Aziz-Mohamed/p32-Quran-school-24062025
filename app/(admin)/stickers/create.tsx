import React, { useState } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Screen } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { IslamicIconPicker } from '@/components/forms/IslamicIconPicker';
import { useAuth } from '@/hooks/useAuth';
import { gamificationService } from '@/features/gamification/services/gamification.service';
import { DEFAULT_STICKER_ICON } from '@/lib/islamicIcons';
import { typography } from '@/theme/typography';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Create Sticker Screen ──────────────────────────────────────────────────

export default function CreateStickerScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [pointsValue, setPointsValue] = useState('5');
  const [iconKey, setIconKey] = useState<string>(DEFAULT_STICKER_ICON);

  const createSticker = useMutation({
    mutationFn: () =>
      gamificationService.createSticker({
        name: name.trim(),
        category: category.trim() || null,
        points_value: parseInt(pointsValue, 10) || 5,
        school_id: profile?.school_id ?? '',
        image_url: iconKey,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stickers'] });
      router.back();
    },
  });

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('admin.stickers.nameRequired'));
      return;
    }
    createSticker.mutate();
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

        <Text style={styles.title}>{t('admin.stickers.createTitle')}</Text>

        <IslamicIconPicker
          label={t('admin.stickers.icon')}
          value={iconKey}
          onChange={setIconKey}
        />

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

        <Button
          title={t('admin.stickers.createButton')}
          onPress={handleCreate}
          variant="primary"
          size="lg"
          loading={createSticker.isPending}
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
