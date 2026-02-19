import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mutationTracker } from '@/features/realtime';
import { locationService } from '../services/location.service';
import { wifiService } from '../services/wifi.service';
import { workAttendanceService } from '../services/work-attendance.service';
import { determineVerification } from '../utils/verification';
import type { SchoolVerificationSettings } from '../types/work-attendance.types';

/**
 * Hook for fetching today's check-in for a teacher.
 */
export function useTodayCheckin(teacherId: string | undefined) {
  const today = new Date().toISOString().split('T')[0];
  return useQuery({
    queryKey: ['teacher-checkin', teacherId, today],
    queryFn: async () => {
      const { data, error } = await workAttendanceService.getTodayCheckin(teacherId!);
      if (error) throw error;
      return data;
    },
    enabled: !!teacherId,
  });
}

/**
 * Hook for fetching school verification settings.
 */
export function useSchoolLocation(schoolId: string | undefined) {
  return useQuery({
    queryKey: ['school-location', schoolId],
    queryFn: async () => {
      const { data, error } = await workAttendanceService.getSchoolLocation(schoolId!);
      if (error) throw error;
      return data as SchoolVerificationSettings | null;
    },
    enabled: !!schoolId,
  });
}

/**
 * Check-in flow supporting GPS, WiFi, or both verification methods.
 */
export function useGpsCheckIn() {
  const queryClient = useQueryClient();
  const [locationError, setLocationError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      teacherId,
      schoolId,
      schoolLocation,
    }: {
      teacherId: string;
      schoolId: string;
      schoolLocation: SchoolVerificationSettings;
    }) => {
      setLocationError(null);

      const mode = schoolLocation.verification_mode;
      const logic = schoolLocation.verification_logic;
      const needsGps = mode === 'gps' || mode === 'both';
      const needsWifi = mode === 'wifi' || mode === 'both';

      // ── GPS check ──
      let gpsResult: { isWithinGeofence: boolean } | null = null;
      let coords: { latitude: number; longitude: number } | null = null;
      let distanceMeters: number | null = null;

      if (needsGps) {
        if (!schoolLocation.latitude || !schoolLocation.longitude) {
          // GPS not configured — treat as always passing
          gpsResult = { isWithinGeofence: true };
        } else {
          const hasPermission = await locationService.requestPermission();
          if (!hasPermission) {
            throw new Error('LOCATION_PERMISSION_DENIED');
          }
          coords = await locationService.getCurrentPosition();
          distanceMeters = locationService.getDistanceFromSchool(coords, {
            latitude: schoolLocation.latitude,
            longitude: schoolLocation.longitude,
            geofence_radius_meters: schoolLocation.geofence_radius_meters,
          });
          gpsResult = {
            isWithinGeofence: locationService.isWithinGeofence(coords, {
              latitude: schoolLocation.latitude,
              longitude: schoolLocation.longitude,
              geofence_radius_meters: schoolLocation.geofence_radius_meters,
            }),
          };
        }
      }

      // ── WiFi check ──
      let wifiResult: { isOnSchoolWifi: boolean } | null = null;
      let currentSSID: string | null = null;

      if (needsWifi) {
        if (!schoolLocation.wifi_ssid) {
          // WiFi not configured — treat as always passing
          wifiResult = { isOnSchoolWifi: true };
        } else {
          currentSSID = await wifiService.getCurrentSSID();
          if (currentSSID === null) {
            // Can't detect WiFi — only fail if WiFi is strictly required
            if (mode === 'wifi' || (mode === 'both' && logic === 'and')) {
              throw new Error('WIFI_SSID_UNAVAILABLE');
            }
            wifiResult = { isOnSchoolWifi: false };
          } else {
            wifiResult = {
              isOnSchoolWifi: wifiService.isConnectedToSchoolWifi(
                currentSSID,
                schoolLocation.wifi_ssid,
              ),
            };
          }
        }
      }

      // ── Determine verification ──
      const { isVerified, method } = determineVerification(
        mode,
        logic,
        gpsResult,
        wifiResult,
      );

      // ── Perform check-in ──
      const { data, error } = await workAttendanceService.checkIn({
        teacherId,
        schoolId,
        coords,
        distanceMeters,
        wifiSSID: currentSSID,
        verificationMethod: method,
        isVerified,
      });

      if (error) throw error;

      return { data, isVerified, distanceMeters, coords, currentSSID };
    },
    onSuccess: (result) => {
      if (result.data?.id) {
        mutationTracker.record('teacher_checkins', result.data.id);
      }
      queryClient.invalidateQueries({ queryKey: ['teacher-checkin'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-attendance-today'] });
    },
    onError: (error: Error) => {
      if (error.message === 'LOCATION_PERMISSION_DENIED') {
        setLocationError('location_permission_denied');
      } else if (error.message === 'WIFI_SSID_UNAVAILABLE') {
        setLocationError('wifi_ssid_unavailable');
      } else {
        setLocationError(error.message);
      }
    },
  });

  return { ...mutation, locationError };
}

/**
 * Check-out flow with GPS and/or WiFi data.
 */
export function useGpsCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      checkinId,
      schoolLocation,
    }: {
      checkinId: string;
      schoolLocation: SchoolVerificationSettings;
    }) => {
      let coords: { latitude: number; longitude: number } | null = null;
      let distanceMeters: number | null = null;
      let currentSSID: string | null = null;

      const mode = schoolLocation.verification_mode;

      // Get GPS if applicable
      if (mode === 'gps' || mode === 'both') {
        const hasPermission = await locationService.requestPermission();
        if (hasPermission) {
          coords = await locationService.getCurrentPosition();
          if (schoolLocation.latitude && schoolLocation.longitude) {
            distanceMeters = locationService.getDistanceFromSchool(coords, {
              latitude: schoolLocation.latitude,
              longitude: schoolLocation.longitude,
              geofence_radius_meters: schoolLocation.geofence_radius_meters,
            });
          }
        }
      }

      // Get WiFi if applicable
      if (mode === 'wifi' || mode === 'both') {
        currentSSID = await wifiService.getCurrentSSID();
      }

      const { data, error } = await workAttendanceService.checkOut({
        checkinId,
        coords,
        distanceMeters,
        wifiSSID: currentSSID,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      mutationTracker.record('teacher_checkins', variables.checkinId);
      queryClient.invalidateQueries({ queryKey: ['teacher-checkin'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-attendance-today'] });
    },
  });
}

/**
 * Request manual override for a check-in that failed verification.
 */
export function useRequestOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ checkinId, reason }: { checkinId: string; reason: string }) => {
      const { data, error } = await workAttendanceService.requestOverride(checkinId, reason);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.id) {
        mutationTracker.record('teacher_checkins', data.id);
      }
      queryClient.invalidateQueries({ queryKey: ['teacher-checkin'] });
      queryClient.invalidateQueries({ queryKey: ['override-requests'] });
    },
  });
}
