import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';

import { spacing } from '@/theme/spacing';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';
import { ChartContainer } from './ChartContainer';
import { TeacherActivityCard } from './TeacherActivityCard';
import type { TeacherActivitySummary } from '../types/reports.types';

interface TeacherActivityListProps {
  teachers: TeacherActivitySummary[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function TeacherActivityList({
  teachers,
  isLoading,
  isError,
  onRetry,
}: TeacherActivityListProps) {
  const { t } = useTranslation();
  const isEmpty = !isLoading && !isError && teachers.length === 0;

  // Split into active (sessions > 0) sorted by sessions desc,
  // and inactive (sessions === 0) sorted alphabetically per FR-007
  const active = teachers
    .filter((t) => t.sessionsLogged > 0)
    .sort((a, b) => b.sessionsLogged - a.sessionsLogged);

  const inactive = teachers
    .filter((t) => t.sessionsLogged === 0)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  type ListItem =
    | { type: 'teacher'; teacher: TeacherActivitySummary; inactive: boolean }
    | { type: 'header'; title: string };

  const listData: ListItem[] = [];
  for (const teacher of active) {
    listData.push({ type: 'teacher', teacher, inactive: false });
  }
  if (inactive.length > 0) {
    listData.push({
      type: 'header',
      title: t('reports.teacherActivityDetail.inactiveSection'),
    });
    for (const teacher of inactive) {
      listData.push({ type: 'teacher', teacher, inactive: true });
    }
  }

  return (
    <ChartContainer
      title={t('reports.teacherActivity')}
      isLoading={isLoading}
      isEmpty={isEmpty}
      isError={isError}
      onRetry={onRetry}
      emptyMessage={t('reports.empty.noTeachers')}
    >
      <View style={styles.listContainer}>
        <FlashList
          data={listData}
          scrollEnabled={false}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <Text style={styles.sectionHeader}>{item.title}</Text>
              );
            }
            return (
              <View style={styles.cardWrapper}>
                <TeacherActivityCard
                  teacher={item.teacher}
                  inactive={item.inactive}
                />
              </View>
            );
          }}
        />
      </View>
    </ChartContainer>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    minHeight: normalize(100),
  },
  sectionHeader: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: lightTheme.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  cardWrapper: {
    marginBottom: spacing.sm,
  },
});
