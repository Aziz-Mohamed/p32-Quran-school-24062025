import { Platform } from 'react-native';
import * as Location from 'expo-location';

// Lazy-load NetInfo to avoid crash when native module isn't linked yet.
// After rebuilding the dev client (`npx expo run:ios`), this will work normally.
let NetInfo: typeof import('@react-native-community/netinfo').default | null = null;

try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch {
  // Native module not available — WiFi features will gracefully degrade
}

class WifiService {
  private configured = false;

  /**
   * Configure NetInfo for SSID retrieval.
   * On iOS, `shouldFetchWiFiSSID: true` is required or SSID will always be null.
   * Location permission must also be granted first (iOS 13+ / Android).
   */
  private async ensureConfigured(): Promise<boolean> {
    if (!NetInfo) return false;

    // Request location permission — required by OS to access WiFi SSID
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return false;

    if (!this.configured) {
      NetInfo.configure({
        shouldFetchWiFiSSID: true,
      });
      this.configured = true;
    }

    return true;
  }

  /**
   * Get the currently connected WiFi SSID.
   * Returns null if not on WiFi, permission denied, SSID unavailable,
   * or if the native module isn't linked yet.
   */
  async getCurrentSSID(): Promise<string | null> {
    const ready = await this.ensureConfigured();
    if (!ready) return null;

    try {
      // refresh() forces a fresh read (avoids stale cache after permission grant)
      const state = await NetInfo!.refresh();
      if (state.type === 'wifi' && state.details?.ssid) {
        return state.details.ssid;
      }
    } catch {
      // NetInfo call failed — return null
    }
    return null;
  }

  /**
   * Whether the NetInfo native module is available.
   */
  isAvailable(): boolean {
    return NetInfo !== null;
  }

  /**
   * Check if the device is connected to the expected school WiFi.
   * Uses case-insensitive comparison.
   */
  isConnectedToSchoolWifi(
    currentSSID: string | null,
    expectedSSID: string,
  ): boolean {
    if (!currentSSID || !expectedSSID) return false;
    return currentSSID.trim().toLowerCase() === expectedSSID.trim().toLowerCase();
  }
}

export const wifiService = new WifiService();
