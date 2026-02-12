import { useState, useMemo } from 'react';
import type { TimePeriod, DateRange } from '../types/reports.types';
import { getDateRange } from '../utils/time-period';

export function useTimePeriod(schoolCreatedAt?: string) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('this_month');

  const dateRange: DateRange = useMemo(
    () => getDateRange(timePeriod, schoolCreatedAt),
    [timePeriod, schoolCreatedAt],
  );

  return { timePeriod, setTimePeriod, dateRange };
}
