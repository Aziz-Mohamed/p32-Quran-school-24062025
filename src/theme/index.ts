/**
 * Design System — Barrel Export
 *
 * Usage:
 *   import { theme } from '@/theme';
 *   // or cherry-pick:
 *   import { colors, lightTheme } from '@/theme/colors';
 */

export {
  colors,
  primary,
  secondary,
  neutral,
  semantic,
  gamification,
  lightTheme,
  darkTheme,
} from './colors';

export type { ShadeScale, SemanticColors, GamificationColors, ThemeColors } from './colors';

export {
  typography,
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
  textStyles,
} from './typography';

export type { FontFamily, FontSize, FontSizeKey, TextStyle } from './typography';

export { spacing } from './spacing';
export type { Spacing, SpacingKey } from './spacing';

export { radius } from './radius';
export type { Radius, RadiusKey } from './radius';

export { shadows } from './shadows';
export type { Shadows, ShadowKey } from './shadows';

// ─── Unified Theme Object ────────────────────────────────────────────────────

import { colors, lightTheme, darkTheme } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';

export const theme = {
  colors,
  lightTheme,
  darkTheme,
  typography,
  spacing,
  radius,
  shadows,
} as const;

export type Theme = typeof theme;
