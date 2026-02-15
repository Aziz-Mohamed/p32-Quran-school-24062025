/**
 * Design System — Spacing Tokens
 *
 * Based on a 4 px grid. Every value is a multiple of 4.
 * All values are run through normalize() for cross-platform consistency.
 */
import { normalize } from './normalize';

export const spacing = {
  /** 4 px — hairline gaps, icon padding */
  xs: normalize(4),
  /** 8 px — tight element spacing */
  sm: normalize(8),
  /** 12 px — compact list gaps */
  md: normalize(12),
  /** 16 px — default padding / margin */
  base: normalize(16),
  /** 20 px — card inner padding */
  lg: normalize(20),
  /** 24 px — section separation */
  xl: normalize(24),
  /** 32 px — group separation */
  '2xl': normalize(32),
  /** 40 px — large section gaps */
  '3xl': normalize(40),
  /** 48 px — page-level spacing */
  '4xl': normalize(48),
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type Spacing = typeof spacing;
export type SpacingKey = keyof Spacing;
