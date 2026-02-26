import { plansToSelectedItems } from '../utils/plan-conversion';
import type { RecitationPlanWithDetails } from '../types/recitation-plan.types';

// ─── Test Helpers ─────────────────────────────────────────────────────────────

function makePlan(overrides: Partial<RecitationPlanWithDetails> = {}): RecitationPlanWithDetails {
  return {
    id: 'plan-1',
    school_id: 'school-1',
    scheduled_session_id: 'session-1',
    student_id: 'student-1',
    set_by: 'teacher-1',
    selection_mode: 'ayah_range',
    start_surah: 2,
    start_ayah: 1,
    end_surah: 2,
    end_ayah: 5,
    rub_number: null,
    juz_number: null,
    hizb_number: null,
    recitation_type: 'new_hifz',
    source: 'manual',
    assignment_id: null,
    notes: null,
    created_at: '2025-01-15T10:00:00Z',
    setter: { full_name: 'Teacher One' },
    student: { profiles: { full_name: 'Student One' } },
    ...overrides,
  } as RecitationPlanWithDetails;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('plansToSelectedItems', () => {
  it('returns empty array for empty input', () => {
    expect(plansToSelectedItems([])).toEqual([]);
  });

  it('maps plan fields to selected item format', () => {
    const plans = [makePlan()];
    const result = plansToSelectedItems(plans);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'plan-1',
      surah_number: 2,
      from_ayah: 1,
      to_ayah: 5,
      recitation_type: 'new_hifz',
      source: 'manual',
      assignment_id: null,
      selection_mode: 'ayah_range',
    });
  });

  it('maps start_surah to surah_number and start_ayah to from_ayah', () => {
    const plans = [makePlan({ start_surah: 18, start_ayah: 10 })];
    const result = plansToSelectedItems(plans);

    expect(result[0].surah_number).toBe(18);
    expect(result[0].from_ayah).toBe(10);
  });

  it('preserves rub/juz/hizb fields', () => {
    const plans = [
      makePlan({
        selection_mode: 'rub',
        rub_number: 12,
        juz_number: 2,
        hizb_number: 3,
      }),
    ];
    const result = plansToSelectedItems(plans);

    expect(result[0].rub_number).toBe(12);
    expect(result[0].juz_number).toBe(2);
    expect(result[0].hizb_number).toBe(3);
    expect(result[0].selection_mode).toBe('rub');
  });

  it('maps from_assignment source correctly', () => {
    const plans = [
      makePlan({
        source: 'from_assignment',
        assignment_id: 'assign-1',
      }),
    ];
    const result = plansToSelectedItems(plans);

    expect(result[0].source).toBe('from_assignment');
    expect(result[0].assignment_id).toBe('assign-1');
  });

  it('normalizes student_suggestion source to manual', () => {
    const plans = [makePlan({ source: 'student_suggestion' })];
    const result = plansToSelectedItems(plans);

    expect(result[0].source).toBe('manual');
  });

  it('includes end_surah and end_ayah', () => {
    const plans = [makePlan({ end_surah: 3, end_ayah: 20 })];
    const result = plansToSelectedItems(plans);

    expect(result[0].end_surah).toBe(3);
    expect(result[0].end_ayah).toBe(20);
  });

  it('handles multiple plans', () => {
    const plans = [
      makePlan({ id: 'plan-1', recitation_type: 'new_hifz' }),
      makePlan({ id: 'plan-2', recitation_type: 'old_review' }),
    ];
    const result = plansToSelectedItems(plans);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('plan-1');
    expect(result[1].id).toBe('plan-2');
  });

  it('defaults selection_mode to ayah_range when null', () => {
    const plans = [makePlan({ selection_mode: null as any })];
    const result = plansToSelectedItems(plans);

    expect(result[0].selection_mode).toBe('ayah_range');
  });
});
