import type { FreshnessState } from '../types/gamification.types';

/** Solid indicator colors (dots, bars, accents) */
export const FRESHNESS_DOT_COLORS: Record<FreshnessState, string> = {
  fresh: '#22C55E',
  fading: '#EAB308',
  warning: '#F97316',
  critical: '#EF4444',
  dormant: '#9CA3AF',
  uncertified: '#D1D5DB',
};

/** Light background colors (chips, pill backgrounds) */
export const FRESHNESS_BG_COLORS: Record<FreshnessState, string> = {
  fresh: '#DCFCE7',
  fading: '#FEF9C3',
  warning: '#FFEDD5',
  critical: '#FEE2E2',
  dormant: '#F3F4F6',
  uncertified: '#F3F4F6',
};

/** Priority ordering for "worst state" calculations (higher = worse) */
export const STATE_PRIORITY: Record<FreshnessState, number> = {
  fresh: 1,
  fading: 2,
  dormant: 3,
  warning: 4,
  critical: 5,
  uncertified: 0,
};

/** Returns the worst freshness state from a collection of states */
export function getWorstState(states: FreshnessState[]): FreshnessState {
  let worst: FreshnessState = 'fresh';
  let worstPriority = 0;
  for (const s of states) {
    const p = STATE_PRIORITY[s] ?? 0;
    if (p > worstPriority) {
      worstPriority = p;
      worst = s;
    }
  }
  return worst;
}
