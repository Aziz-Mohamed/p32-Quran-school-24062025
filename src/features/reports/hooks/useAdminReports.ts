import { useQuery } from '@tanstack/react-query';
import { adminReportsService } from '../services/admin-reports.service';
import type { DateRange } from '../types/reports.types';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes per NFR-003

export function useSchoolKPIs(schoolId: string | null, dateRange: DateRange) {
  return useQuery({
    queryKey: ['admin-reports', 'kpis', schoolId, dateRange.startDate, dateRange.endDate],
    queryFn: () => adminReportsService.getSchoolKPIs(schoolId!, dateRange),
    enabled: !!schoolId,
    staleTime: STALE_TIME,
  });
}

export function useAttendanceTrend(
  schoolId: string | null,
  dateRange: DateRange,
  classId?: string,
) {
  return useQuery({
    queryKey: ['admin-reports', 'attendance-trend', schoolId, dateRange.startDate, dateRange.endDate, classId],
    queryFn: () => adminReportsService.getAttendanceTrend(schoolId!, dateRange, classId),
    enabled: !!schoolId,
    staleTime: STALE_TIME,
  });
}

export function useScoreDistribution(
  schoolId: string | null,
  dateRange: DateRange,
  classId?: string,
) {
  return useQuery({
    queryKey: ['admin-reports', 'score-distribution', schoolId, dateRange.startDate, dateRange.endDate, classId],
    queryFn: () => adminReportsService.getScoreDistribution(schoolId!, dateRange, classId),
    enabled: !!schoolId,
    staleTime: STALE_TIME,
  });
}

export function useLevelDistribution(
  schoolId: string | null,
  classId?: string,
) {
  return useQuery({
    queryKey: ['admin-reports', 'level-distribution', schoolId, classId],
    queryFn: () => adminReportsService.getLevelDistribution(schoolId!, classId),
    enabled: !!schoolId,
    staleTime: STALE_TIME,
  });
}

export function useTeacherActivity(
  schoolId: string | null,
  dateRange: DateRange,
) {
  return useQuery({
    queryKey: ['admin-reports', 'teacher-activity', schoolId, dateRange.startDate, dateRange.endDate],
    queryFn: () => adminReportsService.getTeacherActivity(schoolId!, dateRange),
    enabled: !!schoolId,
    staleTime: STALE_TIME,
  });
}
