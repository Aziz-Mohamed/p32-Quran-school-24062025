import { determineVerification } from './verification';

describe('determineVerification', () => {
  // ─── GPS-only mode ──────────────────────────────────────────────────────

  describe('mode: gps', () => {
    it('verifies when GPS passes', () => {
      const result = determineVerification('gps', 'and', { isWithinGeofence: true }, null);
      expect(result.isVerified).toBe(true);
      expect(result.method).toBe('gps');
    });

    it('rejects when GPS fails', () => {
      const result = determineVerification('gps', 'and', { isWithinGeofence: false }, null);
      expect(result.isVerified).toBe(false);
      expect(result.method).toBe('none');
    });

    it('rejects when GPS result is null', () => {
      const result = determineVerification('gps', 'and', null, null);
      expect(result.isVerified).toBe(false);
      expect(result.method).toBe('none');
    });
  });

  // ─── WiFi-only mode ─────────────────────────────────────────────────────

  describe('mode: wifi', () => {
    it('verifies when WiFi passes', () => {
      const result = determineVerification('wifi', 'and', null, { isOnSchoolWifi: true });
      expect(result.isVerified).toBe(true);
      expect(result.method).toBe('wifi');
    });

    it('rejects when WiFi fails', () => {
      const result = determineVerification('wifi', 'and', null, { isOnSchoolWifi: false });
      expect(result.isVerified).toBe(false);
      expect(result.method).toBe('none');
    });

    it('rejects when WiFi result is null', () => {
      const result = determineVerification('wifi', 'and', null, null);
      expect(result.isVerified).toBe(false);
      expect(result.method).toBe('none');
    });
  });

  // ─── Both mode with AND logic ───────────────────────────────────────────

  describe('mode: both, logic: and', () => {
    it('verifies when both pass', () => {
      const result = determineVerification(
        'both', 'and',
        { isWithinGeofence: true },
        { isOnSchoolWifi: true },
      );
      expect(result.isVerified).toBe(true);
      expect(result.method).toBe('both');
    });

    it('rejects when only GPS passes', () => {
      const result = determineVerification(
        'both', 'and',
        { isWithinGeofence: true },
        { isOnSchoolWifi: false },
      );
      expect(result.isVerified).toBe(false);
      expect(result.method).toBe('none');
    });

    it('rejects when only WiFi passes', () => {
      const result = determineVerification(
        'both', 'and',
        { isWithinGeofence: false },
        { isOnSchoolWifi: true },
      );
      expect(result.isVerified).toBe(false);
      expect(result.method).toBe('none');
    });

    it('rejects when both fail', () => {
      const result = determineVerification(
        'both', 'and',
        { isWithinGeofence: false },
        { isOnSchoolWifi: false },
      );
      expect(result.isVerified).toBe(false);
      expect(result.method).toBe('none');
    });
  });

  // ─── Both mode with OR logic ────────────────────────────────────────────

  describe('mode: both, logic: or', () => {
    it('verifies with method "both" when both pass', () => {
      const result = determineVerification(
        'both', 'or',
        { isWithinGeofence: true },
        { isOnSchoolWifi: true },
      );
      expect(result.isVerified).toBe(true);
      expect(result.method).toBe('both');
    });

    it('verifies with method "gps" when only GPS passes', () => {
      const result = determineVerification(
        'both', 'or',
        { isWithinGeofence: true },
        { isOnSchoolWifi: false },
      );
      expect(result.isVerified).toBe(true);
      expect(result.method).toBe('gps');
    });

    it('verifies with method "wifi" when only WiFi passes', () => {
      const result = determineVerification(
        'both', 'or',
        { isWithinGeofence: false },
        { isOnSchoolWifi: true },
      );
      expect(result.isVerified).toBe(true);
      expect(result.method).toBe('wifi');
    });

    it('rejects when both fail', () => {
      const result = determineVerification(
        'both', 'or',
        { isWithinGeofence: false },
        { isOnSchoolWifi: false },
      );
      expect(result.isVerified).toBe(false);
      expect(result.method).toBe('none');
    });

    it('handles null results as failures', () => {
      const result = determineVerification('both', 'or', null, null);
      expect(result.isVerified).toBe(false);
      expect(result.method).toBe('none');
    });
  });
});
