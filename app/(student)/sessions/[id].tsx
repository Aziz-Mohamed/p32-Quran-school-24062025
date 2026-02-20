import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/feedback';
import { useSessionRecitations } from '@/features/memorization';
import { RecitationTypeChip } from '@/features/memorization/components/RecitationTypeChip';
import { useSessionById } from '@/features/sessions/hooks/useSessions';
import { formatSessionDate } from '@/lib/helpers';
import { getSurah, formatVerseRange } from '@/lib/quran-metadata';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

// ─── Student Session Detail ──────────────────────────────────────────────────

export default function StudentSessionDetailScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: session, isLoading, error, refetch } = useSessionById(id);
  const { data: recitations = [] } = useSessionRecitations(id);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;
  if (!session) return <ErrorState description={t('common.noResults')} onRetry={refetch} />;

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Button
          title={t('common.back')}
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
        />

        <Text style={styles.title}>{t('teacher.sessions.detailTitle')}</Text>
        <Text style={styles.subtitle}>
          {formatSessionDate(session.session_date, i18n.language).date}{' '}
          <Text style={styles.subtitleWeekday}>({formatSessionDate(session.session_date, i18n.language).weekday})</Text>
        </Text>

        {/* Scores */}
        <Card variant="outlined" style={styles.section}>
          <Text style={styles.sectionTitle}>{t('teacher.sessions.scores')}</Text>
          <View style={styles.scoresGrid}>
            <ScoreDisplay label={t('teacher.sessions.memorization')} value={session.memorization_score} />
            <ScoreDisplay label={t('teacher.sessions.tajweed')} value={session.tajweed_score} />
            <ScoreDisplay label={t('teacher.sessions.recitation')} value={session.recitation_quality} />
          </View>
        </Card>

        {/* Recitations */}
        {recitations.length > 0 && (
          <Card variant="outlined" style={styles.section}>
            <Text style={styles.sectionTitle}>{t('memorization.recitations')}</Text>
            {recitations.map((recitation: any) => {
              const surah = getSurah(recitation.surah_number);
              const range = formatVerseRange(recitation.surah_number, recitation.from_ayah, recitation.to_ayah);
              return (
                <View key={recitation.id} style={styles.recitationItem}>
                  <View style={styles.recitationHeader}>
                    <View style={styles.recitationInfo}>
                      <Text style={styles.recitationSurah}>
                        {surah?.nameArabic ?? ''} - {surah?.nameEnglish ?? ''}
                      </Text>
                      <Text style={styles.recitationRange}>{range}</Text>
                    </View>
                    <RecitationTypeChip type={recitation.recitation_type} />
                  </View>
                  <View style={styles.recitationScores}>
                    {recitation.accuracy_score != null && (
                      <View style={styles.miniScore}>
                        <Ionicons name="checkmark-circle-outline" size={normalize(14)} color={colors.primary[500]} />
                        <Text style={styles.miniScoreText}>{recitation.accuracy_score}/5</Text>
                      </View>
                    )}
                    {recitation.tajweed_score != null && (
                      <View style={styles.miniScore}>
                        <Ionicons name="musical-notes-outline" size={normalize(14)} color={colors.accent.violet[500]} />
                        <Text style={styles.miniScoreText}>{recitation.tajweed_score}/5</Text>
                      </View>
                    )}
                    {recitation.fluency_score != null && (
                      <View style={styles.miniScore}>
                        <Ionicons name="water-outline" size={normalize(14)} color={colors.accent.sky[500]} />
                        <Text style={styles.miniScoreText}>{recitation.fluency_score}/5</Text>
                      </View>
                    )}
                    {recitation.needs_repeat && (
                      <Badge label={t('memorization.needsRepeat')} variant="warning" size="sm" />
                    )}
                  </View>
                  {recitation.mistake_notes && (
                    <Text style={styles.mistakeNotes}>{recitation.mistake_notes}</Text>
                  )}
                </View>
              );
            })}
          </Card>
        )}

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

function ScoreDisplay({ label, value }: { label: string; value: number | null }) {
  return (
    <View style={styles.scoreItem}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={styles.scoreValue}>{value != null ? `${value}/5` : '—'}</Text>
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
  homeworkItem: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  homeworkMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recitationItem: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  recitationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  recitationInfo: {
    flex: 1,
  },
  recitationSurah: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: lightTheme.text,
  },
  recitationRange: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    color: colors.primary[600],
    marginTop: normalize(2),
  },
  recitationScores: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  miniScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  miniScoreText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    color: lightTheme.textSecondary,
  },
  mistakeNotes: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    fontStyle: 'italic',
  },
});
