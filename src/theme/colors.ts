/**
 * Design System — Color Tokens
 *
 * Primary:   Deep Teal  (trust, education, Islamic aesthetic)
 * Secondary: Warm Gold  (achievement, reward)
 * Semantic:  success / warning / error / info
 * Gamification: gold / silver / bronze
 */

// ─── Shade Scales ────────────────────────────────────────────────────────────

export const primary = {
  50: '#F0FDFA',
  100: '#CCFBF1',
  200: '#99F6E4',
  300: '#5EEAD4',
  400: '#2DD4BF',
  500: '#0D9488',
  600: '#0F766E',
  700: '#115E59',
  800: '#134E4A',
  900: '#042F2E',
} as const;

export const secondary = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F5A623',
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
} as const;

export const neutral = {
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#E5E5E5',
  300: '#D4D4D4',
  400: '#A3A3A3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
} as const;

// ─── Semantic Colors ─────────────────────────────────────────────────────────

export const semantic = {
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

// ─── Gamification Colors ─────────────────────────────────────────────────────

export const gamification = {
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
} as const;

// ─── Palette Aggregate ───────────────────────────────────────────────────────

export const colors = {
  primary,
  secondary,
  neutral,
  semantic,
  gamification,

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// ─── Themed Surfaces ─────────────────────────────────────────────────────────

export const lightTheme = {
  background: '#FFFFFF',
  surface: '#FAFAFA',
  surfaceElevated: '#FFFFFF',
  text: neutral[900],
  textSecondary: neutral[600],
  textTertiary: neutral[400],
  border: neutral[200],
  borderFocused: primary[500],
  overlay: 'rgba(0, 0, 0, 0.5)',
  primary: primary[500],
  primaryText: '#FFFFFF',
  secondary: secondary[500],
  secondaryText: '#FFFFFF',
  ...semantic,
} as const;

/** Dark theme — stubbed for Phase 2 */
export const darkTheme = {
  background: neutral[900],
  surface: neutral[800],
  surfaceElevated: neutral[700],
  text: neutral[50],
  textSecondary: neutral[300],
  textTertiary: neutral[500],
  border: neutral[700],
  borderFocused: primary[400],
  overlay: 'rgba(0, 0, 0, 0.7)',
  primary: primary[400],
  primaryText: neutral[900],
  secondary: secondary[400],
  secondaryText: neutral[900],
  ...semantic,
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────

export type ShadeScale = typeof primary;
export type SemanticColors = typeof semantic;
export type GamificationColors = typeof gamification;
export type ThemeColors = typeof lightTheme;
