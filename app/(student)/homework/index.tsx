import React, { useState } from 'react';
import { I18nManager, Pressable, StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { useStudentHomework } from '@/features/homework/hooks/useHomework';
import { useAuth } from '@/hooks/useAuth';
import { useRoleTheme } from '@/hooks/useRoleTheme';
import { formatSessionDate } from '@/lib/helpers';
import { formatVerseRange } from '@/lib/quran-metadata';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

// ─── Student Homework List ───────────────────────────────────────────────────

export default function StudentHomeworkScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  const theme = useRoleTheme();
  const [showCompleted, setShowCompleted] = useState(false);

  const { data: homework = [], isLoading, error, refetch } = useStudentHomework(
    profile?.id,
    { isCompleted: showCompleted },
  );

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Button
            title={t('common.back')}
            onPress={() => router.back()}
            variant="ghost"
            size="sm"
            icon={<Ionicons name={I18nManager.isRTL ? "arrow-forward" : "arrow-back"} size={20} color={theme.primary} />}
          />
          <Text style={styles.title}>{t('student.homework.title')}</Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          <Pressable
            style={[styles.filterTab, !showCompleted && styles.filterTabActive]}
            onPress={() => setShowCompleted(false)}
          >
            <Text style={[styles.filterText, !showCompleted && styles.filterTextActive]}>
              {t('student.homework.pending')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterTab, showCompleted && styles.filterTabActive]}
            onPress={() => setShowCompleted(true)}
          >
            <Text style={[styles.filterText, showCompleted && styles.filterTextActive]}>
              {t('student.homework.completed')}
            </Text>
          </Pressable>
        </View>

        {/* List */}
        {homework.length === 0 ? (
          <EmptyState
            icon={showCompleted ? "checkmark-circle-outline" : "book-outline"}
            title={showCompleted ? t('student.homework.emptyCompleted') : t('student.homework.emptyPending')}
          />
        ) : (
          <FlashList
            data={homework}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={styles.listContent}
            estimatedItemSize={72}
            renderItem={({ item }: { item: any }) => {
              const isOverdue = !item.is_completed && item.due_date && new Date(item.due_date + 'T00:00:00') < new Date(new Date().toISOString().split('T')[0] + 'T00:00:00');
              const rec = item.sessions?.recitations?.[0];
              const verse = rec ? formatVerseRange(rec.surah_number, rec.from_ayah, rec.to_ayah, i18n.language as 'ar' | 'en') : null;
              return (
                <Card
                  variant="default"
                  onPress={() => router.push(`/(student)/homework/${item.id}`)}
                  style={styles.hwCard}
                >
                  <View style={styles.hwRow}>
                    <View style={styles.hwIcon}>
                      <Ionicons name="book-outline" size={20} color={colors.accent.indigo[500]} />
                    </View>
                    <View style={styles.hwInfo}>
                      {verse ? (
                        <Text numberOfLines={1}>
                          <Text style={styles.hwSurah}>{verse}</Text>
                          {'  '}
                          <Text style={styles.hwType}>{item.description.split(' ')[0]}</Text>
                        </Text>
                      ) : (
                        <Text style={styles.hwSurah} numberOfLines={1}>{item.description}</Text>
                      )}
                      <Text style={styles.hwDue}>
                        <Text style={styles.hwDueLabel}>{t('teacher.sessions.due')}  </Text>
                        <Text style={isOverdue ? styles.hwOverdue : undefined}>
                          {item.due_date
                            ? formatSessionDate(item.due_date, i18n.language).date
                            : t('student.homeworkDetail.noDueDate')}
                        </Text>
                      </Text>
                    </View>
                    <Ionicons name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"} size={16} color={colors.neutral[300]} />
                  </View>
                </Card>
              );
            }}
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
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    fontSize: normalize(24),
  },
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    backgroundColor: colors.neutral[100],
    borderRadius: normalize(10),
    padding: normalize(3),
  },
  filterTab: {
    flex: 1,
    paddingVertical: normalize(8),
    alignItems: 'center',
    borderRadius: normalize(8),
  },
  filterTabActive: {
    backgroundColor: colors.white,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
  },
  filterText: {
    ...typography.textStyles.label,
    color: colors.neutral[500],
  },
  filterTextActive: {
    color: lightTheme.text,
    fontFamily: typography.fontFamily.semiBold,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  hwCard: {
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  hwRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  hwIcon: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(12),
    backgroundColor: colors.accent.indigo[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  hwInfo: {
    flex: 1,
    gap: normalize(3),
  },
  hwSurah: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(14),
    color: lightTheme.text,
  },
  hwType: {
    fontFamily: typography.fontFamily.regular,
    fontSize: normalize(12),
    color: colors.neutral[400],
  },
  hwDue: {
    ...typography.textStyles.caption,
    color: colors.neutral[400],
  },
  hwDueLabel: {
    color: colors.neutral[300],
  },
  hwOverdue: {
    color: colors.accent.rose[500],
  },
});
