/**
 * Design System — Color Tokens
 *
 * Primary:   Emerald/Teal (Growth, Quranic gardens, trust)
 * Secondary: Amber/Gold  (Achievement, reward, warmth)
 * Accents:   Indigo (Learning), Rose (Care), Violet (Spirituality)
 * Gamification: gold / silver / bronze / diamond
 */

// ─── Shade Scales ────────────────────────────────────────────────────────────

export const primary = {
  50: '#F0FDF4',
  100: '#DCFCE7',
  200: '#BBF7D0',
  300: '#86EFAC',
  400: '#4ADE80',
  500: '#22C55E', // Vibrant Green
  600: '#16A34A',
  700: '#15803D',
  800: '#166534',
  900: '#14532D',
} as const;

export const secondary = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B', // Amber/Gold
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
} as const;

export const accent = {
  indigo: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
  },
  rose: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    500: '#F43F5E',
    600: '#E11D48',
    700: '#BE123C',
  },
  violet: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
  },
  sky: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
  }
} as const;

export const neutral = {
  50: '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
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
  diamond: '#B9E2F5',
  platinum: '#E5E4E2',
} as const;

// ─── Transparency / Glass ───────────────────────────────────────────────────

export const glass = {
  white: {
    low: 'rgba(255, 255, 255, 0.4)',
    medium: 'rgba(255, 255, 255, 0.6)',
    high: 'rgba(255, 255, 255, 0.8)',
  },
  black: {
    low: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    high: 'rgba(0, 0, 0, 0.2)',
  }
} as const;

// ─── Gradients (Linear equivalents for native) ──────────────────────────────

export const gradients = {
  primary: [primary[400], primary[600]],
  secondary: [secondary[400], secondary[600]],
  indigo: [accent.indigo[400] ?? accent.indigo[500], accent.indigo[600]],
  rose: [accent.rose[400] ?? accent.rose[500], accent.rose[600]],
  violet: [accent.violet[400] ?? accent.violet[500], accent.violet[600]],
  sky: [accent.sky[400] ?? accent.sky[500], accent.sky[600]],
} as const;

// ─── Palette Aggregate ───────────────────────────────────────────────────────

export const colors = {
  primary,
  secondary,
  accent,
  neutral,
  semantic,
  gamification,
  glass,
  gradients,

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// ─── Themed Surfaces ─────────────────────────────────────────────────────────

export const lightTheme = {
  background: '#F9FAFB',
  surface: '#FFFFFF',
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

/** Dark theme — High Contrast Premium */
export const darkTheme = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceElevated: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  border: '#334155',
  borderFocused: primary[400],
  overlay: 'rgba(0, 0, 0, 0.7)',
  primary: primary[400],
  primaryText: '#0F172A',
  secondary: secondary[400],
  secondaryText: '#0F172A',
  ...semantic,
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────

export type ShadeScale = typeof primary;
export type SemanticColors = typeof semantic;
export type GamificationColors = typeof gamification;
export type ThemeColors = typeof lightTheme;
