/**
 * Design System — Border Radius Tokens
 */

export const radius = {
  /** 6 px — subtle rounding (inputs, small chips) */
  sm: 6,
  /** 10 px — cards, buttons */
  md: 10,
  /** 14 px — modals, larger cards */
  lg: 14,
  /** 20 px — pills, floating actions */
  xl: 20,
  /** 9999 px — perfect circle / stadium shape */
  full: 9999,
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────

export type Radius = typeof radius;
export type RadiusKey = keyof Radius;
