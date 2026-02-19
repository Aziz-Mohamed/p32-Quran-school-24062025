/**
 * Design System — Shadow Tokens
 *
 * Uses the boxShadow style prop (React Native 0.76+) for cross-platform
 * shadows that work identically on both iOS and Android without elevation.
 */
import { type ViewStyle } from 'react-native';

// ─── Presets ─────────────────────────────────────────────────────────────────

export const none: ViewStyle = {
  boxShadow: '0px 0px 0px rgba(0, 0, 0, 0)',
};

/** Very subtle lift for chips and flat buttons */
export const sm: ViewStyle = {
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.04)',
};

/** Standard card shadow — soft and floating */
export const md: ViewStyle = {
  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.08)',
};

/** Elevated cards and buttons — deep depth */
export const lg: ViewStyle = {
  boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.12)',
};

/** Modals and floating action buttons */
export const xl: ViewStyle = {
  boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.16)',
};

/** Special "Glow" shadow for primary actions */
export const glow: ViewStyle = {
  boxShadow: '0px 0px 12px rgba(34, 197, 94, 0.3)',
};

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
