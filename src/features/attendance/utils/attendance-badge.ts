export type AttendanceBadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

export interface AttendanceBadgeInfo {
  label: string;
  variant: AttendanceBadgeVariant;
}

const VARIANT_MAP: Record<string, AttendanceBadgeVariant> = {
  present: 'success',
  absent: 'error',
  late: 'warning',
  excused: 'info',
};

/**
 * Returns a badge label and variant for a given attendance status.
 * Works for both student and parent dashboards.
 */
export function getAttendanceBadge(
  status: string | null | undefined,
  t: (key: string) => string,
): AttendanceBadgeInfo {
  if (!status || !VARIANT_MAP[status]) {
    return { label: t('parent.dashboard.notMarked'), variant: 'default' };
  }
  return {
    label: t(`admin.attendance.status.${status}`),
    variant: VARIANT_MAP[status],
  };
}
