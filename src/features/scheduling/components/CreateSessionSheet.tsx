import React, { useState, useMemo, useCallback, forwardRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';

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

export const CreateSessionSheet = forwardRef<BottomSheetModal>((_props, ref) => {
  const { t } = useTranslation();
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
  const snapPoints = useMemo(() => ['90%'], []);

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

  const resetForm = useCallback(() => {
    setSessionType('class');
    setSelectedClassId(null);
    setSelectedStudentId(null);
    setSessionDate(null);
    setStartTimeIdx(null);
    setEndTimeIdx(null);
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
          (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
          resetForm();
        },
        onError: (err: Error) => {
          Alert.alert(t('common.error'), err.message);
        },
      },
    );
  }, [canSubmit, profile, schoolId, sessionDate, startTimeIdx, endTimeIdx, sessionType, selectedClassId, selectedStudentId, createMutation, t, ref, resetForm]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={resetForm}
      enablePanDownToClose
      handleIndicatorStyle={styles.handleIndicator}
    >
      {/* Header */}
      <View style={styles.sheetHeader}>
        <Text style={styles.title}>{t('scheduling.createSessionTitle')}</Text>
        <Pressable
          onPress={() => (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss()}
          hitSlop={8}
        >
          <Ionicons name="close" size={24} color={colors.neutral[500]} />
        </Pressable>
      </View>

      {teacherClasses.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : (
        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
        </BottomSheetScrollView>
      )}

      {/* Fixed footer */}
      <View style={styles.footer}>
        <Button
          title={t('scheduling.createSession')}
          onPress={handleSubmit}
          variant="primary"
          size="lg"
          loading={createMutation.isPending}
          disabled={!canSubmit}
        />
      </View>
    </BottomSheetModal>
  );
});

CreateSessionSheet.displayName = 'CreateSessionSheet';

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  handleIndicator: {
    backgroundColor: colors.neutral[300],
    width: normalize(40),
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    fontSize: normalize(20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  sectionTitle: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
    fontSize: normalize(15),
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
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
});
