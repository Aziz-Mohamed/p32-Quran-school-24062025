import React from 'react';
import { useTranslation } from 'react-i18next';

import { Select } from '@/components/forms/Select';
import { useLocalizedName } from '@/hooks/useLocalizedName';

interface ClassOption {
  id: string;
  name: string;
  name_localized?: Record<string, string> | null;
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
  const { resolveName } = useLocalizedName();

  const classOptions = classes.map((c) => ({ label: resolveName(c.name_localized, c.name) ?? c.name, value: c.id }));
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
