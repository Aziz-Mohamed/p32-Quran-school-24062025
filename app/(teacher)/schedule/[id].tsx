import React from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateSessionStatus } from '@/features/scheduling/hooks/useScheduledSessions';
import { scheduledSessionService } from '@/features/scheduling/services/scheduled-session.service';
import { typography } from '@/theme/typography';
import { lightTheme, colors, semantic } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

// ─── Session Detail ──────────────────────────────────────────────────────────

export default function SessionDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { schoolId } = useAuth();

  const { data: session, isLoading, error, refetch } = useQuery({
    queryKey: ['scheduled-session', id],
    queryFn: async () => {
      const { data, error } = await scheduledSessionService.getScheduledSessions({
        schoolId: schoolId!,
      });
      if (error) throw error;
      return (data ?? []).find((s: any) => s.id === id) ?? null;
    },
    enabled: !!id && !!schoolId,
  });

  const updateStatus = useUpdateSessionStatus();

  const handleStart = () => {
    if (!id) return;
    updateStatus.mutate({ sessionId: id, status: 'in_progress' });
  };

  const handleComplete = () => {
    if (!id) return;
    updateStatus.mutate(
      { sessionId: id, status: 'completed' },
      {
        onSuccess: () => {
          Alert.alert(t('common.success'), t('scheduling.sessionCompleted'));
        },
      },
    );
  };

  const handleCancel = () => {
    if (!id) return;
    Alert.alert(
      t('scheduling.cancelTitle'),
      t('scheduling.cancelMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: () => updateStatus.mutate({ sessionId: id, status: 'cancelled' }),
        },
      ],
    );
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;
  if (!session) return <ErrorState description={t('scheduling.sessionNotFound')} />;

  const statusColor =
    session.status === 'scheduled' ? colors.accent.sky[500] :
    session.status === 'in_progress' ? semantic.warning :
    session.status === 'completed' ? semantic.success :
    session.status === 'cancelled' ? colors.neutral[400] :
    semantic.error;

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Button
          title={t('common.back')}
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
        />

        <View style={styles.header}>
          <Text style={styles.title}>
            {session.class?.name ?? t('scheduling.individualSession')}
          </Text>
          <Badge
            label={t(`scheduling.status.${session.status}`)}
            variant={session.status === 'completed' ? 'success' : session.status === 'in_progress' ? 'warning' : 'sky'}
            size="md"
          />
        </View>

        {/* Session Details */}
        <Card variant="default" style={styles.detailCard}>
          <DetailRow
            icon="calendar-outline"
            label={t('scheduling.date')}
            value={new Date(session.session_date + 'T00:00:00').toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          />
          <DetailRow
            icon="time-outline"
            label={t('scheduling.time')}
            value={`${session.start_time?.slice(0, 5)} – ${session.end_time?.slice(0, 5)}`}
          />
          <DetailRow
            icon="book-outline"
            label={t('scheduling.type')}
            value={t(`scheduling.sessionType.${session.session_type}`)}
          />
          {session.student?.profiles?.full_name && (
            <DetailRow
              icon="person-outline"
              label={t('scheduling.student')}
              value={session.student.profiles.full_name}
            />
          )}
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          {session.status === 'scheduled' && (
            <>
              <Button
                title={t('scheduling.startSession')}
                onPress={handleStart}
                variant="primary"
                size="lg"
                icon={<Ionicons name="play" size={20} color={colors.white} />}
                loading={updateStatus.isPending}
              />
              <Button
                title={t('scheduling.cancelSession')}
                onPress={handleCancel}
                variant="ghost"
                size="md"
              />
            </>
          )}
          {session.status === 'in_progress' && (
            <Button
              title={t('scheduling.completeSession')}
              onPress={handleComplete}
              variant="primary"
              size="lg"
              icon={<Ionicons name="checkmark-circle" size={20} color={colors.white} />}
              loading={updateStatus.isPending}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon as any} size={20} color={colors.neutral[400]} />
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    flex: 1,
  },
  detailCard: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...typography.textStyles.label,
    color: colors.neutral[500],
  },
  detailValue: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[900],
    marginTop: normalize(2),
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
