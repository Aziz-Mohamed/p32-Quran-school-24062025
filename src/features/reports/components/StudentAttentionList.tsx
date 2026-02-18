import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { spacing } from '@/theme/spacing';
import { lightTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { ChartContainer } from './ChartContainer';
import { StudentAttentionCard } from './StudentAttentionCard';
import type { StudentNeedingAttention } from '../types/reports.types';

interface StudentAttentionListProps {
  students: StudentNeedingAttention[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function StudentAttentionList({
  students,
  isLoading,
  isError,
  onRetry,
}: StudentAttentionListProps) {
  const { t } = useTranslation();
  const isEmpty = !isLoading && !isError && students.length === 0;

  return (
    <ChartContainer
      title={t('reports.studentsNeedingAttention', 'Students Needing Attention')}
      isLoading={isLoading}
      isEmpty={isEmpty}
      isError={isError}
      onRetry={onRetry}
      emptyMessage={t(
        'reports.empty.studentsNeedingAttention',
        'No students need attention — all students are on track.',
      )}
      accessibilityLabel={t(
        'reports.studentsNeedingAttention',
        'Students Needing Attention',
      )}
    >
      <View style={styles.list}>
        {students.map((student) => (
          <StudentAttentionCard key={student.studentId} student={student} />
        ))}
      </View>
    </ChartContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
});
