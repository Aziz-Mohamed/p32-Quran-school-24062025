import React, { useMemo, useState, useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { RevisionCard, type RevisionScheduleItem } from '@/features/memorization';
import { useCompletedSessionSummary } from '../hooks/useCompletedSessionSummary';
import type {
  AttendanceSummaryRecord,
  EvaluationWithRecitations,
  RecitationRecord,
} from '../hooks/useCompletedSessionSummary';
import { useLocalizedName } from '@/hooks/useLocalizedName';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { normalize } from '@/theme/normalize';
import type { AttendanceStatus } from '@/types/common.types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CompletedSessionSummaryProps {
  scheduledSessionId: string;
}

interface MergedStudentResult {
  studentId: string;
  studentName: string;
  nameLocalized: Record<string, string> | null;
  attendanceStatus: AttendanceStatus | null;
  evaluation: EvaluationWithRecitations | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ATTENDANCE_BADGE_VARIANT: Record<AttendanceStatus, 'success' | 'error' | 'warning' | 'sky'> = {
  present: 'success',
  absent: 'error',
  late: 'warning',
  excused: 'sky',
};

// ─── Component ───────────────────────────────────────────────────────────────

export function CompletedSessionSummary({ scheduledSessionId }: CompletedSessionSummaryProps) {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useCompletedSessionSummary(
    scheduledSessionId,
    true,
  );

  const merged = useMemo(() => {
    if (!data) return [];
    return mergeStudentResults(data.attendance, data.evaluations);
  }, [data]);

  const attendanceCounts = useMemo(() => {
    if (!data?.attendance.length) return null;
    const counts = { present: 0, absent: 0, late: 0, excused: 0 };
    for (const a of data.attendance) {
      const s = a.status as AttendanceStatus;
      if (s in counts) counts[s]++;
    }
    return counts;
  }, [data]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (error) {
    return <ErrorState description={error.message} onRetry={refetch} />;
  }

  if (merged.length === 0) {
    return (
      <Card variant="default" style={styles.emptyCard}>
        <Text style={styles.emptyText}>{t('scheduling.summary.noEvaluations')}</Text>
      </Card>
    );
  }

  return (
    <View style={styles.root}>
      {/* Attendance Summary */}
      {attendanceCounts && (
        <Card variant="default" style={styles.attendanceCard}>
          <Text style={styles.sectionTitle}>{t('scheduling.summary.attendance')}</Text>
          <View style={styles.attendanceRow}>
            {(['present', 'absent', 'late', 'excused'] as const).map((status) => {
              const count = attendanceCounts[status];
              if (count === 0) return null;
              return (
                <Badge
                  key={status}
                  label={`${count} ${t(`scheduling.summary.${status}`)}`}
                  variant={ATTENDANCE_BADGE_VARIANT[status]}
                  size="sm"
                />
              );
            })}
          </View>
        </Card>
      )}

      {/* Student Results */}
      <Text style={styles.sectionTitle}>{t('scheduling.summary.studentResults')}</Text>
      {merged.map((student) => (
        <StudentResultCard key={student.studentId} student={student} />
      ))}
    </View>
  );
}

// ─── Student Result Card ─────────────────────────────────────────────────────

function StudentResultCard({ student }: { student: MergedStudentResult }) {
  const { t } = useTranslation();
  const { resolveName } = useLocalizedName();
  const [expanded, setExpanded] = useState(true);

  const name = resolveName(student.nameLocalized, student.studentName);
  const eval_ = student.evaluation;
  const hasScores =
    eval_?.memorization_score != null ||
    eval_?.tajweed_score != null ||
    eval_?.recitation_quality != null;
  const hasContent = hasScores || eval_?.notes || (eval_?.recitations.length ?? 0) > 0;

  const toggleExpanded = useCallback(() => setExpanded((prev) => !prev), []);

  return (
    <Card variant="outlined" style={styles.studentCard}>
      {/* Header */}
      <Pressable onPress={toggleExpanded} style={styles.studentHeader} accessibilityRole="button">
        <View style={styles.studentNameRow}>
          <Ionicons name="person-outline" size={normalize(16)} color={colors.neutral[400]} />
          <Text style={styles.studentName} numberOfLines={1}>{name}</Text>
        </View>
        <View style={styles.studentHeaderEnd}>
          {student.attendanceStatus && (
            <Badge
              label={t(`scheduling.summary.${student.attendanceStatus}`)}
              variant={ATTENDANCE_BADGE_VARIANT[student.attendanceStatus]}
              size="sm"
            />
          )}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={normalize(18)}
            color={colors.neutral[400]}
          />
        </View>
      </Pressable>

      {/* Expanded Content */}
      {expanded && (
        <View style={styles.studentContent}>
          {!hasContent && (
            <Text style={styles.noDataText}>{t('scheduling.summary.noEvaluations')}</Text>
          )}

          {/* Scores */}
          {hasScores && (
            <View style={styles.scoresSection}>
              <Text style={styles.subsectionTitle}>{t('scheduling.summary.scores')}</Text>
              <View style={styles.scoresGrid}>
                <ScoreDisplay
                  label={t('scheduling.summary.memorization')}
                  value={eval_!.memorization_score}
                />
                <ScoreDisplay
                  label={t('scheduling.summary.tajweed')}
                  value={eval_!.tajweed_score}
                />
                <ScoreDisplay
                  label={t('scheduling.summary.fluency')}
                  value={eval_!.recitation_quality}
                />
              </View>
            </View>
          )}

          {/* Notes */}
          {eval_?.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.subsectionTitle}>{t('scheduling.summary.teacherNotes')}</Text>
              <Text style={styles.notesText}>{eval_.notes}</Text>
            </View>
          )}

          {/* Recitations */}
          {(eval_?.recitations.length ?? 0) > 0 && (
            <View style={styles.recitationsSection}>
              <Text style={styles.subsectionTitle}>{t('scheduling.summary.recitations')}</Text>
              {eval_!.recitations.map((rec) => (
                <RevisionCard
                  key={rec.id}
                  item={recitationToRevisionItem(rec)}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </Card>
  );
}

// ─── Score Display ───────────────────────────────────────────────────────────

function ScoreDisplay({ label, value }: { label: string; value: number | null }) {
  return (
    <View style={styles.scoreItem}>
      <Text style={styles.scoreLabel} numberOfLines={1} adjustsFontSizeToFit>{label}</Text>
      <Text style={styles.scoreValue}>
        {value != null ? `${value}/5` : '—'}
      </Text>
    </View>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mergeStudentResults(
  attendance: AttendanceSummaryRecord[],
  evaluations: EvaluationWithRecitations[],
): MergedStudentResult[] {
  const map = new Map<string, MergedStudentResult>();

  for (const a of attendance) {
    map.set(a.student_id, {
      studentId: a.student_id,
      studentName: a.students.profiles.full_name,
      nameLocalized: a.students.profiles.name_localized,
      attendanceStatus: a.status,
      evaluation: null,
    });
  }

  for (const e of evaluations) {
    const existing = map.get(e.student_id);
    if (existing) {
      existing.evaluation = e;
    } else {
      map.set(e.student_id, {
        studentId: e.student_id,
        studentName: e.student?.profiles?.full_name ?? '—',
        nameLocalized: e.student?.profiles?.name_localized ?? null,
        attendanceStatus: null,
        evaluation: e,
      });
    }
  }

  return Array.from(map.values());
}

function recitationToRevisionItem(rec: RecitationRecord): RevisionScheduleItem {
  return {
    progress_id: null,
    surah_number: rec.surah_number,
    from_ayah: rec.from_ayah,
    to_ayah: rec.to_ayah,
    status: rec.needs_repeat ? 'needs_review' : 'memorized',
    review_type: rec.recitation_type,
    next_review_date: null,
    last_reviewed_at: rec.created_at,
    review_count: 1,
    ease_factor: 2.5,
    avg_accuracy: rec.accuracy_score,
    avg_tajweed: rec.tajweed_score,
    avg_fluency: rec.fluency_score,
    first_memorized_at: null,
  };
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  loading: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  emptyCard: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.textStyles.body,
    color: lightTheme.textTertiary,
    fontStyle: 'italic',
  },

  // ── Attendance Card ──
  attendanceCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  attendanceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  // ── Section Titles ──
  sectionTitle: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
  },
  subsectionTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ── Student Card ──
  studentCard: {
    overflow: 'hidden',
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  studentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  studentName: {
    ...typography.textStyles.bodyMedium,
    color: lightTheme.text,
    flex: 1,
  },
  studentHeaderEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  studentContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral[200],
    paddingTop: spacing.md,
  },
  noDataText: {
    ...typography.textStyles.caption,
    color: lightTheme.textTertiary,
    fontStyle: 'italic',
  },

  // ── Scores ──
  scoresSection: {
    gap: spacing.sm,
  },
  scoresGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: colors.neutral[50],
    borderRadius: radius.sm,
  },
  scoreLabel: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    textAlign: 'center',
  },
  scoreValue: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.lg,
    color: lightTheme.primary,
  },

  // ── Notes ──
  notesSection: {
    gap: spacing.xs,
  },
  notesText: {
    ...typography.textStyles.body,
    color: lightTheme.text,
    fontStyle: 'italic',
  },

  // ── Recitations ──
  recitationsSection: {
    gap: spacing.sm,
  },
});
