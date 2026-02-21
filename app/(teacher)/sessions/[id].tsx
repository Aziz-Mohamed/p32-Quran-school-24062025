import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/feedback';
import { RevisionCard, useSessionRecitations } from '@/features/memorization';
import { useSessionById } from '@/features/sessions/hooks/useSessions';
import { formatSessionDate } from '@/lib/helpers';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Session Detail Screen ───────────────────────────────────────────────────

export default function SessionDetailScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: session, isLoading, error, refetch } = useSessionById(id);
  const { data: recitations = [] } = useSessionRecitations(id);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;
  if (!session) return <ErrorState description={t('common.noResults')} onRetry={refetch} />;

  const studentName = (session as any).student?.profiles?.full_name ?? '—';

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
        <Text style={styles.subtitle}>
          {formatSessionDate(session.session_date, i18n.language).date}{' '}
          <Text style={styles.subtitleWeekday}>({formatSessionDate(session.session_date, i18n.language).weekday})</Text>
        </Text>

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

        {/* Recitations */}
        {recitations.length > 0 && (
          <Card variant="outlined" style={styles.section}>
            <Text style={styles.sectionTitle}>Recitations</Text>
            {recitations.map((recitation: any) => (
              <RevisionCard
                key={recitation.id}
                item={{
                  progress_id: null,
                  surah_number: recitation.surah_number,
                  from_ayah: recitation.from_ayah,
                  to_ayah: recitation.to_ayah,
                  status: recitation.needs_repeat ? 'needs_review' : 'memorized',
                  review_type: recitation.recitation_type,
                  next_review_date: null,
                  last_reviewed_at: recitation.created_at,
                  review_count: 1,
                  ease_factor: 2.5,
                  avg_accuracy: recitation.accuracy_score,
                  avg_tajweed: recitation.tajweed_score,
                  avg_fluency: recitation.fluency_score,
                  first_memorized_at: null,
                }}
              />
            ))}
          </Card>
        )}

        {/* Notes */}
        {session.notes && (
          <Card variant="outlined" style={styles.section}>
            <Text style={styles.sectionTitle}>{t('teacher.sessions.notes')}</Text>
            <Text style={styles.bodyText}>{session.notes}</Text>
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
  subtitleWeekday: {
    ...typography.textStyles.caption,
    color: colors.neutral[400],
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
});
