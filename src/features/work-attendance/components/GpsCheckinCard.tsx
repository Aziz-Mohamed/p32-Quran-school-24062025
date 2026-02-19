import React, { useState } from 'react';
import { StyleSheet, View, Text, Alert, TextInput, Modal, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useRoleTheme } from '@/hooks/useRoleTheme';
import {
  useTodayCheckin,
  useSchoolLocation,
  useGpsCheckIn,
  useGpsCheckOut,
  useRequestOverride,
} from '../hooks/useGpsCheckin';
import type { SchoolVerificationSettings } from '../types/work-attendance.types';
import { colors, semantic } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

export function GpsCheckinCard() {
  const { t } = useTranslation();
  const { profile, schoolId } = useAuth();
  const theme = useRoleTheme();

  const { data: checkin, isLoading: checkinLoading } = useTodayCheckin(profile?.id);
  const { data: schoolLocation } = useSchoolLocation(schoolId ?? undefined);
  const checkInMutation = useGpsCheckIn();
  const checkOutMutation = useGpsCheckOut();
  const overrideMutation = useRequestOverride();

  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [pendingCheckinId, setPendingCheckinId] = useState<string | null>(null);

  const isCheckedIn = !!checkin && !checkin.checked_out_at;
  const isCheckedOut = !!checkin && !!checkin.checked_out_at;
  const isVerified = checkin?.is_verified;
  const hasPendingOverride = checkin && !checkin.is_verified && checkin.override_reason;

  const verificationMode = (schoolLocation?.verification_mode ?? 'gps') as SchoolVerificationSettings['verification_mode'];

  const getDefaultSettings = (): SchoolVerificationSettings => ({
    latitude: 0,
    longitude: 0,
    geofence_radius_meters: 99999,
    wifi_ssid: null,
    verification_mode: 'gps',
    verification_logic: 'or',
  });

  const handleCheckIn = async () => {
    if (!profile?.id || !schoolId) return;

    const settings: SchoolVerificationSettings = schoolLocation
      ? {
          latitude: schoolLocation.latitude,
          longitude: schoolLocation.longitude,
          geofence_radius_meters: schoolLocation.geofence_radius_meters,
          wifi_ssid: schoolLocation.wifi_ssid,
          verification_mode: (schoolLocation.verification_mode as SchoolVerificationSettings['verification_mode']) ?? 'gps',
          verification_logic: (schoolLocation.verification_logic as SchoolVerificationSettings['verification_logic']) ?? 'or',
        }
      : getDefaultSettings();

    checkInMutation.mutate(
      {
        teacherId: profile.id,
        schoolId,
        schoolLocation: settings,
      },
      {
        onSuccess: (result) => {
          if (!result.isVerified && result.data?.id) {
            setPendingCheckinId(result.data.id);
            setShowOverrideModal(true);
          }
        },
      },
    );
  };

  const handleCheckOut = () => {
    if (!checkin?.id) return;

    const settings: SchoolVerificationSettings = schoolLocation
      ? {
          latitude: schoolLocation.latitude,
          longitude: schoolLocation.longitude,
          geofence_radius_meters: schoolLocation.geofence_radius_meters,
          wifi_ssid: schoolLocation.wifi_ssid,
          verification_mode: (schoolLocation.verification_mode as SchoolVerificationSettings['verification_mode']) ?? 'gps',
          verification_logic: (schoolLocation.verification_logic as SchoolVerificationSettings['verification_logic']) ?? 'or',
        }
      : getDefaultSettings();

    checkOutMutation.mutate({
      checkinId: checkin.id,
      schoolLocation: settings,
    });
  };

  const handleSubmitOverride = () => {
    if (!pendingCheckinId || !overrideReason.trim()) return;
    overrideMutation.mutate(
      { checkinId: pendingCheckinId, reason: overrideReason.trim() },
      {
        onSuccess: () => {
          setShowOverrideModal(false);
          setOverrideReason('');
          setPendingCheckinId(null);
        },
      },
    );
  };

  const getStatusIcon = (): keyof typeof Ionicons.glyphMap => {
    if (isCheckedOut) return 'checkmark-circle';
    if (isCheckedIn && isVerified) return 'shield-checkmark';
    if (isCheckedIn && hasPendingOverride) return 'hourglass';
    if (isCheckedIn) return 'time';
    return 'log-in';
  };

  const getStatusColor = () => {
    if (isCheckedOut) return semantic.success;
    if (isCheckedIn && isVerified) return theme.primary;
    if (isCheckedIn && hasPendingOverride) return semantic.warning;
    if (isCheckedIn) return colors.neutral[400];
    return colors.neutral[400];
  };

  const getStatusText = () => {
    if (isCheckedOut) return t('workAttendance.checkedOut');
    if (isCheckedIn && isVerified) return t('workAttendance.checkedInVerified');
    if (isCheckedIn && hasPendingOverride) return t('workAttendance.pendingOverride');
    if (isCheckedIn) return t('workAttendance.checkedInUnverified');
    return t('workAttendance.notCheckedIn');
  };

  const getErrorText = () => {
    if (checkInMutation.locationError === 'location_permission_denied') {
      return t('workAttendance.locationPermissionNeeded');
    }
    if (checkInMutation.locationError === 'wifi_ssid_unavailable') {
      return t('workAttendance.wifiSsidUnavailable');
    }
    if (checkInMutation.locationError) {
      return checkInMutation.locationError;
    }
    return null;
  };

  if (checkinLoading) return null;

  const showDistance = isCheckedIn && checkin.checkin_distance_meters != null;
  const showWifi = isCheckedIn && checkin.checkin_wifi_ssid != null;

  return (
    <>
      <Card variant={isCheckedIn && isVerified ? 'primary-glow' : 'default'} style={styles.card}>
        <View style={styles.row}>
          <View style={styles.info}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: isCheckedIn ? theme.primaryLight : colors.neutral[100] },
              ]}
            >
              <Ionicons name={getStatusIcon()} size={24} color={getStatusColor()} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.statusLabel}>{getStatusText()}</Text>
              {isCheckedIn && (
                <Text style={styles.timeText}>
                  {t('workAttendance.since')}:{' '}
                  {new Date(checkin.checked_in_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              )}
              {showDistance && (
                <Text style={styles.detailText}>
                  <Ionicons name="navigate-outline" size={12} color={colors.neutral[400]} />{' '}
                  {Math.round(checkin.checkin_distance_meters!)}m {t('workAttendance.fromSchool')}
                </Text>
              )}
              {showWifi && (
                <Text style={styles.detailText}>
                  <Ionicons name="wifi-outline" size={12} color={colors.neutral[400]} />{' '}
                  {checkin.checkin_wifi_ssid === schoolLocation?.wifi_ssid
                    ? t('workAttendance.connectedTo', { ssid: checkin.checkin_wifi_ssid })
                    : t('workAttendance.wrongWifi')}
                </Text>
              )}
            </View>
          </View>
          {!checkin ? (
            <Button
              title={t('workAttendance.checkIn')}
              onPress={handleCheckIn}
              variant={theme.tag}
              size="sm"
              loading={checkInMutation.isPending}
            />
          ) : isCheckedIn ? (
            <Button
              title={t('workAttendance.checkOut')}
              onPress={handleCheckOut}
              variant="secondary"
              size="sm"
              loading={checkOutMutation.isPending}
            />
          ) : null}
        </View>

        {getErrorText() && (
          <Text style={styles.errorText}>{getErrorText()}</Text>
        )}
      </Card>

      {/* Manual Override Modal */}
      <Modal visible={showOverrideModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('workAttendance.verificationFailed')}</Text>
            <Text style={styles.modalDescription}>
              {t('workAttendance.outsideGeofenceDescription')}
            </Text>
            <TextInput
              style={styles.reasonInput}
              placeholder={t('workAttendance.overrideReasonPlaceholder')}
              value={overrideReason}
              onChangeText={setOverrideReason}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <Button
                title={t('common.cancel')}
                onPress={() => {
                  setShowOverrideModal(false);
                  setOverrideReason('');
                }}
                variant="ghost"
                size="sm"
              />
              <Button
                title={t('workAttendance.requestOverride')}
                onPress={handleSubmitOverride}
                variant={theme.tag}
                size="sm"
                loading={overrideMutation.isPending}
                disabled={!overrideReason.trim()}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  statusLabel: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[900],
  },
  timeText: {
    ...typography.textStyles.label,
    color: colors.neutral[500],
    marginTop: normalize(2),
  },
  detailText: {
    ...typography.textStyles.label,
    color: colors.neutral[400],
    marginTop: normalize(1),
  },
  errorText: {
    ...typography.textStyles.label,
    color: semantic.error,
    marginTop: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: normalize(16),
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    ...typography.textStyles.subheading,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  modalDescription: {
    ...typography.textStyles.body,
    color: colors.neutral[600],
    marginBottom: spacing.lg,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: normalize(12),
    padding: spacing.md,
    ...typography.textStyles.body,
    color: colors.neutral[900],
    minHeight: normalize(80),
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
});
