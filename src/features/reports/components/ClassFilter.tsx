import React from 'react';
import { useTranslation } from 'react-i18next';

import { Select } from '@/components/forms/Select';

interface ClassOption {
  id: string;
  name: string;
}

interface ClassFilterProps {
  classes: ClassOption[];
  selectedClassId: string | undefined;
  onSelect: (classId: string | undefined) => void;
  showAllOption?: boolean;
}

export function ClassFilter({
  classes,
  selectedClassId,
  onSelect,
  showAllOption = true,
}: ClassFilterProps) {
  const { t } = useTranslation();

  const classOptions = classes.map((c) => ({ label: c.name, value: c.id }));
  const options = showAllOption
    ? [{ label: t('reports.allClasses'), value: '' }, ...classOptions]
    : classOptions;

  return (
    <Select
      label={t('reports.classFilter')}
      placeholder={t('reports.allClasses')}
      options={options}
      value={selectedClassId ?? ''}
      onChange={(v) => onSelect(v || undefined)}
    />
  );
}
