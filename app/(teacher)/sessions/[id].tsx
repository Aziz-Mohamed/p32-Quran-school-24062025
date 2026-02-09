import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/feedback';
import { useSessionById } from '@/features/sessions/hooks/useSessions';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Session Detail Screen ───────────────────────────────────────────────────

export default function SessionDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: session, isLoading, error, refetch } = useSessionById(id);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;
  if (!session) return <ErrorState description={t('common.noResults')} onRetry={refetch} />;

  const studentName = (session as any).profiles?.full_name ?? '—';

  return (
    <Screen scroll>
      <View style={styles.container}>
        {/* Back */}
        <Button
          title={t('common.back')}
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
        />

        {/* Header */}
        <Text style={styles.title}>{t('teacher.sessions.detailTitle')}</Text>
        <Text style={styles.subtitle}>{session.session_date}</Text>

        {/* Student Info */}
        <Card variant="outlined" style={styles.section}>
          <Text style={styles.sectionTitle}>{t('teacher.sessions.student')}</Text>
          <Text style={styles.bodyText}>{studentName}</Text>
        </Card>

        {/* Scores */}
        <Card variant="outlined" style={styles.section}>
          <Text style={styles.sectionTitle}>{t('teacher.sessions.scores')}</Text>
          <View style={styles.scoresGrid}>
            <ScoreDisplay
              label={t('teacher.sessions.memorization')}
              value={session.memorization_score}
            />
            <ScoreDisplay
              label={t('teacher.sessions.tajweed')}
              value={session.tajweed_score}
            />
            <ScoreDisplay
              label={t('teacher.sessions.recitation')}
              value={session.recitation_quality}
            />
          </View>
        </Card>

        {/* Notes */}
        {session.notes && (
          <Card variant="outlined" style={styles.section}>
            <Text style={styles.sectionTitle}>{t('teacher.sessions.notes')}</Text>
            <Text style={styles.bodyText}>{session.notes}</Text>
          </Card>
        )}

        {/* Homework */}
        {(session as any).homework && (session as any).homework.length > 0 && (
          <Card variant="outlined" style={styles.section}>
            <Text style={styles.sectionTitle}>{t('teacher.sessions.homework')}</Text>
            {(session as any).homework.map((hw: any) => (
              <View key={hw.id} style={styles.homeworkItem}>
                <Text style={styles.bodyText}>{hw.description}</Text>
                <View style={styles.homeworkMeta}>
                  <Text style={styles.caption}>
                    {t('teacher.sessions.due')}: {hw.due_date}
                  </Text>
                  <Badge
                    label={hw.is_completed ? t('common.done') : t('teacher.sessions.pending')}
                    variant={hw.is_completed ? 'success' : 'warning'}
                    size="sm"
                  />
                </View>
              </View>
            ))}
          </Card>
        )}
      </View>
    </Screen>
  );
}

// ─── Score Display Helper ────────────────────────────────────────────────────

function ScoreDisplay({ label, value }: { label: string; value: number | null }) {
  return (
    <View style={styles.scoreItem}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={styles.scoreValue}>
        {value != null ? `${value}/5` : '—'}
      </Text>
    </View>
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
  subtitle: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
  },
  bodyText: {
    ...typography.textStyles.body,
    color: lightTheme.text,
  },
  caption: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
  },
  scoresGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  scoreLabel: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
  },
  scoreValue: {
    ...typography.textStyles.heading,
    color: lightTheme.primary,
    fontSize: typography.fontSize.xl,
  },
  homeworkItem: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  homeworkMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
