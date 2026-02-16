import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Screen } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { LoadingState, ErrorState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useSchoolLocation } from '@/features/work-attendance/hooks/useGpsCheckin';
import { workAttendanceService } from '@/features/work-attendance/services/work-attendance.service';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

// ─── School Location Settings ────────────────────────────────────────────────

export default function SchoolLocationSettings() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { schoolId } = useAuth();

  const { data: location, isLoading, error, refetch } = useSchoolLocation(schoolId ?? undefined);

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('200');

  useEffect(() => {
    if (location) {
      setLatitude(location.latitude?.toString() ?? '');
      setLongitude(location.longitude?.toString() ?? '');
      setRadius(location.geofence_radius_meters?.toString() ?? '200');
    }
  }, [location]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!schoolId) throw new Error('No school');
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const rad = parseInt(radius, 10);

      if (isNaN(lat) || lat < -90 || lat > 90) {
        throw new Error(t('admin.location.invalidLatitude'));
      }
      if (isNaN(lng) || lng < -180 || lng > 180) {
        throw new Error(t('admin.location.invalidLongitude'));
      }
      if (isNaN(rad) || rad < 50 || rad > 2000) {
        throw new Error(t('admin.location.invalidRadius'));
      }

      const { error } = await workAttendanceService.updateSchoolLocation(schoolId, lat, lng, rad);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-location'] });
      Alert.alert(t('common.success'), t('admin.location.saved'));
    },
    onError: (err: Error) => {
      Alert.alert(t('common.error'), err.message);
    },
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;

  const hasLocation = !!location?.latitude && !!location?.longitude;

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Button
          title={t('common.back')}
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
        />

        <Text style={styles.title}>{t('admin.location.title')}</Text>
        <Text style={styles.description}>{t('admin.location.description')}</Text>

        {hasLocation && (
          <View style={styles.statusBanner}>
            <Text style={styles.statusText}>{t('admin.location.configured')}</Text>
          </View>
        )}

        {!hasLocation && (
          <View style={[styles.statusBanner, styles.statusWarning]}>
            <Text style={[styles.statusText, styles.statusWarningText]}>
              {t('admin.location.notConfigured')}
            </Text>
          </View>
        )}

        <TextField
          label={t('admin.location.latitude')}
          value={latitude}
          onChangeText={setLatitude}
          placeholder={t('admin.location.latitudePlaceholder')}
          keyboardType="numeric"
        />

        <TextField
          label={t('admin.location.longitude')}
          value={longitude}
          onChangeText={setLongitude}
          placeholder={t('admin.location.longitudePlaceholder')}
          keyboardType="numeric"
        />

        <TextField
          label={t('admin.location.geofenceRadius')}
          value={radius}
          onChangeText={setRadius}
          placeholder={t('admin.location.geofenceRadiusPlaceholder')}
          keyboardType="numeric"
        />
        <Text style={styles.hint}>{t('admin.location.geofenceHint')}</Text>

        <Button
          title={t('common.save')}
          onPress={() => updateMutation.mutate()}
          variant="primary"
          size="lg"
          loading={updateMutation.isPending}
          style={styles.submitButton}
        />
      </View>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
  },
  description: {
    ...typography.textStyles.body,
    color: lightTheme.textSecondary,
  },
  statusBanner: {
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: normalize(12),
  },
  statusWarning: {
    backgroundColor: colors.accent.rose[50],
  },
  statusText: {
    ...typography.textStyles.bodyMedium,
    color: colors.primary[700],
  },
  statusWarningText: {
    color: colors.accent.rose[700],
  },
  hint: {
    ...typography.textStyles.caption,
    color: colors.neutral[500],
    marginTop: -spacing.sm,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
