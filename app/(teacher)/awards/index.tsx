import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { Screen } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Select, type SelectOption } from '@/components/forms/Select';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useRTL } from '@/hooks/useRTL';
import { useStudents } from '@/features/students/hooks/useStudents';
import { useStickers, useAwardSticker } from '@/features/gamification/hooks/useStickers';
import { getStickerImageUrl } from '@/lib/storage';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { normalize } from '@/theme/normalize';

// ─── Award Sticker Screen ────────────────────────────────────────────────────

export default function AwardStickerScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  const { isRTL } = useRTL();

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const { data: students = [] } = useStudents({ isActive: true });
  const { data: stickers = [], isLoading: stickersLoading } = useStickers();
  const awardSticker = useAwardSticker();

  const studentOptions: SelectOption[] = students.map((s: any) => ({
    label: s.profiles?.full_name ?? s.id,
    value: s.id,
  }));

  const handleAward = () => {
    if (!selectedStudentId || !selectedStickerId || !profile?.id) {
      Alert.alert(t('common.error'), t('teacher.awards.selectBothError'));
      return;
    }

    awardSticker.mutate(
      {
        studentId: selectedStudentId,
        stickerId: selectedStickerId,
        awardedBy: profile.id,
        reason: reason.trim() || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert(t('teacher.awards.successTitle'), t('teacher.awards.successMessage'), [
            { text: t('common.done'), onPress: () => router.back() },
            {
              text: t('teacher.awards.awardAnother'),
              onPress: () => {
                setSelectedStickerId(null);
                setReason('');
              },
            },
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

        <Text style={styles.title}>{t('teacher.awards.title')}</Text>

        <Select
          label={t('teacher.sessions.student')}
          placeholder={t('teacher.sessions.selectStudent')}
          options={studentOptions}
          value={selectedStudentId}
          onChange={setSelectedStudentId}
        />

        <Text style={styles.sectionTitle}>{t('teacher.awards.chooseSticker')}</Text>
        {stickersLoading ? (
          <LoadingState />
        ) : stickers.length === 0 ? (
          <EmptyState
            icon="star-outline"
            title={t('teacher.awards.noStickers')}
            description={t('teacher.awards.noStickersDescription')}
          />
        ) : (
          <View style={styles.stickerGrid}>
            {stickers.map((sticker) => {
              const isSelected = sticker.id === selectedStickerId;
              const name = isRTL ? sticker.name_ar : sticker.name_en;
              const imageUrl = getStickerImageUrl(sticker.image_path);

              return (
                <Pressable
                  key={sticker.id}
                  onPress={() => setSelectedStickerId(sticker.id)}
                  style={[
                    styles.stickerItem,
                    isSelected && styles.stickerItemSelected,
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={name}
                >
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.stickerImage}
                    contentFit="contain"
                    cachePolicy="disk"
                  />
                  <Text
                    style={[
                      styles.stickerName,
                      isSelected && styles.stickerNameSelected,
                    ]}
                    numberOfLines={2}
                  >
                    {name}
                  </Text>
                  <Text style={styles.stickerPoints}>
                    {sticker.points_value} {t('common.pts')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <TextField
          label={t('teacher.awards.reason')}
          placeholder={t('teacher.awards.reasonPlaceholder')}
          value={reason}
          onChangeText={setReason}
          multiline
        />

        <View style={styles.actions}>
          <Button
            title={t('common.cancel')}
            onPress={() => router.back()}
            variant="ghost"
            size="lg"
            style={styles.actionButton}
          />
          <Button
            title={t('teacher.awards.awardButton')}
            onPress={handleAward}
            variant="primary"
            size="lg"
            loading={awardSticker.isPending}
            disabled={!selectedStudentId || !selectedStickerId}
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
  },
  sectionTitle: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
    marginTop: spacing.sm,
  },
  stickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stickerItem: {
    width: '30%',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: lightTheme.border,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  stickerItemSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  stickerImage: {
    width: normalize(36),
    height: normalize(36),
  },
  stickerName: {
    ...typography.textStyles.caption,
    color: lightTheme.text,
    textAlign: 'center',
    fontFamily: typography.fontFamily.medium,
    minHeight: normalize(32),
  },
  stickerNameSelected: {
    color: colors.primary[700],
  },
  stickerPoints: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    fontSize: typography.fontSize.xs,
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
