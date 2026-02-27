import type { HealthStatus, TrendDirection } from '../types/reports.types';

// ─── Threshold Constants ────────────────────────────────────────────────────

export const ATTENDANCE_THRESHOLDS = { green: 85, yellow: 70 } as const;
export const SCORE_THRESHOLDS = { green: 4.0, yellow: 3.0 } as const;
export const PUNCTUALITY_THRESHOLDS = { green: 90, yellow: 70 } as const;
export const SESSION_COMPLETION_THRESHOLDS = { green: 90, yellow: 75 } as const;

// ─── Health Status ──────────────────────────────────────────────────────────

export function getHealthStatus(
  value: number,
  thresholds: { green: number; yellow: number },
): HealthStatus {
  if (value >= thresholds.green) return 'green';
  if (value >= thresholds.yellow) return 'yellow';
  return 'red';
}

// ─── Trend Direction ────────────────────────────────────────────────────────

/**
 * Compares current to previous value. Returns 'up' if improved by more than
 * `threshold`, 'down' if declined, 'steady' otherwise.
 */
export function getTrendDirection(
  current: number,
  previous: number | null,
  threshold: number = 1,
): TrendDirection {
  if (previous === null || previous === undefined) return 'steady';
  const diff = current - previous;
  if (diff > threshold) return 'up';
  if (diff < -threshold) return 'down';
  return 'steady';
}

/**
 * Formats the trend as a human-readable label like "+3%", "-0.2", or "--"
 */
export function formatTrendLabel(
  current: number,
  previous: number | null,
  format: 'percentage' | 'score' = 'percentage',
): string {
  if (previous === null || previous === undefined) return '--';
  const diff = current - previous;
  const sign = diff >= 0 ? '+' : '';
  if (format === 'percentage') {
    return `${sign}${Math.round(diff)}%`;
  }
  return `${sign}${diff.toFixed(1)}`;
}

// ─── Score Context Labels ───────────────────────────────────────────────────

export function getScoreLabel(value: number): string {
  if (value >= 4.5) return 'excellent';
  if (value >= 3.5) return 'good';
  if (value >= 2.5) return 'developing';
  return 'needsWork';
}

// ─── Overall Status ─────────────────────────────────────────────────────────

/** Returns the worst status among the given statuses */
export function worstStatus(...statuses: HealthStatus[]): HealthStatus {
  if (statuses.includes('red')) return 'red';
  if (statuses.includes('yellow')) return 'yellow';
  return 'green';
}
