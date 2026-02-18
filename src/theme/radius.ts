/**
 * Design System — Border Radius Tokens
 * Updated for a softer, more playful aesthetic.
 */

export const radius = {
  /** 8 px — subtle rounding (small chips) */
  xs: 8,
  /** 12 px — inputs, buttons */
  sm: 12,
  /** 16 px — cards, standard containers */
  md: 16,
  /** 24 px — large cards, section backgrounds */
  lg: 24,
  /** 32 px — modals, prominent floating elements */
  xl: 32,
  /** 9999 px — perfect circle / stadium shape */
  full: 9999,
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────

export type Radius = typeof radius;
export type RadiusKey = keyof Radius;
