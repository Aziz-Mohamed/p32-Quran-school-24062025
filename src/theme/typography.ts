/**
 * Design System — Typography Tokens
 *
 * Latin text : Inter (Regular / Medium / SemiBold / Bold)
 * Arabic text: Noto Sans Arabic (Regular / Bold)
 */

// ─── Font Families ───────────────────────────────────────────────────────────

export const fontFamily = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  arabic: 'NotoSansArabic-Regular',
  arabicBold: 'NotoSansArabic-Bold',
} as const;

// ─── Font Sizes ──────────────────────────────────────────────────────────────

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 30,
  '3xl': 36,
} as const;

// ─── Line Heights ────────────────────────────────────────────────────────────
// Roughly 1.5× the font size, rounded to the nearest even integer.

export const lineHeight = {
  xs: 16,
  sm: 18,
  base: 22,
  md: 24,
  lg: 28,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

// ─── Font Weights (numeric for RN) ──────────────────────────────────────────

export const fontWeight = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
} as const;

// ─── Letter Spacing ──────────────────────────────────────────────────────────

export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
} as const;

// ─── Pre‑composed Text Styles ────────────────────────────────────────────────
// Convenience objects that can be spread directly into a RN <Text> style.

export const textStyles = {
  /** Page / section heading */
  heading: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    letterSpacing: letterSpacing.tight,
  },

  /** Card / modal heading */
  subheading: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    letterSpacing: letterSpacing.normal,
  },

  /** Default body copy */
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    letterSpacing: letterSpacing.normal,
  },

  /** Emphasized body copy */
  bodyMedium: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    letterSpacing: letterSpacing.normal,
  },

  /** Smaller helper / secondary text */
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    letterSpacing: letterSpacing.normal,
  },

  /** Very small labels (badges, tags) */
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    letterSpacing: letterSpacing.wide,
  },

  /** Arabic Quran text */
  arabic: {
    fontFamily: fontFamily.arabic,
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
    letterSpacing: letterSpacing.normal,
  },

  /** Arabic bold (surah names, etc.) */
  arabicBold: {
    fontFamily: fontFamily.arabicBold,
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
    letterSpacing: letterSpacing.normal,
  },
} as const;

// ─── Aggregate Export ────────────────────────────────────────────────────────

export const typography = {
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
  textStyles,
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────

export type FontFamily = typeof fontFamily;
export type FontSize = typeof fontSize;
export type FontSizeKey = keyof FontSize;
export type TextStyle = keyof typeof textStyles;
