import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import { ScoreInput } from '@/components/forms/ScoreInput';
import { TextField } from '@/components/ui/TextField';
import { LoadingState, ErrorState } from '@/components/feedback';
import { RecitationForm, EMPTY_RECITATION, validateRecitationForm } from '@/features/memorization';
import type { RecitationFormData } from '@/features/memorization';
import { useAuth } from '@/hooks/useAuth';
import { useStudents } from '@/features/students/hooks/useStudents';
import { useCompleteSessionWorkspace } from '@/features/scheduling/hooks/useCompleteSessionWorkspace';
import { scheduledSessionService } from '@/features/scheduling/services/scheduled-session.service';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

// ─── Types ──────────────────────────────────────────────────────────────────

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface EvalData {
  memorization_score: number | null;
  tajweed_score: number | null;
  recitation_quality: number | null;
  notes: string;
  homework_assigned: string;
  homework_due_date: string | null;
}

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: colors.semantic.success,
  absent: colors.semantic.error,
  late: colors.semantic.warning,
  excused: colors.primary[500],
};

const STATUS_ORDER: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];

const EMPTY_EVAL: EvalData = {
  memorization_score: null,
  tajweed_score: null,
  recitation_quality: null,
  notes: '',
  homework_assigned: '',
  homework_due_date: null,
};

// ─── Session Workspace Screen ───────────────────────────────────────────────

