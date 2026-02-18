import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { spacing } from '@/theme/spacing';
import { KPICard } from './KPICard';
import type { SchoolKPISummary } from '../types/reports.types';

interface KPIGridProps {
  data: SchoolKPISummary | undefined;
  isLoading: boolean;
}

export function KPIGrid({ data, isLoading }: KPIGridProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <KPICard
          label={t('reports.kpi.activeStudents')}
          value={data?.activeStudents ?? 0}
          isLoading={isLoading}
        />
        <KPICard
          label={t('reports.kpi.activeTeachers')}
          value={data?.activeTeachers ?? 0}
          isLoading={isLoading}
        />
        <KPICard
          label={t('reports.kpi.totalClasses')}
          value={data?.totalClasses ?? 0}
          isLoading={isLoading}
        />
      </View>
      <View style={styles.row}>
        <KPICard
          label={t('reports.kpi.attendanceRate')}
          value={data?.attendanceRate ?? 0}
          format="percentage"
          isLoading={isLoading}
        />
        <KPICard
          label={t('reports.kpi.averageScore')}
          value={data?.averageScore ?? 0}
          format="score"
          isLoading={isLoading}
        />
        <KPICard
          label={t('reports.kpi.stickersAwarded')}
          value={data?.totalStickersAwarded ?? 0}
          isLoading={isLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
