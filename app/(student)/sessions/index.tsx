import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useSessions } from '@/features/sessions/hooks/useSessions';
import { typography } from '@/theme/typography';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Student Session History ─────────────────────────────────────────────────

export default function StudentSessionsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();

  const { data: sessions = [], isLoading, error, refetch } = useSessions({
    studentId: profile?.id,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <Button
          title={t('common.back')}
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
        />
        <Text style={styles.title}>{t('student.sessions.title')}</Text>

        {sessions.length === 0 ? (
          <EmptyState
            icon="clipboard-outline"
            title={t('student.sessions.emptyTitle')}
            description={t('student.sessions.emptyDescription')}
          />
        ) : (
          <FlashList
            data={sessions}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item }: { item: any }) => (
              <Card
                variant="outlined"
                onPress={() => router.push(`/(student)/sessions/${item.id}`)}
                style={styles.sessionCard}
              >
                <View style={styles.sessionRow}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionDate}>{item.session_date}</Text>
                    <Text style={styles.teacherName}>
                      {item.teacher?.full_name ?? '—'}
                    </Text>
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
    gap: spacing.md,
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
  sessionDate: {
    ...typography.textStyles.body,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.semiBold,
  },
  teacherName: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    marginTop: 2,
  },
  scores: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
});