export default function SessionWorkspaceScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile, schoolId } = useAuth();

  // Fetch session details
  const {
    data: session,
    isLoading: sessionLoading,
    error: sessionError,
    refetch,
  } = useQuery({
    queryKey: ['scheduled-session', id],
    queryFn: async () => {
      const { data, error } = await scheduledSessionService.getScheduledSessions({
        schoolId: schoolId!,
      });
      if (error) throw error;
      return (data ?? []).find((s: any) => s.id === id) ?? null;
    },
    enabled: !!id && !!schoolId,
  });

  // Fetch students for class sessions (only query when session is loaded and is a class type)
  const isClassSession = session?.session_type === 'class';
  const classStudentFilters = isClassSession && session?.class_id
    ? { classId: session.class_id }
    : undefined;
  const { data: classStudents = [], isLoading: studentsLoading } = useStudents(classStudentFilters);
  // For individual sessions, skip the students loading gate since we don't need the query
  const isStudentsReady = isClassSession ? !studentsLoading : true;

  // Build the student list
  const studentList = useMemo(() => {
    if (!session) return [];
    if (isClassSession) {
      return classStudents.map((s: any) => ({
        id: s.id,
        name: s.profiles?.full_name ?? '—',
      }));
    }
    // Individual session — single student
    if (session.student_id) {
      return [
        {
          id: session.student_id,
          name: (session as any).student?.profiles?.full_name ?? '—',
        },
      ];
    }
    return [];
  }, [session, isClassSession, classStudents]);

  // Local state
  const [attendanceStatuses, setAttendanceStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [evaluations, setEvaluations] = useState<Record<string, EvalData>>({});
  const [recitations, setRecitations] = useState<Record<string, RecitationFormData[]>>({});
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // Auto-expand for individual sessions
  const effectiveExpandedId = useMemo(() => {
    if (!isClassSession && studentList.length === 1) {
      return studentList[0].id;
    }
    return expandedStudentId;
  }, [isClassSession, studentList, expandedStudentId]);

  const completeSession = useCompleteSessionWorkspace();

  const handleStatusToggle = (studentId: string) => {
    const current = attendanceStatuses[studentId] ?? 'present';
    const nextIndex = (STATUS_ORDER.indexOf(current) + 1) % STATUS_ORDER.length;
    setAttendanceStatuses((prev) => ({ ...prev, [studentId]: STATUS_ORDER[nextIndex] }));
  };

  const handleMarkAllPresent = () => {
    const all: Record<string, AttendanceStatus> = {};
    for (const s of studentList) {
      all[s.id] = 'present';
    }
    setAttendanceStatuses(all);
  };

  const getEval = (studentId: string): EvalData => evaluations[studentId] ?? EMPTY_EVAL;

  const updateEval = (studentId: string, field: keyof EvalData, value: any) => {
    setEvaluations((prev) => ({
      ...prev,
      [studentId]: { ...getEval(studentId), [field]: value },
    }));
  };

  const getRecitations = (studentId: string): RecitationFormData[] => recitations[studentId] ?? [];

  const addRecitation = (studentId: string) => {
    setRecitations((prev) => ({
      ...prev,
      [studentId]: [...(prev[studentId] ?? []), { ...EMPTY_RECITATION }],
    }));
  };

  const updateRecitation = (studentId: string, index: number, data: RecitationFormData) => {
    setRecitations((prev) => {
      const list = [...(prev[studentId] ?? [])];
      list[index] = data;
      return { ...prev, [studentId]: list };
    });
  };

  const removeRecitation = (studentId: string, index: number) => {
    setRecitations((prev) => {
      const list = [...(prev[studentId] ?? [])];
      list.splice(index, 1);
      return { ...prev, [studentId]: list };
    });
  };

  const toggleExpand = (studentId: string) => {
    setExpandedStudentId((prev) => (prev === studentId ? null : studentId));
  };

  const handleComplete = () => {
    if (!session || !profile?.id || !schoolId) return;

    // Validate all recitations before submitting
    for (const [studentId, forms] of Object.entries(recitations)) {
      for (let i = 0; i < forms.length; i++) {
        const errors = validateRecitationForm(forms[i]);
        if (errors) {
          const student = studentList.find((s) => s.id === studentId);
          Alert.alert(
            t('common.error'),
            t('memorization.validation.recitationError', { number: i + 1, name: student?.name ?? 'student', errors: Object.values(errors).join(', ') }),
          );
          return;
        }
      }
    }

    const records = studentList.map((s) => ({
      student_id: s.id,
      status: attendanceStatuses[s.id] ?? 'present',
    }));

    // Only include attendance for class sessions (attendance table requires class_id NOT NULL)
    const attendance = isClassSession && session.class_id
      ? {
          class_id: session.class_id,
          date: session.session_date,
          scheduled_session_id: session.id,
          records,
        }
      : null;

    completeSession.mutate(
      {
        scheduledSessionId: session.id,
        classId: session.class_id ?? '',
        teacherId: profile.id,
        sessionDate: session.session_date,
        attendance,
        evaluations,
        recitations,
        schoolId,
      },
      {
        onSuccess: () => {
          Alert.alert(t('common.success'), t('scheduling.sessionCompleted'), [
            { text: t('common.done'), onPress: () => router.back() },
          ]);
        },
        onError: (err) => {
          Alert.alert(t('common.error'), err.message);
        },
      },
    );
  };

  // ─── Loading / Error States ─────────────────────────────────────────────

  if (sessionLoading || !isStudentsReady) return <LoadingState />;
  if (sessionError) return <ErrorState description={sessionError.message} onRetry={refetch} />;
  if (!session) return <ErrorState description={t('scheduling.sessionNotFound')} />;

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Button
          title={t('common.back')}
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
        />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>
              {session.class?.name ?? t('scheduling.individualSession')}
            </Text>
            <Text style={styles.subtitle}>
              {session.session_date} | {session.start_time?.slice(0, 5)} – {session.end_time?.slice(0, 5)}
            </Text>
          </View>
          <Badge label={t('scheduling.status.in_progress')} variant="warning" size="md" />
        </View>

        {/* Mark All Present (class sessions only) */}
        {isClassSession && studentList.length > 0 && (
          <Button
            title={t('scheduling.workspace.markAllPresent')}
            onPress={handleMarkAllPresent}
            variant="secondary"
            size="md"
            icon={<Ionicons name="checkmark-done" size={18} color={colors.primary[500]} />}
          />
        )}

        {/* Student List */}
        {studentList.length === 0 ? (
          <Card variant="outlined" style={styles.emptyCard}>
            <Text style={styles.emptyText}>{t('scheduling.workspace.noStudents')}</Text>
          </Card>
        ) : (
          studentList.map((student) => {
            const status: AttendanceStatus = attendanceStatuses[student.id] ?? 'present';
            const isExpanded = effectiveExpandedId === student.id;
            const evalData = getEval(student.id);

            return (
              <Card key={student.id} variant="default" style={styles.studentCard}>
                {/* Student Row */}
                <View style={styles.studentRow}>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{student.name}</Text>
                  </View>

                  {/* Attendance Toggle (class sessions only) */}
                  {isClassSession && (
                    <Pressable
                      onPress={() => handleStatusToggle(student.id)}
                      style={[
                        styles.statusBadge,
                        { backgroundColor: STATUS_COLORS[status] + '20' },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: STATUS_COLORS[status] }]}>
                        {t(`admin.attendance.status.${status}`)}
                      </Text>
                    </Pressable>
                  )}

                  {/* Expand/Collapse Eval (class sessions only — individual auto-expands) */}
                  {isClassSession && (
                    <Pressable onPress={() => toggleExpand(student.id)} style={styles.expandButton}>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'create-outline'}
                        size={20}
                        color={colors.primary[500]}
                      />
                    </Pressable>
                  )}
                </View>

                {/* Evaluation Form (expanded) */}
                {isExpanded && (
                  <View style={styles.evalSection}>
                    <Text style={styles.evalTitle}>{t('scheduling.workspace.evaluation')}</Text>

                    <ScoreInput
                      label={t('teacher.sessions.memorization')}
                      value={evalData.memorization_score}
                      onChange={(v) => updateEval(student.id, 'memorization_score', v)}
                    />
                    <ScoreInput
                      label={t('teacher.sessions.tajweed')}
                      value={evalData.tajweed_score}
                      onChange={(v) => updateEval(student.id, 'tajweed_score', v)}
                    />
                    <ScoreInput
                      label={t('teacher.sessions.recitation')}
                      value={evalData.recitation_quality}
                      onChange={(v) => updateEval(student.id, 'recitation_quality', v)}
                    />

                    <TextField
                      label={t('teacher.sessions.notes')}
                      placeholder={t('teacher.sessions.notesPlaceholder')}
                      value={evalData.notes}
                      onChangeText={(v) => updateEval(student.id, 'notes', v)}
                      multiline
                    />

                    <TextField
                      label={t('teacher.sessions.homeworkDescription')}
                      placeholder={t('teacher.sessions.homeworkPlaceholder')}
                      value={evalData.homework_assigned}
                      onChangeText={(v) => updateEval(student.id, 'homework_assigned', v)}
                      multiline
                    />

                    {/* Recitations Section */}
                    <View style={styles.recitationSection}>
                      <View style={styles.recitationHeader}>
                        <Text style={styles.recitationTitle}>{t('memorization.recitations')}</Text>
                        <Button
                          title={t('memorization.addRecitation')}
                          onPress={() => addRecitation(student.id)}
                          variant="secondary"
                          size="sm"
                          icon={<Ionicons name="add-circle-outline" size={16} color={colors.primary[500]} />}
                        />
                      </View>

                      {getRecitations(student.id).map((recitation, idx) => (
                        <RecitationForm
                          key={idx}
                          index={idx}
                          data={recitation}
                          onChange={(data) => updateRecitation(student.id, idx, data)}
                          onRemove={() => removeRecitation(student.id, idx)}
                        />
                      ))}

                      {getRecitations(student.id).length === 0 && (
                        <Text style={styles.noRecitationsText}>
                          {t('memorization.noRecitations')}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </Card>
            );
          })
        )}

        {/* Complete Session */}
        {studentList.length > 0 && (
          <Button
            title={t('scheduling.workspace.completeSession')}
            onPress={handleComplete}
            variant="primary"
            size="lg"
            icon={<Ionicons name="checkmark-circle" size={20} color={colors.white} />}
            loading={completeSession.isPending}
            style={styles.completeButton}
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
  },
  subtitle: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    marginTop: normalize(2),
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  emptyText: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
  },
  studentCard: {
    padding: spacing.md,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[900],
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: normalize(16),
  },
  statusText: {
    ...typography.textStyles.caption,
    fontFamily: typography.fontFamily.semiBold,
    textTransform: 'capitalize',
  },
  expandButton: {
    padding: spacing.xs,
  },
  evalSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    gap: spacing.sm,
  },
  evalTitle: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
    fontSize: normalize(14),
    marginBottom: spacing.xs,
  },
  completeButton: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  recitationSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    gap: spacing.sm,
  },
  recitationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recitationTitle: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
    fontSize: normalize(14),
  },
  noRecitationsText: {
    ...typography.textStyles.caption,
    color: lightTheme.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
