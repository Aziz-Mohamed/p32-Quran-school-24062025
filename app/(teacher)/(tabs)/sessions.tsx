import React, { useState, useMemo } from 'react';
import { I18nManager, StyleSheet, View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
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

  const upcoming = useTeacherUpcomingSessions(profile?.id, schoolId ?? undefined);
  const history = useSessions({ teacherId: profile?.id });

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
          <Text style={styles.title}>{t('teacher.sessions.title')}</Text>
          {canCreate && (
            <Pressable
              style={styles.addButton}
              onPress={() => router.push('/(teacher)/schedule/create')}
              accessibilityLabel={t('scheduling.createSession')}
            >
              <Ionicons name="add" size={22} color={colors.primary[600]} />
            </Pressable>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          {(['upcoming', 'history'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const count = tab === 'upcoming'
              ? (upcoming.data?.length ?? 0)
              : (history.data?.length ?? 0);
            return (
              <Pressable
                key={tab}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {t(`teacher.sessions.${tab}`)}
                </Text>
                {count > 0 && (
                  <View style={[styles.tabCount, isActive && styles.tabCountActive]}>
                    <Text style={[styles.tabCountText, isActive && styles.tabCountTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
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
      keyExtractor={(item, _idx) => (item.type === 'header' ? `h-${item.date}` : `s-${item.data.id}`)}
      getItemType={(item) => item.type}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => {
        if (item.type === 'header') {
          return (
            <Text style={styles.dateHeader}>
              {new Date(item.date + 'T00:00:00').toLocaleDateString(undefined, {
                weekday: 'short',
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
            style={styles.card}
            onPress={() => router.push(`/(teacher)/schedule/${session.id}`)}
          >
            <View style={styles.cardRow}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {resolveName(session.class?.name_localized, session.class?.name) ?? t('scheduling.individualSession')}
                </Text>
                <Text style={styles.cardMeta}>
                  {session.start_time?.slice(0, 5)} – {session.end_time?.slice(0, 5)}
                  {session.student?.profiles?.full_name
                    ? `  ·  ${resolveName(session.student.profiles?.name_localized, session.student.profiles.full_name)}`
                    : ''}
                </Text>
              </View>
              <Badge
                label={t(`scheduling.status.${session.status}`)}
                variant={session.status === 'scheduled' ? 'sky' : session.status === 'in_progress' ? 'warning' : 'success'}
                size="sm"
              />
              <Ionicons name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'} size={16} color={colors.neutral[300]} />
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
          style={styles.card}
        >
          <View style={styles.cardRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {resolveName(item.student?.profiles?.name_localized, item.student?.profiles?.full_name)?.[0]?.toUpperCase()}
              </Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {resolveName(item.student?.profiles?.name_localized, item.student?.profiles?.full_name) ?? '—'}
              </Text>
              <Text style={styles.cardMeta}>
                {formatSessionDate(item.session_date, language).date}
                {' · '}
                {formatSessionDate(item.session_date, language).weekday}
              </Text>
            </View>
            {item.memorization_score != null && (
              <Badge
                label={`${item.memorization_score}/5`}
                variant={item.memorization_score >= 4 ? 'success' : 'warning'}
                size="sm"
              />
            )}
            <Ionicons name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'} size={16} color={colors.neutral[300]} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    fontSize: normalize(24),
  },
  addButton: {
    width: normalize(38),
    height: normalize(38),
    borderRadius: radius.sm,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Tabs ──
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary[500],
  },
  tabText: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[400],
    fontSize: normalize(15),
  },
  tabTextActive: {
    color: colors.primary[600],
  },
  tabCount: {
    minWidth: normalize(20),
    height: normalize(20),
    borderRadius: normalize(10),
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  tabCountActive: {
    backgroundColor: colors.primary[50],
  },
  tabCountText: {
    ...typography.textStyles.caption,
    color: colors.neutral[400],
    fontSize: normalize(11),
    fontWeight: '600',
  },
  tabCountTextActive: {
    color: colors.primary[600],
  },

  // ── Shared ──
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  dateHeader: {
    ...typography.textStyles.label,
    color: colors.neutral[500],
    fontSize: normalize(13),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  card: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardInfo: {
    flex: 1,
    gap: normalize(3),
  },
  cardTitle: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[900],
  },
  cardMeta: {
    ...typography.textStyles.caption,
    color: colors.neutral[400],
  },
  avatar: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(12),
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[600],
    fontSize: normalize(15),
  },
});
