import type { TimePeriod, DateRange, TimeGranularity } from '../types/reports.types';

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const dayOfWeek = d.getDay(); // 0=Sunday, 1=Monday, ...
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // ISO 8601: Monday = start
  d.setDate(d.getDate() - diff);
  return d;
}

const GRANULARITY_MAP: Record<TimePeriod, TimeGranularity> = {
  this_week: 'day',
  this_month: 'day',
  this_term: 'week',
  all_time: 'month',
};

export function getGranularity(period: TimePeriod): TimeGranularity {
  return GRANULARITY_MAP[period];
}

export function getDateRange(
  period: TimePeriod,
  schoolCreatedAt?: string,
): DateRange {
  const today = new Date();
  const granularity = getGranularity(period);
  let startDate: Date;

  switch (period) {
    case 'this_week': {
      startDate = getMonday(today);
      break;
    }
    case 'this_month': {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    }
    case 'this_term': {
      startDate = new Date(today);
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    }
    case 'all_time': {
      startDate = schoolCreatedAt
        ? new Date(schoolCreatedAt)
        : new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      break;
    }
  }

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(today),
    granularity,
  };
}
