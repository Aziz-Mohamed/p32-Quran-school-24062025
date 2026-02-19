import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { LoadingState, ErrorState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useSchoolLocation } from '@/features/work-attendance/hooks/useGpsCheckin';
import { workAttendanceService } from '@/features/work-attendance/services/work-attendance.service';
import { locationService } from '@/features/work-attendance/services/location.service';
import { wifiService } from '@/features/work-attendance/services/wifi.service';
import type { VerificationMode, VerificationLogic } from '@/features/work-attendance/types/work-attendance.types';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';
import { radius } from '@/theme/radius';

// ─── Verification Settings ──────────────────────────────────────────────────

export default function VerificationSettings() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { schoolId } = useAuth();

  const { data: location, isLoading, error, refetch } = useSchoolLocation(schoolId ?? undefined);

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius_, setRadius] = useState('200');
  const [wifiSsid, setWifiSsid] = useState('');
  const [mode, setMode] = useState<VerificationMode>('gps');
  const [logic, setLogic] = useState<VerificationLogic>('or');

  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [fetchingWifi, setFetchingWifi] = useState(false);

  useEffect(() => {
    if (location) {
      setLatitude(location.latitude?.toString() ?? '');
      setLongitude(location.longitude?.toString() ?? '');
      setRadius(location.geofence_radius_meters?.toString() ?? '200');
      setWifiSsid(location.wifi_ssid ?? '');
      setMode((location.verification_mode as VerificationMode) ?? 'gps');
      setLogic((location.verification_logic as VerificationLogic) ?? 'or');
    }
  }, [location]);

  // ─── Use Current Location ──────────────────────────────────────────────────

  const handleUseCurrentLocation = async () => {
    setFetchingLocation(true);
    try {
      const hasPermission = await locationService.requestPermission();
      if (!hasPermission) {
        Alert.alert(t('common.error'), t('admin.location.locationPermissionNeeded'));
        return;
      }
      const coords = await locationService.getCurrentPosition();
      setLatitude(coords.latitude.toFixed(6));
      setLongitude(coords.longitude.toFixed(6));
    } catch {
      Alert.alert(t('common.error'), t('admin.location.locationFetchFailed'));
    } finally {
      setFetchingLocation(false);
    }
  };

  // ─── Use Current WiFi ──────────────────────────────────────────────────────

  const handleUseCurrentWifi = async () => {
    setFetchingWifi(true);
    try {
      const ssid = await wifiService.getCurrentSSID();
      if (ssid) {
        setWifiSsid(ssid);
      } else {
        Alert.alert(t('common.error'), t('admin.location.wifiFetchFailed'));
      }
    } catch {
      Alert.alert(t('common.error'), t('admin.location.wifiFetchFailed'));
    } finally {
      setFetchingWifi(false);
    }
  };

  // ─── Save ──────────────────────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!schoolId) throw new Error('No school');

      const needsGps = mode === 'gps' || mode === 'both';
      const needsWifi = mode === 'wifi' || mode === 'both';

      let lat: number | null = null;
      let lng: number | null = null;
      const rad = parseInt(radius_, 10);

      if (needsGps) {
        if (!latitude.trim() || !longitude.trim()) {
          throw new Error(t('admin.location.gpsRequired'));
        }
        lat = parseFloat(latitude);
        lng = parseFloat(longitude);
        if (isNaN(lat) || lat < -90 || lat > 90) {
          throw new Error(t('admin.location.invalidLatitude'));
        }
        if (isNaN(lng) || lng < -180 || lng > 180) {
          throw new Error(t('admin.location.invalidLongitude'));
        }
      } else if (latitude.trim() && longitude.trim()) {
        // Preserve GPS coords even if mode is WiFi-only
        lat = parseFloat(latitude);
        lng = parseFloat(longitude);
      }

      if (isNaN(rad) || rad < 50 || rad > 2000) {
        throw new Error(t('admin.location.invalidRadius'));
      }

      if (needsWifi && !wifiSsid.trim()) {
        throw new Error(t('admin.location.wifiRequired'));
      }

      const { error } = await workAttendanceService.updateVerificationSettings(schoolId, {
        latitude: lat,
        longitude: lng,
        geofence_radius_meters: rad,
        wifi_ssid: wifiSsid.trim() || null,
        verification_mode: mode,
        verification_logic: logic,
      });
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

  const hasGps = !!latitude.trim() && !!longitude.trim();
  const hasWifi = !!wifiSsid.trim();
  const isConfigured =
    (mode === 'gps' && hasGps) ||
    (mode === 'wifi' && hasWifi) ||
    (mode === 'both' && hasGps && hasWifi);

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

        {/* Status Banner */}
        {isConfigured ? (
          <View style={styles.statusBanner}>
            <Text style={styles.statusText}>{t('admin.location.configured')}</Text>
          </View>
        ) : (
          <View style={[styles.statusBanner, styles.statusWarning]}>
            <Text style={[styles.statusText, styles.statusWarningText]}>
              {t('admin.location.notConfigured')}
            </Text>
          </View>
        )}

        {/* ── Verification Method ── */}
        <Text style={styles.sectionTitle}>{t('admin.location.verificationMethod')}</Text>
        <View style={styles.pillRow}>
          {(['gps', 'wifi', 'both'] as const).map((m) => (
            <Pressable
              key={m}
              style={[styles.pill, mode === m && styles.pillActive]}
              onPress={() => setMode(m)}
              accessibilityRole="radio"
              accessibilityState={{ selected: mode === m }}
            >
              <Ionicons
                name={m === 'gps' ? 'navigate' : m === 'wifi' ? 'wifi' : 'shield-checkmark'}
                size={16}
                color={mode === m ? colors.white : colors.neutral[600]}
              />
              <Text style={[styles.pillText, mode === m && styles.pillTextActive]}>
                {t(`admin.location.${m === 'gps' ? 'gpsOnly' : m === 'wifi' ? 'wifiOnly' : 'both'}`)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* AND / OR selector (only when mode is 'both') */}
        {mode === 'both' && (
          <>
            <View style={styles.logicRow}>
              {(['and', 'or'] as const).map((l) => (
                <Pressable
                  key={l}
                  style={[styles.logicPill, logic === l && styles.logicPillActive]}
                  onPress={() => setLogic(l)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: logic === l }}
                >
                  <Text style={[styles.logicPillText, logic === l && styles.logicPillTextActive]}>
                    {t(`admin.location.${l === 'and' ? 'requireBoth' : 'eitherOne'}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.hint}>{t('admin.location.bothLogicHint')}</Text>
          </>
        )}

        {/* ── GPS Settings ── */}
        {(mode === 'gps' || mode === 'both') && (
          <>
            <Text style={styles.sectionTitle}>{t('admin.location.gpsSection')}</Text>

            <Button
              title={fetchingLocation ? t('admin.location.locationFetching') : t('admin.location.useCurrentLocation')}
              onPress={handleUseCurrentLocation}
              variant="secondary"
              size="sm"
              loading={fetchingLocation}
              icon={<Ionicons name="navigate" size={18} color={colors.primary[600]} />}
              style={styles.detectButton}
            />

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
              value={radius_}
              onChangeText={setRadius}
              placeholder={t('admin.location.geofenceRadiusPlaceholder')}
              keyboardType="numeric"
            />
            <Text style={styles.hint}>{t('admin.location.geofenceHint')}</Text>
          </>
        )}

        {/* ── WiFi Settings ── */}
        {(mode === 'wifi' || mode === 'both') && (
          <>
            <Text style={styles.sectionTitle}>{t('admin.location.wifiSection')}</Text>

            <Button
              title={fetchingWifi ? t('admin.location.wifiFetching') : t('admin.location.useCurrentWifi')}
              onPress={handleUseCurrentWifi}
              variant="secondary"
              size="sm"
              loading={fetchingWifi}
              icon={<Ionicons name="wifi" size={18} color={colors.primary[600]} />}
              style={styles.detectButton}
            />

            <TextField
              label={t('admin.location.wifiSsid')}
              value={wifiSsid}
              onChangeText={setWifiSsid}
              placeholder={t('admin.location.wifiSsidPlaceholder')}
            />
            <Text style={styles.hint}>{t('admin.location.wifiSsidHint')}</Text>
          </>
        )}

        {/* ── Save ── */}
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
  sectionTitle: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
    marginTop: spacing.sm,
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
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
  },
  pillActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  pillText: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[600],
  },
  pillTextActive: {
    color: colors.white,
  },
  logicRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  logicPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[50],
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
  },
  logicPillActive: {
    backgroundColor: colors.accent.indigo[50],
    borderColor: colors.accent.indigo[500],
  },
  logicPillText: {
    ...typography.textStyles.label,
    color: colors.neutral[600],
  },
  logicPillTextActive: {
    color: colors.accent.indigo[700],
  },
  detectButton: {
    alignSelf: 'flex-start',
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
