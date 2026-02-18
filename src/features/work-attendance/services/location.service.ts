import * as Location from 'expo-location';
import type { GpsCoords, SchoolLocation } from '../types/work-attendance.types';

class LocationService {
  /**
   * Request foreground location permission.
   * Returns true if granted, false otherwise.
   */
  async requestPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Check if foreground location permission is already granted.
   */
  async hasPermission(): Promise<boolean> {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Get the current GPS position.
   * Uses balanced accuracy (good enough for geofencing, not draining battery).
   */
  async getCurrentPosition(): Promise<GpsCoords> {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  }

  /**
   * Compute distance between two GPS coordinates using the Haversine formula.
   * Returns distance in meters.
   */
  computeDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Check if a position is within the school's geofence.
   */
  isWithinGeofence(userCoords: GpsCoords, school: SchoolLocation): boolean {
    const distance = this.computeDistance(
      userCoords.latitude,
      userCoords.longitude,
      school.latitude,
      school.longitude,
    );
    return distance <= school.geofence_radius_meters;
  }

  /**
   * Get distance from school in meters.
   */
  getDistanceFromSchool(userCoords: GpsCoords, school: SchoolLocation): number {
    return this.computeDistance(
      userCoords.latitude,
      userCoords.longitude,
      school.latitude,
      school.longitude,
    );
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}

export const locationService = new LocationService();
