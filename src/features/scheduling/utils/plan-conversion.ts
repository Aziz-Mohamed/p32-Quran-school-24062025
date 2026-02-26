import type {
  RecitationPlanWithDetails,
  SelectionMode,
  RecitationPlanType,
} from '../types/recitation-plan.types';

/** Convert DB plan rows to SelectedPlanItem[] for form pre-population */
export function plansToSelectedItems(
  plans: RecitationPlanWithDetails[],
): Array<{
  id: string;
  surah_number: number;
  from_ayah: number;
  to_ayah: number;
  recitation_type: RecitationPlanType;
  source: 'manual' | 'from_assignment';
  assignment_id: string | null;
  selection_mode: SelectionMode;
  rub_number?: number | null;
  juz_number?: number | null;
  hizb_number?: number | null;
  end_surah?: number;
  end_ayah?: number;
}> {
  return plans.map((p) => ({
    id: p.id,
    surah_number: p.start_surah,
    from_ayah: p.start_ayah,
    to_ayah: p.end_ayah,
    recitation_type: p.recitation_type as RecitationPlanType,
    source: (p.source === 'from_assignment' ? 'from_assignment' : 'manual') as 'manual' | 'from_assignment',
    assignment_id: p.assignment_id ?? null,
    selection_mode: (p.selection_mode as SelectionMode) ?? 'ayah_range',
    rub_number: p.rub_number,
    juz_number: p.juz_number,
    hizb_number: p.hizb_number,
    end_surah: p.end_surah,
    end_ayah: p.end_ayah,
  }));
}
