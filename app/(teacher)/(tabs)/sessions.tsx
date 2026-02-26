import React, { useState, useMemo } from 'react';
import { I18nManager, StyleSheet, View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useLocalizedName } from '@/hooks/useLocalizedName';
import { useSessions } from '@/features/sessions/hooks/useSessions';
import { useTeacherUpcomingSessions } from '@/features/scheduling/hooks/useScheduledSessions';
import { useCanTeacherCreateSessions } from '@/features/schools';
import { formatSessionDate } from '@/lib/helpers';
import { typography } from '@/theme/typography';
import { lightTheme, colors, semantic } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';
import { radius } from '@/theme/radius';

// ─── Status Colors ───────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  scheduled: colors.accent.sky[500],
  in_progress: semantic.warning,
  completed: semantic.success,
  cancelled: colors.neutral[400],
  missed: semantic.error,
};

// ─── Types ───────────────────────────────────────────────────────────────────

type ActiveTab = 'upcoming' | 'history';

type UpcomingItem =
  | { type: 'header'; date: string }
  | { type: 'session'; data: any };

// ─── Component ───────────────────────────────────────────────────────────────

export default function SessionsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { profile, schoolId } = useAuth();
  const { resolveName } = useLocalizedName();

  const [activeTab, setActiveTab] = useState<ActiveTab>('upcoming');

  const { canCreate } = useCanTeacherCreateSessions(schoolId ?? undefined);

  // Both queries run on mount for instant tab switching
  const upcoming = useTeacherUpcomingSessions(profile?.id, schoolId ?? undefined);
  const history = useSessions({ teacherId: profile?.id });

  // ── Upcoming: group by date and flatten for FlashList ──────────────────
  const upcomingItems = useMemo<UpcomingItem[]>(() => {
    const sessions = upcoming.data ?? [];
    const grouped = new Map<string, any[]>();
    for (const session of sessions) {
      const date = session.session_date;
      if (!grouped.has(date)) grouped.set(date, []);
      grouped.get(date)!.push(session);
    }
    const items: UpcomingItem[] = [];
    for (const [date, daySessions] of grouped.entries()) {
      items.push({ type: 'header', date });
      for (const session of daySessions) {
        items.push({ type: 'session', data: session });
      }
    }
    return items;
  }, [upcoming.data]);

  // ── Active tab data ────────────────────────────────────────────────────
  const isLoading = activeTab === 'upcoming' ? upcoming.isLoading : history.isLoading;
  const error = activeTab === 'upcoming' ? upcoming.error : history.error;
  const refetch = activeTab === 'upcoming' ? upcoming.refetch : history.refetch;

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={(error as Error).message} onRetry={refetch} />;

  return (
    <Screen scroll={false} hasTabBar>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t('teacher.sessions.title')}</Text>
            <Text style={styles.subtitle}>{t('teacher.sessions.subtitle')}</Text>
          </View>
          {canCreate && (
            <Button
              title={t('scheduling.createSession')}
              onPress={() => router.push('/(teacher)/schedule/create')}
              variant="primary"
              size="sm"
              icon={<Ionicons name="add-circle-outline" size={normalize(16)} color={colors.white} />}
            />
          )}
        </View>

        {/* Pill Toggle */}
        <View style={styles.pillRow}>
          <Pressable
            style={[styles.pill, activeTab === 'upcoming' && styles.pillActive]}
            onPress={() => setActiveTab('upcoming')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'upcoming' }}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color={activeTab === 'upcoming' ? colors.white : colors.neutral[600]}
            />
            <Text style={[styles.pillText, activeTab === 'upcoming' && styles.pillTextActive]}>
              {t('teacher.sessions.upcoming')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.pill, activeTab === 'history' && styles.pillActive]}
            onPress={() => setActiveTab('history')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'history' }}
          >
            <Ionicons
              name="time-outline"
              size={16}
              color={activeTab === 'history' ? colors.white : colors.neutral[600]}
            />
            <Text style={[styles.pillText, activeTab === 'history' && styles.pillTextActive]}>
              {t('teacher.sessions.history')}
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        {activeTab === 'upcoming' ? (
          <UpcomingList
            items={upcomingItems}
            canCreate={canCreate}
            resolveName={resolveName}
            router={router}
            t={t}
          />
        ) : (
          <HistoryList
            sessions={history.data ?? []}
            resolveName={resolveName}
            router={router}
            t={t}
            language={i18n.language}
          />
        )}
      </View>
    </Screen>
  );
}

// ─── Upcoming List ───────────────────────────────────────────────────────────

