/**
 * Design System — Android Ripple Tokens
 *
 * Provides native Material Design ripple feedback for Pressable components on Android.
 * Returns undefined on iOS (Pressable ignores android_ripple on iOS).
 */
import { Platform, type PressableAndroidRippleConfig } from 'react-native';

// ─── Ripple Color Constants ─────────────────────────────────────────────────

/** White semi-transparent ripple for dark backgrounds */
const RIPPLE_LIGHT = 'rgba(255, 255, 255, 0.25)';

/** Dark semi-transparent ripple for light backgrounds */
const RIPPLE_DARK = 'rgba(0, 0, 0, 0.12)';

/** Primary-tinted ripple for white/neutral backgrounds */
const RIPPLE_PRIMARY = 'rgba(34, 197, 94, 0.15)';

// ─── Factory Functions ──────────────────────────────────────────────────────

/** Bounded ripple config for rectangular pressables. */
export function androidRipple(
  color: string = RIPPLE_DARK,
): PressableAndroidRippleConfig | undefined {
  if (Platform.OS !== 'android') return undefined;
  return { color, borderless: false };
}

/** Borderless (circular) ripple for icon buttons and small round targets. */
export function androidRippleBorderless(
  color: string = RIPPLE_DARK,
): PressableAndroidRippleConfig | undefined {
  if (Platform.OS !== 'android') return undefined;
  return { color, borderless: true };
}

// ─── Pre-built Configs ──────────────────────────────────────────────────────

export const rippleConfigs = {
  /** For dark-bg buttons: primary, glow, indigo, rose, violet, danger */
  light: androidRipple(RIPPLE_LIGHT),
  /** For light-bg surfaces: secondary, ghost, cards, list items */
  dark: androidRipple(RIPPLE_DARK),
  /** For white surfaces where a primary tint feels more intentional */
  primary: androidRipple(RIPPLE_PRIMARY),
  /** Borderless light for dark-bg icon buttons */
  iconLight: androidRippleBorderless(RIPPLE_LIGHT),
  /** Borderless dark for light-bg icon buttons */
  iconDark: androidRippleBorderless(RIPPLE_DARK),
} as const;
