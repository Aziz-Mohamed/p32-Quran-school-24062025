import { useQuery } from '@tanstack/react-query';
import { parentReportsService } from '../services/parent-reports.service';
import type { DateRange } from '../types/reports.types';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes per NFR-003

export function useChildProgressReport(
  studentId: string | null,
  classId: string | null,
  dateRange: DateRange,
) {
  return useQuery({
    queryKey: ['parent-reports', 'progress', studentId, classId, dateRange.startDate, dateRange.endDate],
    queryFn: () => parentReportsService.getChildProgressReport(studentId!, classId, dateRange),
    enabled: !!studentId,
    staleTime: STALE_TIME,
  });
}

export function useChildScoreTrend(
  studentId: string | null,
  classId: string | null,
  dateRange: DateRange,
) {
  return useQuery({
    queryKey: ['parent-reports', 'score-trend', studentId, classId, dateRange.startDate, dateRange.endDate],
    queryFn: () =>
      classId
        ? parentReportsService.getChildScoreTrend(studentId!, classId, dateRange)
        : Promise.resolve([]),
    enabled: !!studentId,
    staleTime: STALE_TIME,
  });
}

export function useChildAttendance(
  studentId: string | null,
  dateRange: DateRange,
) {
  return useQuery({
    queryKey: ['parent-reports', 'attendance', studentId, dateRange.startDate, dateRange.endDate],
    queryFn: () => parentReportsService.getChildAttendanceSummary(studentId!, dateRange),
    enabled: !!studentId,
    staleTime: STALE_TIME,
  });
}

export function useChildGamification(studentId: string | null) {
  return useQuery({
    queryKey: ['parent-reports', 'gamification', studentId],
    queryFn: () => parentReportsService.getChildGamificationSummary(studentId!),
    enabled: !!studentId,
    staleTime: STALE_TIME,
  });
}
