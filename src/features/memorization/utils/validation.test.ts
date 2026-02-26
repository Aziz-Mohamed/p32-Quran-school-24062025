import { recitationSchema, assignmentSchema } from './validation';

// ─── recitationSchema ───────────────────────────────────────────────────────

describe('recitationSchema', () => {
  const validData = {
    surah_number: 1,
    from_ayah: 1,
    to_ayah: 7,
    recitation_type: 'new_hifz' as const,
  };

  it('accepts valid minimal data', () => {
    const result = recitationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('accepts valid data with all optional fields', () => {
    const result = recitationSchema.safeParse({
      ...validData,
      accuracy_score: 5,
      tajweed_score: 4,
      fluency_score: 3,
      needs_repeat: true,
      mistake_notes: 'Missed one ayah',
    });
    expect(result.success).toBe(true);
  });

  it('rejects surah_number < 1', () => {
    const result = recitationSchema.safeParse({ ...validData, surah_number: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects surah_number > 114', () => {
    const result = recitationSchema.safeParse({ ...validData, surah_number: 115 });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer surah_number', () => {
    const result = recitationSchema.safeParse({ ...validData, surah_number: 1.5 });
    expect(result.success).toBe(false);
  });

  it('rejects to_ayah < from_ayah via refine', () => {
    const result = recitationSchema.safeParse({
      ...validData,
      from_ayah: 5,
      to_ayah: 3,
    });
    expect(result.success).toBe(false);
  });

  it('accepts to_ayah === from_ayah (single ayah)', () => {
    const result = recitationSchema.safeParse({
      ...validData,
      from_ayah: 3,
      to_ayah: 3,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid recitation_type', () => {
    const result = recitationSchema.safeParse({
      ...validData,
      recitation_type: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects score < 1', () => {
    const result = recitationSchema.safeParse({
      ...validData,
      accuracy_score: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects score > 5', () => {
    const result = recitationSchema.safeParse({
      ...validData,
      accuracy_score: 6,
    });
    expect(result.success).toBe(false);
  });

  it('accepts null scores', () => {
    const result = recitationSchema.safeParse({
      ...validData,
      accuracy_score: null,
      tajweed_score: null,
      fluency_score: null,
    });
    expect(result.success).toBe(true);
  });

  it('defaults needs_repeat to false', () => {
    const result = recitationSchema.safeParse(validData);
    if (result.success) {
      expect(result.data.needs_repeat).toBe(false);
    }
  });
});

// ─── assignmentSchema ───────────────────────────────────────────────────────

describe('assignmentSchema', () => {
  const validData = {
    student_id: '550e8400-e29b-41d4-a716-446655440000',
    surah_number: 2,
    from_ayah: 1,
    to_ayah: 10,
    assignment_type: 'new_hifz' as const,
    due_date: '2026-03-01',
  };

  it('accepts valid data', () => {
    const result = assignmentSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid UUID for student_id', () => {
    const result = assignmentSchema.safeParse({
      ...validData,
      student_id: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects to_ayah < from_ayah via refine', () => {
    const result = assignmentSchema.safeParse({
      ...validData,
      from_ayah: 10,
      to_ayah: 5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty due_date', () => {
    const result = assignmentSchema.safeParse({
      ...validData,
      due_date: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional notes', () => {
    const result = assignmentSchema.safeParse({
      ...validData,
      notes: 'Focus on tajweed rules',
    });
    expect(result.success).toBe(true);
  });
});
