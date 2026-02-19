import type {
  VerificationMode,
  VerificationLogic,
  VerificationMethod,
} from '../types/work-attendance.types';

interface GpsResult {
  isWithinGeofence: boolean;
}

interface WifiResult {
  isOnSchoolWifi: boolean;
}

interface VerificationOutcome {
  isVerified: boolean;
  method: VerificationMethod;
}

/**
 * Determine verification outcome based on admin-configured mode/logic
 * and the results of GPS and WiFi checks.
 */
export function determineVerification(
  mode: VerificationMode,
  logic: VerificationLogic,
  gpsResult: GpsResult | null,
  wifiResult: WifiResult | null,
): VerificationOutcome {
  const gpsPass = gpsResult?.isWithinGeofence ?? false;
  const wifiPass = wifiResult?.isOnSchoolWifi ?? false;

  switch (mode) {
    case 'gps':
      return { isVerified: gpsPass, method: gpsPass ? 'gps' : 'none' };

    case 'wifi':
      return { isVerified: wifiPass, method: wifiPass ? 'wifi' : 'none' };

    case 'both': {
      if (logic === 'and') {
        const verified = gpsPass && wifiPass;
        return { isVerified: verified, method: verified ? 'both' : 'none' };
      }
      // logic === 'or'
      if (gpsPass && wifiPass) return { isVerified: true, method: 'both' };
      if (gpsPass) return { isVerified: true, method: 'gps' };
      if (wifiPass) return { isVerified: true, method: 'wifi' };
      return { isVerified: false, method: 'none' };
    }
  }
}
