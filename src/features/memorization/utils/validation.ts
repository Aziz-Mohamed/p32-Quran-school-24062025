import { z } from 'zod';

export const recitationSchema = z.object({
  surah_number: z.number().int().min(1).max(114),
  from_ayah: z.number().int().min(1),
  to_ayah: z.number().int().min(1),
  recitation_type: z.enum(['new_hifz', 'recent_review', 'old_review']),
  accuracy_score: z.number().int().min(1).max(5).nullable().optional(),
  tajweed_score: z.number().int().min(1).max(5).nullable().optional(),
  fluency_score: z.number().int().min(1).max(5).nullable().optional(),
  needs_repeat: z.boolean().default(false),
  mistake_notes: z.string().nullable().optional(),
}).refine(
  (data) => data.to_ayah >= data.from_ayah,
  { message: 'to_ayah must be >= from_ayah', path: ['to_ayah'] }
);

export type RecitationFormValues = z.infer<typeof recitationSchema>;

export const assignmentSchema = z.object({
  student_id: z.string().uuid(),
  surah_number: z.number().int().min(1).max(114),
  from_ayah: z.number().int().min(1),
  to_ayah: z.number().int().min(1),
  assignment_type: z.enum(['new_hifz', 'recent_review', 'old_review']),
  due_date: z.string().min(1),
  notes: z.string().nullable().optional(),
}).refine(
  (data) => data.to_ayah >= data.from_ayah,
  { message: 'to_ayah must be >= from_ayah', path: ['to_ayah'] }
);

export type AssignmentFormValues = z.infer<typeof assignmentSchema>;
