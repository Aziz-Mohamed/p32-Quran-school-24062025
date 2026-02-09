import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useStudentStickers } from '@/features/gamification/hooks/useStickers';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';

// ─── Stickers Screen ──────────────────────────────────────────────────────────

export default function StickersScreen() {
  const { t } = useTranslation();
  const { profile } = useAuth();

  const { data: stickers = [], isLoading, error, refetch } = useStudentStickers(profile?.id);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('student.stickers.title')}</Text>
          <Text style={styles.count}>
            {t('student.stickers.totalCollected', { count: stickers.length })}
          </Text>
        </View>

        {stickers.length === 0 ? (
          <EmptyState
            icon="star-outline"
            title={t('student.stickers.emptyTitle')}
            description={t('student.stickers.emptyDescription')}
          />
        ) : (
          <View style={styles.grid}>
            {stickers.map((item: any) => (
              <Card key={item.id} variant="outlined" style={styles.stickerCard}>
                <Ionicons
                  name="star"
                  size={36}
                  color={colors.primary[500]}
                />
                <Text style={styles.stickerName} numberOfLines={2}>
                  {item.stickers?.name ?? '—'}
                </Text>
                {item.stickers?.category && (
                  <Text style={styles.stickerCategory}>{item.stickers.category}</Text>
                )}
                <Text style={styles.stickerDate}>
                  {item.awarded_at?.split('T')[0]}
                </Text>
              </Card>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
  },
  count: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stickerCard: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  stickerName: {
    ...typography.textStyles.caption,
    color: lightTheme.text,
    textAlign: 'center',
    fontFamily: typography.fontFamily.medium,
  },
  stickerCategory: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    fontSize: typography.fontSize.xs,
  },
  stickerDate: {
    ...typography.textStyles.caption,
    color: lightTheme.textTertiary,
    fontSize: typography.fontSize.xs,
  },
});
