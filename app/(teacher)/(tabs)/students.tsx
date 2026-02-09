import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { SearchBar } from '@/components/ui/SearchBar';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { useStudents } from '@/features/students/hooks/useStudents';
import { typography } from '@/theme/typography';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// ─── Teacher Student List Screen ─────────────────────────────────────────────

export default function TeacherStudentsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: students = [],
    isLoading,
    error,
    refetch,
  } = useStudents({
    isActive: true,
    searchQuery: searchQuery.trim() || undefined,
  });

  const handleClearSearch = useCallback(() => setSearchQuery(''), []);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('teacher.students.title')}</Text>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={handleClearSearch}
          placeholder={t('teacher.students.searchPlaceholder')}
        />

        {students.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title={t('teacher.students.emptyTitle')}
            description={t('teacher.students.emptyDescription')}
          />
        ) : (
          <FlashList
            data={students}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item }: { item: any }) => (
              <Card
                variant="outlined"
                onPress={() => router.push(`/(teacher)/students/${item.id}`)}
                style={styles.studentCard}
              >
                <View style={styles.studentRow}>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>
                      {item.profiles?.full_name ?? '—'}
                    </Text>
                    <Text style={styles.studentMeta}>
                      {item.classes?.name ?? t('teacher.students.noClass')}
                      {item.levels ? ` · ${item.levels.title}` : ''}
                    </Text>
                  </View>
                  <Badge
                    label={item.is_active ? t('teacher.students.active') : t('teacher.students.inactive')}
                    variant={item.is_active ? 'success' : 'default'}
                    size="sm"
                  />
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
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
  },
  studentCard: {
    marginBottom: spacing.sm,
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    ...typography.textStyles.body,
    color: lightTheme.text,
    fontFamily: typography.fontFamily.semiBold,
  },
  studentMeta: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    marginTop: 2,
  },
});
