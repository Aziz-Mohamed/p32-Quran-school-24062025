/**
 * Design System — Spacing Tokens
 *
 * Based on a 4 px grid. Every value is a multiple of 4.
 */

export const spacing = {
  /** 4 px — hairline gaps, icon padding */
  xs: 4,
  /** 8 px — tight element spacing */
  sm: 8,
  /** 12 px — compact list gaps */
  md: 12,
  /** 16 px — default padding / margin */
  base: 16,
  /** 20 px — card inner padding */
  lg: 20,
  /** 24 px — section separation */
  xl: 24,
  /** 32 px — group separation */
  '2xl': 32,
  /** 40 px — large section gaps */
  '3xl': 40,
  /** 48 px — page-level spacing */
  '4xl': 48,
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────

export type Spacing = typeof spacing;
export type SpacingKey = keyof Spacing;
