import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useSchoolKPIs,
  useTeacherActivity,
  useSessionCompletionStats,
} from './useAdminReports';
import { usePeriodComparison } from './usePreviousPeriod';
import type { DateRange, SchoolPulse, SchoolKPISummary } from '../types/reports.types';
import {
  generateAdminInsights,
  generateAdminPulseMessage,
} from '../services/insight-generator';
import {
  ATTENDANCE_THRESHOLDS,
  SCORE_THRESHOLDS,
  PUNCTUALITY_THRESHOLDS,
  getHealthStatus,
  getTrendDirection,
  formatTrendLabel,
  getScoreLabel,
  worstStatus,
} from '../utils/thresholds';

export function useSchoolPulse(schoolId: string | null, dateRange: DateRange) {
  const { t } = useTranslation();

  const kpis = useSchoolKPIs(schoolId, dateRange);
  const teacherActivity = useTeacherActivity(schoolId, dateRange);
  const sessionCompletion = useSessionCompletionStats(schoolId, dateRange);
  const comparison = usePeriodComparison(schoolId, dateRange);

  const isLoading = kpis.isLoading || teacherActivity.isLoading || sessionCompletion.isLoading || comparison.isLoading;
  const isError = kpis.isError;

  const pulse: SchoolPulse | undefined = useMemo(() => {
    if (!kpis.data) return undefined;

    const compData = comparison.data;
    const teachers = teacherActivity.data ?? [];
    const sessions = sessionCompletion.data ?? [];

    const previousKpis: SchoolKPISummary | null = compData
      ? {
          activeStudents: kpis.data.activeStudents,
          activeTeachers: kpis.data.activeTeachers,
          totalClasses: kpis.data.totalClasses,
          attendanceRate: compData.previousAttendanceRate,
          averageScore:
            (compData.previousAvgMemorization +
              compData.previousAvgTajweed +
              compData.previousAvgRecitation) /
            3,
          totalStickersAwarded: Number(compData.previousStickers),
        }
      : null;

    // Pulse message
    const { status, message } = generateAdminPulseMessage(kpis.data, teachers, t);

    // Student health pillar
    const attendanceStatus = getHealthStatus(kpis.data.attendanceRate, ATTENDANCE_THRESHOLDS);
    const scoreStatus = getHealthStatus(kpis.data.averageScore, SCORE_THRESHOLDS);

    // Teacher engagement pillar
    const inactiveTeachers = teachers.filter((ta) => ta.sessionsLogged === 0);
    const activeTeachers = teachers.filter((ta) => ta.sessionsLogged > 0);
    const avgCompletionRate = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.completionRate, 0) / sessions.length
      : 0;
    const teacherStatus = inactiveTeachers.length === 0 ? 'green' as const
      : inactiveTeachers.length <= 1 ? 'yellow' as const
      : 'red' as const;

    // Academic progress pillar
    const academicStatus = scoreStatus;

    // Alerts
    const alerts = generateAdminInsights(kpis.data, previousKpis, teachers, sessions, t);

    return {
      status,
      message,
      studentHealth: {
        status: worstStatus(attendanceStatus, scoreStatus),
        activeStudents: kpis.data.activeStudents,
        attendanceRate: kpis.data.attendanceRate,
        attendanceTrend: getTrendDirection(
          kpis.data.attendanceRate,
          previousKpis?.attendanceRate ?? null,
          3,
        ),
        attendanceTrendLabel: formatTrendLabel(
          kpis.data.attendanceRate,
          previousKpis?.attendanceRate ?? null,
          'percentage',
        ),
        avgScore: kpis.data.averageScore,
        scoreTrend: getTrendDirection(
          kpis.data.averageScore,
          previousKpis?.averageScore ?? null,
          0.2,
        ),
        scoreTrendLabel: formatTrendLabel(
          kpis.data.averageScore,
          previousKpis?.averageScore ?? null,
          'score',
        ),
      },
      teacherEngagement: {
        status: teacherStatus,
        activeTeachers: activeTeachers.length,
        inactiveTeachers: inactiveTeachers.length,
        inactiveNames: inactiveTeachers.map((ta) => ta.fullName),
        punctualityRate: 0, // populated when teacher attendance data is available
        sessionCompletionRate: Math.round(avgCompletionRate),
      },
      academicProgress: {
        status: academicStatus,
        totalStudents: kpis.data.activeStudents,
        avgScore: kpis.data.averageScore,
        scoreLabel: t(`insights.scoreLabel.${getScoreLabel(kpis.data.averageScore)}`),
        stickersAwarded: kpis.data.totalStickersAwarded,
      },
      alerts,
    };
  }, [kpis.data, teacherActivity.data, sessionCompletion.data, comparison.data, t]);

  return {
    data: pulse,
    isLoading,
    isError,
    refetch: async () => {
      await Promise.all([
        kpis.refetch(),
        teacherActivity.refetch(),
        sessionCompletion.refetch(),
        comparison.refetch(),
      ]);
    },
  };
}
