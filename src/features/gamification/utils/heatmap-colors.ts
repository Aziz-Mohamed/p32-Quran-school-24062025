// Freshness-based color scale for the Quran Map heatmap.
// Uses the same color language as the revision tab:
// green (fresh) → yellow (fading) → orange (warning) → red (critical) → gray (dormant/uncertified).

import type { FreshnessState } from '../types/gamification.types';

const FRESHNESS_COLORS: Record<FreshnessState, string> = {
  fresh: '#22C55E',
  fading: '#EAB308',
  warning: '#F97316',
  critical: '#EF4444',
  dormant: '#9CA3AF',
  uncertified: '#EBEDF0',
};

/**
 * Get heatmap color for a rub' based on its freshness state.
 * Pass `null` for uncertified rub'.
 */
export function getHeatMapColor(state: FreshnessState | null): string {
  if (state === null) return FRESHNESS_COLORS.uncertified;
  return FRESHNESS_COLORS[state];
}

/** Legend entries for the heatmap (freshness states) */
export const HEATMAP_LEGEND = [
  { label: 'critical', color: FRESHNESS_COLORS.critical },
  { label: 'warning', color: FRESHNESS_COLORS.warning },
  { label: 'fading', color: FRESHNESS_COLORS.fading },
  { label: 'fresh', color: FRESHNESS_COLORS.fresh },
  { label: 'dormant', color: FRESHNESS_COLORS.dormant },
] as const;
