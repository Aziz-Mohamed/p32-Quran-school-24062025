/**
 * Design System — Shadow Tokens
 *
 * Updated for a soft "premium" look with larger blur radii and lower opacity.
 */
import { Platform, type ViewStyle } from 'react-native';

// ─── Shadow Definitions ──────────────────────────────────────────────────────

interface ShadowPreset {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

const defineShadow = (preset: ShadowPreset): ViewStyle =>
  Platform.select({
    ios: {
      shadowColor: preset.shadowColor,
      shadowOffset: preset.shadowOffset,
      shadowOpacity: preset.shadowOpacity,
      shadowRadius: preset.shadowRadius,
    },
    android: {
      elevation: preset.elevation,
    },
    default: {
      elevation: preset.elevation,
    },
  });

// ─── Presets ─────────────────────────────────────────────────────────────────

export const none = defineShadow({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
});

/** Very subtle lift for chips and flat buttons */
export const sm = defineShadow({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.04,
  shadowRadius: 4,
  elevation: 2,
});

/** Standard card shadow — soft and floating */
export const md = defineShadow({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 4,
});

/** Elevated cards and buttons — deep depth */
export const lg = defineShadow({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.12,
  shadowRadius: 16,
  elevation: 8,
});

/** Modals and floating action buttons */
export const xl = defineShadow({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.16,
  shadowRadius: 24,
  elevation: 16,
});

/** Special "Glow" shadow for primary actions */
export const glow = defineShadow({
  shadowColor: '#22C55E', // primary[500]
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.3,
  shadowRadius: 12,
  elevation: 6,
});

// ─── Aggregate Export ────────────────────────────────────────────────────────

export const shadows = {
  none,
  sm,
  md,
  lg,
  xl,
  glow,
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────

export type Shadows = typeof shadows;
export type ShadowKey = keyof Shadows;