function UpcomingList({
  items,
  canCreate,
  resolveName,
  router,
  t,
}: {
  items: UpcomingItem[];
  canCreate: boolean;
  resolveName: (localized: any, fallback: any) => string | undefined;
  router: ReturnType<typeof useRouter>;
  t: (key: string) => string;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon="calendar-outline"
        title={t('teacher.sessions.noUpcoming')}
        description={t('teacher.sessions.noUpcomingDesc')}
        actionLabel={canCreate ? t('scheduling.createSession') : undefined}
        onAction={canCreate ? () => router.push('/(teacher)/schedule/create') : undefined}
      />
    );
  }

  return (
    <FlashList
      data={items}
      keyExtractor={(item, idx) => (item.type === 'header' ? `h-${item.date}` : `s-${item.data.id}`)}
      getItemType={(item) => item.type}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => {
        if (item.type === 'header') {
          return (
            <Text style={styles.dateHeader}>
              {new Date(item.date + 'T00:00:00').toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          );
        }

        const session = item.data;
        return (
          <Card
            variant="default"
            style={styles.sessionCard}
            onPress={() => router.push(`/(teacher)/schedule/${session.id}`)}
          >
            <View style={styles.sessionRow}>
              <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[session.status] ?? colors.neutral[400] }]} />
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle}>
                  {resolveName(session.class?.name_localized, session.class?.name) ?? t('scheduling.individualSession')}
                </Text>
                <Text style={styles.sessionTime}>
                  {session.start_time?.slice(0, 5)} – {session.end_time?.slice(0, 5)}
                </Text>
                {session.student?.profiles?.full_name && (
                  <Text style={styles.studentNameUpcoming}>
                    {resolveName(session.student.profiles?.name_localized, session.student.profiles.full_name)}
                  </Text>
                )}
              </View>
              <Badge
                label={t(`scheduling.status.${session.status}`)}
                variant={session.status === 'scheduled' ? 'sky' : session.status === 'in_progress' ? 'warning' : 'success'}
                size="sm"
              />
              <Ionicons name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.neutral[300]} />
            </View>
          </Card>
        );
      }}
    />
  );
}

// ─── History List ────────────────────────────────────────────────────────────

function HistoryList({
  sessions,
  resolveName,
  router,
  t,
  language,
}: {
  sessions: any[];
  resolveName: (localized: any, fallback: any) => string | undefined;
  router: ReturnType<typeof useRouter>;
  t: (key: string) => string;
  language: string;
}) {
  if (sessions.length === 0) {
    return (
      <EmptyState
        icon="clipboard-outline"
        title={t('teacher.sessions.emptyTitle')}
        description={t('teacher.sessions.emptyDescription')}
      />
    );
  }

  return (
    <FlashList
      data={sessions}
      keyExtractor={(item: any) => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }: { item: any }) => (
        <Card
          variant="default"
          onPress={() => router.push(`/(teacher)/sessions/${item.id}`)}
          style={styles.sessionCard}
        >
          <View style={styles.sessionRow}>
            <View style={styles.studentAvatar}>
              <Text style={styles.avatarText}>
                {resolveName(item.student?.profiles?.name_localized, item.student?.profiles?.full_name)?.[0]?.toUpperCase()}
              </Text>
            </View>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionTitle} numberOfLines={1}>
                {resolveName(item.student?.profiles?.name_localized, item.student?.profiles?.full_name) ?? '—'}
              </Text>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={12} color={colors.neutral[400]} />
                <Text style={styles.sessionTime}>
                  {formatSessionDate(item.session_date, language).date}{' '}
                  <Text style={styles.sessionWeekday}>({formatSessionDate(item.session_date, language).weekday})</Text>
                </Text>
              </View>
            </View>
            <View style={styles.scores}>
              {item.memorization_score != null && (
                <Badge
                  label={`${t('common.scoreAbbrev.memorization')}: ${item.memorization_score}/5`}
                  variant={item.memorization_score >= 4 ? 'success' : 'warning'}
                  size="sm"
                />
              )}
              <Ionicons name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.neutral[300]} />
            </View>
          </View>
        </Card>
      )}
    />
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    fontSize: normalize(24),
  },
  subtitle: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
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
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  dateHeader: {
    ...typography.textStyles.subheading,
    color: colors.neutral[700],
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sessionCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusDot: {
    width: normalize(10),
    height: normalize(10),
    borderRadius: normalize(5),
  },
  sessionInfo: {
    flex: 1,
    gap: normalize(2),
  },
  sessionTitle: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[900],
  },
  sessionTime: {
    ...typography.textStyles.label,
    color: colors.neutral[500],
  },
  studentNameUpcoming: {
    ...typography.textStyles.label,
    color: colors.accent.indigo[500],
    marginTop: normalize(2),
  },
  studentAvatar: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(12),
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[600],
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  sessionWeekday: {
    ...typography.textStyles.caption,
    color: colors.neutral[400],
  },
  scores: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
