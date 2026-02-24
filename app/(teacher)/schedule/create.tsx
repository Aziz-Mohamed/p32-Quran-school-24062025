import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  Pressable,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/forms/DatePicker';
import { LoadingState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useLocalizedName } from '@/hooks/useLocalizedName';
import { useTeacherClasses } from '@/features/reports/hooks/useTeacherReports';
import { useStudents } from '@/features/students/hooks/useStudents';
import { useCreateScheduledSession } from '@/features/scheduling/hooks/useScheduledSessions';
import type { SessionType } from '@/features/scheduling/types/scheduling.types';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';
import { radius } from '@/theme/radius';

// ─── Time Helpers ─────────────────────────────────────────────────────────────

function formatTimeHHMM(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function formatTimeDisplay(hours: number, minutes: number): string {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
}

const TIME_OPTIONS = Array.from({ length: 28 }, (_, i) => {
  const totalMinutes = 6 * 60 + i * 30; // 6:00 AM to 19:30 PM
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes, label: formatTimeDisplay(hours, minutes), value: formatTimeHHMM(hours, minutes) };
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateSessionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, schoolId } = useAuth();
  const { resolveName } = useLocalizedName();

  const createMutation = useCreateScheduledSession();
  const teacherClasses = useTeacherClasses(profile?.id ?? null);

  // ── Form state ──────────────────────────────────────────────────────────
  const [sessionType, setSessionType] = useState<SessionType>('class');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [sessionDate, setSessionDate] = useState<Date | null>(null);
  const [startTimeIdx, setStartTimeIdx] = useState<number | null>(null);
  const [endTimeIdx, setEndTimeIdx] = useState<number | null>(null);

  // ── Student list (filtered by selected class) ───────────────────────────
  const { data: students = [], isLoading: studentsLoading } = useStudents(
    selectedClassId ? { classId: selectedClassId, isActive: true } : undefined,
  );

  const classes = useMemo(() => teacherClasses.data ?? [], [teacherClasses.data]);

  // Reset downstream when session type changes
  const handleTypeChange = useCallback((type: SessionType) => {
    setSessionType(type);
    setSelectedClassId(null);
    setSelectedStudentId(null);
  }, []);

  const handleClassChange = useCallback((classId: string) => {
    setSelectedClassId(classId);
    setSelectedStudentId(null);
  }, []);

  // ── Validation ──────────────────────────────────────────────────────────
  const canSubmit = useMemo(() => {
    if (!sessionDate || startTimeIdx == null || endTimeIdx == null) return false;
    if (startTimeIdx >= endTimeIdx) return false;
    if (sessionType === 'class' && !selectedClassId) return false;
    if (sessionType === 'individual' && !selectedStudentId) return false;
    return true;
  }, [sessionDate, startTimeIdx, endTimeIdx, sessionType, selectedClassId, selectedStudentId]);

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!canSubmit || !profile?.id || !schoolId) return;

    const dateStr = sessionDate!.toISOString().split('T')[0];
    const start = TIME_OPTIONS[startTimeIdx!];
    const end = TIME_OPTIONS[endTimeIdx!];

    createMutation.mutate(
      {
        teacherId: profile.id,
        schoolId,
        sessionDate: dateStr,
        startTime: start.value,
        endTime: end.value,
        sessionType,
        classId: selectedClassId ?? undefined,
        studentId: selectedStudentId ?? undefined,
      },
      {
        onSuccess: () => {
          Alert.alert(t('common.success'), t('scheduling.sessionCreated'), [
            { text: t('common.done'), onPress: () => router.back() },
          ]);
        },
        onError: (err: Error) => {
          Alert.alert(t('common.error'), err.message);
        },
      },
    );
  }, [canSubmit, profile, schoolId, sessionDate, startTimeIdx, endTimeIdx, sessionType, selectedClassId, selectedStudentId, createMutation, t, router]);

  if (teacherClasses.isLoading) return <LoadingState />;

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Button
          title={t('common.back')}
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
        />

        <Text style={styles.title}>{t('scheduling.createSessionTitle')}</Text>

        {/* ── Session Type ── */}
        <Text style={styles.sectionTitle}>{t('scheduling.selectSessionType')}</Text>
        <View style={styles.pillRow}>
          {(['class', 'individual'] as const).map((type) => (
            <Pressable
              key={type}
              style={[styles.pill, sessionType === type && styles.pillActive]}
              onPress={() => handleTypeChange(type)}
              accessibilityRole="radio"
              accessibilityState={{ selected: sessionType === type }}
            >
              <Ionicons
                name={type === 'class' ? 'people' : 'person'}
                size={16}
                color={sessionType === type ? colors.white : colors.neutral[600]}
              />
              <Text style={[styles.pillText, sessionType === type && styles.pillTextActive]}>
                {t(`scheduling.${type === 'class' ? 'classSession' : 'individualSessionType'}`)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Class Selector ── */}
        {(sessionType === 'class' || sessionType === 'individual') && (
          <>
            <Text style={styles.sectionTitle}>{t('scheduling.selectClass')}</Text>
            {classes.length === 0 ? (
              <Text style={styles.emptyText}>{t('common.noResults')}</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                <View style={styles.chipRow}>
                  {classes.map((cls) => {
                    const isSelected = selectedClassId === cls.id;
                    return (
                      <Pressable
                        key={cls.id}
                        style={[styles.chip, isSelected && styles.chipActive]}
                        onPress={() => handleClassChange(cls.id)}
                      >
                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                          {resolveName(cls.name_localized, cls.name)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </>
        )}

        {/* ── Student Selector (individual only) ── */}
        {sessionType === 'individual' && selectedClassId && (
          <>
            <Text style={styles.sectionTitle}>{t('scheduling.selectStudent')}</Text>
            {studentsLoading ? (
              <LoadingState />
            ) : students.length === 0 ? (
              <Text style={styles.emptyText}>{t('common.noResults')}</Text>
            ) : (
              <View style={styles.studentGrid}>
                {students.map((student: any) => {
                  const isSelected = selectedStudentId === student.id;
                  const name = resolveName(student.profiles?.name_localized, student.profiles?.full_name);
                  return (
                    <Pressable
                      key={student.id}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setSelectedStudentId(student.id)}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </>
        )}

        {/* ── Date ── */}
        <DatePicker
          label={t('scheduling.selectDate')}
          value={sessionDate}
          onChange={setSessionDate}
          minimumDate={new Date()}
        />

        {/* ── Start Time ── */}
        <Text style={styles.sectionTitle}>{t('scheduling.startTime')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <View style={styles.chipRow}>
            {TIME_OPTIONS.map((opt, idx) => {
              const isSelected = startTimeIdx === idx;
              return (
                <Pressable
                  key={opt.value}
                  style={[styles.timeChip, isSelected && styles.chipActive]}
                  onPress={() => {
                    setStartTimeIdx(idx);
                    if (endTimeIdx != null && endTimeIdx <= idx) setEndTimeIdx(null);
                  }}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* ── End Time ── */}
        <Text style={styles.sectionTitle}>{t('scheduling.endTime')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <View style={styles.chipRow}>
            {TIME_OPTIONS.filter((_, idx) => startTimeIdx != null ? idx > startTimeIdx : true).map((opt, idx) => {
              const realIdx = startTimeIdx != null ? idx + startTimeIdx + 1 : idx;
              const isSelected = endTimeIdx === realIdx;
              return (
                <Pressable
                  key={opt.value}
                  style={[styles.timeChip, isSelected && styles.chipActive]}
                  onPress={() => setEndTimeIdx(realIdx)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* ── Submit ── */}
        <Button
          title={t('scheduling.createSession')}
          onPress={handleSubmit}
          variant="primary"
          size="lg"
          loading={createMutation.isPending}
          disabled={!canSubmit}
          style={styles.submitButton}
        />
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
    marginTop: spacing.xs,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
  },
  pillActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  pillText: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[600],
  },
  pillTextActive: {
    color: colors.white,
  },
  chipScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingEnd: spacing.lg,
  },
  studentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
  },
  chipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  chipText: {
    ...typography.textStyles.label,
    color: colors.neutral[700],
  },
  chipTextActive: {
    color: colors.white,
  },
  timeChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
  },
  emptyText: {
    ...typography.textStyles.body,
    color: lightTheme.textTertiary,
    fontStyle: 'italic',
  },
  submitButton: {
    marginTop: spacing.lg,
  },
});
