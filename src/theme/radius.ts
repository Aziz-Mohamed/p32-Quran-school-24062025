/**
 * Design System — Border Radius Tokens
 *
 * Updated for a softer, more playful aesthetic.
 * All values are run through normalize() for cross-platform consistency.
 */
import { normalize } from './normalize';

export const radius = {
  /** 8 px — subtle rounding (small chips) */
  xs: normalize(8),
  /** 12 px — inputs, buttons */
  sm: normalize(12),
  /** 16 px — cards, standard containers */
  md: normalize(16),
  /** 24 px — large cards, section backgrounds */
  lg: normalize(24),
  /** 32 px — modals, prominent floating elements */
  xl: normalize(32),
  /** 9999 px — perfect circle / stadium shape */
  full: normalize(9999),
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type Radius = typeof radius;
export type RadiusKey = keyof Radius;
