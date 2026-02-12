import { useQuery } from '@tanstack/react-query';
import { teacherReportsService } from '../services/teacher-reports.service';
import type { DateRange } from '../types/reports.types';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes per NFR-003

export function useClassAnalytics(classId: string | null, dateRange: DateRange) {
  return useQuery({
    queryKey: ['teacher-reports', 'class-analytics', classId, dateRange.startDate, dateRange.endDate],
    queryFn: () => teacherReportsService.getClassAnalytics(classId!, dateRange),
    enabled: !!classId,
    staleTime: STALE_TIME,
  });
}

export function useClassScoreTrend(
  schoolId: string | null,
  classId: string | null,
  dateRange: DateRange,
) {
  return useQuery({
    queryKey: ['teacher-reports', 'score-trend', schoolId, classId, dateRange.startDate, dateRange.endDate],
    queryFn: () => teacherReportsService.getClassScoreTrend(schoolId!, classId!, dateRange),
    enabled: !!schoolId && !!classId,
    staleTime: STALE_TIME,
  });
}

export function useClassAttendanceTrend(
  schoolId: string | null,
  classId: string | null,
  dateRange: DateRange,
) {
  return useQuery({
    queryKey: ['teacher-reports', 'attendance-trend', schoolId, classId, dateRange.startDate, dateRange.endDate],
    queryFn: () => teacherReportsService.getClassAttendanceTrend(schoolId!, classId!, dateRange),
    enabled: !!schoolId && !!classId,
    staleTime: STALE_TIME,
  });
}

export function useStudentsNeedingAttention(
  classId: string | null,
  dateRange: DateRange,
) {
  return useQuery({
    queryKey: ['teacher-reports', 'needs-attention', classId, dateRange.startDate, dateRange.endDate],
    queryFn: () => teacherReportsService.getStudentsNeedingAttention(classId!, dateRange),
    enabled: !!classId,
    staleTime: STALE_TIME,
  });
}

export function useTeacherClasses(teacherId: string | null) {
  return useQuery({
    queryKey: ['teacher-reports', 'classes', teacherId],
    queryFn: () => teacherReportsService.getTeacherClasses(teacherId!),
    enabled: !!teacherId,
    staleTime: STALE_TIME,
  });
}
