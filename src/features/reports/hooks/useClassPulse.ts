import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useClassAnalytics, useStudentsNeedingAttention } from './useTeacherReports';
import { usePeriodComparison } from './usePreviousPeriod';
import type { ClassAnalytics, ClassPulse, DateRange, StudentQuickStatus } from '../types/reports.types';
import {
  generateTeacherInsights,
  generateTeacherPulseMessage,
  buildTeacherHealthMetrics,
} from '../services/insight-generator';
import { getHealthStatus, SCORE_THRESHOLDS } from '../utils/thresholds';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

const STALE_TIME = 5 * 60 * 1000;

function useClassStudentStatus(classId: string | null, dateRange: DateRange) {
  return useQuery({
    queryKey: ['teacher-reports', 'student-status', classId, dateRange.startDate, dateRange.endDate],
    queryFn: async (): Promise<StudentQuickStatus[]> => {
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, current_level, current_streak, profiles!inner(full_name)')
        .eq('class_id', classId!)
        .eq('is_active', true);

      if (studentsError) throw studentsError;
      if (!students || students.length === 0) return [];

      const studentIds = students.map((s) => s.id);

      const { data: sessions } = await supabase
        .from('sessions')
        .select('student_id, memorization_score, tajweed_score, recitation_quality')
        .in('student_id', studentIds)
        .gte('session_date', dateRange.startDate)
        .lte('session_date', dateRange.endDate);

      // Compute per-student average score
      const scoreMap = new Map<string, number[]>();
      for (const s of sessions ?? []) {
        const scores: number[] = [];
        if (s.memorization_score != null) scores.push(s.memorization_score);
        if (s.tajweed_score != null) scores.push(s.tajweed_score);
        if (s.recitation_quality != null) scores.push(s.recitation_quality);
        if (scores.length === 0) continue;
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const existing = scoreMap.get(s.student_id) ?? [];
        existing.push(avg);
        scoreMap.set(s.student_id, existing);
      }

      return students.map((student) => {
        const studentScores = scoreMap.get(student.id) ?? [];
        const recentAvg = studentScores.length > 0
          ? studentScores.reduce((a, b) => a + b, 0) / studentScores.length
          : 0;

        const profile = Array.isArray(student.profiles) ? student.profiles[0] : student.profiles;
        const fullName = (profile as any)?.full_name ?? 'Unknown';

        return {
          studentId: student.id,
          fullName,
          status: studentScores.length === 0
            ? 'yellow' as const
            : getHealthStatus(recentAvg, SCORE_THRESHOLDS),
          currentLevel: student.current_level ?? 0,
          currentStreak: student.current_streak ?? 0,
          recentAvgScore: Math.round(recentAvg * 10) / 10,
        };
      });
    },
    enabled: !!classId,
    staleTime: STALE_TIME,
  });
}

export function useClassPulse(
  schoolId: string | null,
  classId: string | null,
  dateRange: DateRange,
) {
  const { t } = useTranslation();

  const analytics = useClassAnalytics(classId, dateRange);
  const attention = useStudentsNeedingAttention(classId, dateRange);
  const comparison = usePeriodComparison(schoolId, dateRange, classId);
  const studentStatus = useClassStudentStatus(classId, dateRange);

  const isLoading = analytics.isLoading || attention.isLoading || comparison.isLoading || studentStatus.isLoading;
  const isError = analytics.isError;

  const pulse: ClassPulse | undefined = useMemo(() => {
    if (!analytics.data) return undefined;

    const compData = comparison.data;
    const previousAnalytics: ClassAnalytics | null = compData
      ? {
          classId: classId ?? '',
          className: analytics.data.className,
          studentCount: analytics.data.studentCount,
          attendanceRate: compData.previousAttendanceRate,
          averageMemorization: compData.previousAvgMemorization,
          averageTajweed: compData.previousAvgTajweed,
          averageRecitation: compData.previousAvgRecitation,
          levelDistribution: [],
        }
      : null;

    const attentionStudents = attention.data ?? [];
    const currentStickers = compData?.currentStickers ?? 0;
    const previousStickers = compData?.previousStickers ?? 0;

    const { status, message } = generateTeacherPulseMessage(
      analytics.data,
      attentionStudents,
      t,
    );

    const healthMetrics = buildTeacherHealthMetrics(
      analytics.data,
      previousAnalytics,
      currentStickers,
      previousStickers,
      t,
    );

    const insights = generateTeacherInsights(
      analytics.data,
      previousAnalytics,
      attentionStudents,
      currentStickers,
      previousStickers,
      studentStatus.data ?? [],
      t,
    );

    return {
      status,
      message,
      attendance: healthMetrics.attendance,
      scores: healthMetrics.scores,
      engagement: healthMetrics.engagement,
      insights,
      students: studentStatus.data ?? [],
    };
  }, [analytics.data, attention.data, comparison.data, studentStatus.data, classId, t]);

  return {
    data: pulse,
    isLoading,
    isError,
    refetch: async () => {
      await Promise.all([
        analytics.refetch(),
        attention.refetch(),
        comparison.refetch(),
        studentStatus.refetch(),
      ]);
    },
  };
}
