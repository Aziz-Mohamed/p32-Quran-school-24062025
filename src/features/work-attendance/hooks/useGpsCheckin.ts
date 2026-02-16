import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mutationTracker } from '@/features/realtime';
import { locationService } from '../services/location.service';
import { workAttendanceService } from '../services/work-attendance.service';
import type { GpsCoords, SchoolLocation } from '../types/work-attendance.types';

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
 * Hook for fetching school location settings.
 */
export function useSchoolLocation(schoolId: string | undefined) {
  return useQuery({
    queryKey: ['school-location', schoolId],
    queryFn: async () => {
      const { data, error } = await workAttendanceService.getSchoolLocation(schoolId!);
      if (error) throw error;
      return data as SchoolLocation | null;
    },
    enabled: !!schoolId,
  });
}

/**
 * GPS check-in flow:
 * 1. Request location permission
 * 2. Get GPS coordinates
 * 3. Compute distance from school
 * 4. Check-in with GPS data
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
      schoolLocation: SchoolLocation;
    }) => {
      setLocationError(null);

      // Request permission
      const hasPermission = await locationService.requestPermission();
      if (!hasPermission) {
        throw new Error('LOCATION_PERMISSION_DENIED');
      }

      // Get current position
      const coords = await locationService.getCurrentPosition();

      // Compute distance
      const distanceMeters = locationService.getDistanceFromSchool(coords, schoolLocation);
      const isWithinGeofence = locationService.isWithinGeofence(coords, schoolLocation);

      // Perform check-in
      const { data, error } = await workAttendanceService.gpsCheckIn({
        teacherId,
        schoolId,
        coords,
        distanceMeters,
        isWithinGeofence,
      });

      if (error) throw error;

      return { data, isWithinGeofence, distanceMeters, coords };
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
      } else {
        setLocationError(error.message);
      }
    },
  });

  return { ...mutation, locationError };
}

/**
 * GPS check-out flow.
 */
export function useGpsCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      checkinId,
      schoolLocation,
    }: {
      checkinId: string;
      schoolLocation: SchoolLocation;
    }) => {
      const hasPermission = await locationService.requestPermission();
      if (!hasPermission) {
        throw new Error('LOCATION_PERMISSION_DENIED');
      }

      const coords = await locationService.getCurrentPosition();
      const distanceMeters = locationService.getDistanceFromSchool(coords, schoolLocation);

      const { data, error } = await workAttendanceService.gpsCheckOut({
        checkinId,
        coords,
        distanceMeters,
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
 * Request manual override for a check-in that was outside geofence.
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
