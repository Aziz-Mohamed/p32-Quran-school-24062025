import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { gamificationService } from '@/features/gamification/services/gamification.service';
import { useQuery } from '@tanstack/react-query';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Sticker Catalog Screen ──────────────────────────────────────────────────

export default function StickerCatalogScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();

  const { data: stickers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['stickers', profile?.school_id],
    queryFn: async () => {
      if (!profile?.school_id) return [];
      // Get all stickers (not just active) for admin
      const { data, error } = await gamificationService.getStickers(profile.school_id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profile?.school_id,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={(error as Error).message} onRetry={refetch} />;

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            title={t('common.back')}
            onPress={() => router.back()}
            variant="ghost"
            size="sm"
          />
          <Text style={styles.title}>{t('admin.stickers.title')}</Text>
          <Button
            title={t('admin.stickers.add')}
            onPress={() => router.push('/(admin)/stickers/create')}
            variant="primary"
            size="sm"
            icon={<Ionicons name="add" size={18} color={colors.white} />}
          />
        </View>

        {stickers.length === 0 ? (
          <EmptyState
            icon="star-outline"
            title={t('admin.stickers.emptyTitle')}
            description={t('admin.stickers.emptyDescription')}
          />
        ) : (
          <FlashList
            data={stickers}
            keyExtractor={(item: any) => item.id}

            renderItem={({ item }: { item: any }) => (
              <Card
                variant="outlined"
                style={styles.stickerCard}
                onPress={() => router.push(`/(admin)/stickers/${item.id}/edit`)}
              >
                <View style={styles.stickerRow}>
                  <Ionicons name="star" size={28} color={colors.primary[500]} />
                  <View style={styles.stickerInfo}>
                    <Text style={styles.stickerName}>{item.name}</Text>
                    <Text style={styles.stickerMeta}>
                      {item.category ?? '—'} · {item.points_value} {t('common.pts')}
                    </Text>
                  </View>
                  <Badge
                    label={item.is_active ? t('common.active') : t('common.inactive')}
                    variant={item.is_active ? 'success' : 'warning'}
                    size="sm"
                  />
                </View>
              </Card>
            )}
          />
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
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    flex: 1,
    textAlign: 'center',
  },
  stickerCard: {
    marginBottom: spacing.sm,
  },
  stickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stickerInfo: {
    flex: 1,
  },
  stickerName: {
    ...typography.textStyles.body,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.semiBold,
  },
  stickerMeta: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    marginTop: 2,
  },
});
