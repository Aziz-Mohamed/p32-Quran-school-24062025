import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useSessions } from '@/features/sessions/hooks/useSessions';
import { useRoleTheme } from '@/hooks/useRoleTheme';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Sessions List Screen ────────────────────────────────────────────────────

export default function SessionsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  const theme = useRoleTheme();

  const { data: sessions = [], isLoading, error, refetch } = useSessions({
    teacherId: profile?.id,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;

  return (
    <Screen scroll={false} hasTabBar>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t('teacher.sessions.title')}</Text>
            <Text style={styles.subtitle}>{t('teacher.sessions.viewHistory')}</Text>
          </View>
          <Button
            title={t('teacher.logSession')}
            onPress={() => router.push('/(teacher)/sessions/create')}
            variant={theme.tag}
            size="sm"
            icon={<Ionicons name="add" size={18} color={colors.white} />}
          />
        </View>

        {sessions.length === 0 ? (
          <EmptyState
            icon="clipboard-outline"
            title={t('teacher.sessions.emptyTitle')}
            description={t('teacher.sessions.emptyDescription')}
          />
        ) : (
          <FlashList
            data={sessions}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={styles.listContent}
            estimatedItemSize={100}
            renderItem={({ item }: { item: any }) => (
              <Card
                variant="default"
                onPress={() => router.push(`/(teacher)/sessions/${item.id}`)}
                style={styles.sessionCard}
              >
                <View style={styles.sessionRow}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.avatarText}>
                      {item.student?.profiles?.full_name?.[0]?.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.studentName} numberOfLines={1}>
                      {item.student?.profiles?.full_name ?? '—'}
                    </Text>
                    <View style={styles.dateRow}>
                      <Ionicons name="calendar-outline" size={12} color={colors.neutral[400]} />
                      <Text style={styles.sessionDate}>{item.session_date}</Text>
                    </View>
                  </View>
                  <View style={styles.scores}>
                    {item.memorization_score != null && (
                      <Badge 
                        label={`M: ${item.memorization_score}`} 
                        variant={item.memorization_score >= 4 ? "success" : "warning"} 
                        size="sm" 
                      />
                    )}
                    <Ionicons name="chevron-forward" size={18} color={colors.neutral[300]} />
                  </View>
                </View>
              </Card>
            )}
          />
        )}
      </View>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    marginBottom: spacing.md,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    fontSize: 24,
  },
  subtitle: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sessionCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  studentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[600],
  },
  sessionInfo: {
    flex: 1,
    gap: 2,
  },
  studentName: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[900],
    fontSize: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionDate: {
    ...typography.textStyles.label,
    color: colors.neutral[500],
  },
  scores: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
