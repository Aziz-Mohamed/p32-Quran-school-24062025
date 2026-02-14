import React from 'react';
import { useTranslation } from 'react-i18next';

import { FilterChips, type FilterChip } from '@/components/lists/FilterChips';
import type { TimePeriod } from '../types/reports.types';

interface TimePeriodFilterProps {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
}

export function TimePeriodFilter({ value, onChange }: TimePeriodFilterProps) {
  const { t } = useTranslation();

  const chips: FilterChip[] = [
    { label: t('reports.timePeriod.thisWeek'), value: 'this_week' },
    { label: t('reports.timePeriod.thisMonth'), value: 'this_month' },
    { label: t('reports.timePeriod.thisTerm'), value: 'this_term' },
    { label: t('reports.timePeriod.allTime'), value: 'all_time' },
  ];

  return (
    <FilterChips
      chips={chips}
      selected={value}
      onSelect={(v) => onChange(v as TimePeriod)}
    />
  );
}
