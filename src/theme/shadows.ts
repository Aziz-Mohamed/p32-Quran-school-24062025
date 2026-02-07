/**
 * Design System — Shadow Tokens
 *
 * React Native shadows differ by platform:
 *   iOS   → shadowColor / shadowOffset / shadowOpacity / shadowRadius
 *   Android → elevation (Material shadow)
 *
 * Each preset exposes both so consumers can spread directly into styles.
 */
import { Platform, type ViewStyle } from 'react-native';

// ─── Shadow Definitions ──────────────────────────────────────────────────────

interface ShadowPreset {
  /** iOS shadow properties */
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  /** Android elevation */
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

/** No shadow — useful for resetting */
export const none = defineShadow({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
});

/** Subtle lift for list items and inputs */
export const sm = defineShadow({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
});

/** Default card shadow */
export const md = defineShadow({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
});

/** Elevated cards, active/pressed states */
export const lg = defineShadow({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 6,
});

/** Modals, floating action buttons */
export const xl = defineShadow({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.2,
  shadowRadius: 16,
  elevation: 12,
});

// ─── Aggregate Export ────────────────────────────────────────────────────────

export const shadows = {
  none,
  sm,
  md,
  lg,
  xl,
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────

export type Shadows = typeof shadows;
export type ShadowKey = keyof Shadows;
