/**
 * Design System — Shadow Tokens
 *
 * iOS uses native shadowColor/shadowOffset/shadowOpacity/shadowRadius.
 * Android ignores those properties, so we use a subtle border to
 * simulate depth without elevation (which causes inner-shadow artifacts
 * when combined with overflow: 'hidden').
 */
import { Platform, type ViewStyle } from 'react-native';

// ─── Shadow Definitions ──────────────────────────────────────────────────────

interface ShadowPreset {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  /** Border opacity used on Android to simulate depth (0 = no border) */
  androidBorderOpacity: number;
}

const defineShadow = (preset: ShadowPreset): ViewStyle =>
  Platform.OS === 'android'
    ? preset.androidBorderOpacity > 0
      ? {
          borderWidth: 1,
          borderColor: `rgba(0, 0, 0, ${preset.androidBorderOpacity})`,
        }
      : {}
    : {
        shadowColor: preset.shadowColor,
        shadowOffset: preset.shadowOffset,
        shadowOpacity: preset.shadowOpacity,
        shadowRadius: preset.shadowRadius,
      };

// ─── Presets ─────────────────────────────────────────────────────────────────

export const none = defineShadow({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
  androidBorderOpacity: 0,
});

/** Very subtle lift for chips and flat buttons */
export const sm = defineShadow({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.04,
  shadowRadius: 4,
  androidBorderOpacity: 0.06,
});

/** Standard card shadow — soft and floating */
export const md = defineShadow({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  androidBorderOpacity: 0.08,
});

/** Elevated cards and buttons — deep depth */
export const lg = defineShadow({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.12,
  shadowRadius: 16,
  androidBorderOpacity: 0.1,
});

/** Modals and floating action buttons */
export const xl = defineShadow({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.16,
  shadowRadius: 24,
  androidBorderOpacity: 0.12,
});

/** Special "Glow" shadow for primary actions */
export const glow = defineShadow({
  shadowColor: '#22C55E', // primary[500]
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.3,
  shadowRadius: 12,
  androidBorderOpacity: 0.08,
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
