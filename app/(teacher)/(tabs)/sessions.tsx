import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
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
import { useSessions } from '@/features/sessions/hooks/useSessions';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Sessions List Screen ────────────────────────────────────────────────────

export default function SessionsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();

  const { data: sessions = [], isLoading, error, refetch } = useSessions({
    teacherId: profile?.id,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('teacher.sessions.title')}</Text>
          <Button
            title={t('teacher.logSession')}
            onPress={() => router.push('/(teacher)/sessions/create')}
            variant="primary"
            size="sm"
            icon={<Ionicons name="add" size={18} color={colors.white} />}
          />
        </View>

        {sessions.length === 0 ? (
          <EmptyState
            icon="clipboard-outline"
            title={t('teacher.sessions.emptyTitle')}
            description={t('teacher.sessions.emptyDescription')}
          />
        ) : (
          <FlashList
            data={sessions}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item }: { item: any }) => (
              <Card
                variant="outlined"
                onPress={() => router.push(`/(teacher)/sessions/${item.id}`)}
                style={styles.sessionCard}
              >
                <View style={styles.sessionRow}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.studentName}>
                      {item.profiles?.full_name ?? '—'}
                    </Text>
                    <Text style={styles.sessionDate}>{item.session_date}</Text>
                  </View>
                  <View style={styles.scores}>
                    {item.memorization_score != null && (
                      <Badge label={`M: ${item.memorization_score}`} variant="info" size="sm" />
                    )}
                    {item.tajweed_score != null && (
                      <Badge label={`T: ${item.tajweed_score}`} variant="default" size="sm" />
                    )}
                  </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
  },
  sessionCard: {
    marginBottom: spacing.sm,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  studentName: {
    ...typography.textStyles.body,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.semiBold,
  },
  sessionDate: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    marginTop: 2,
  },
  scores: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
});
