// ─── Types ───────────────────────────────────────────────────────────────────
export type {
  CreateRecitationInput,
  CreateAssignmentInput,
  RecitationFilters,
  AssignmentFilters,
  ProgressFilters,
  RevisionScheduleItem,
  MemorizationStats,
  Recitation,
  MemorizationProgress,
  MemorizationAssignment,
} from './types/memorization.types';

// ─── Services ────────────────────────────────────────────────────────────────
export { recitationService } from './services/recitation.service';
export { memorizationProgressService } from './services/memorization-progress.service';
export { assignmentService } from './services/assignment.service';
export { revisionScheduleService } from './services/revision-schedule.service';

// ─── Hooks ───────────────────────────────────────────────────────────────────
export { useCreateRecitation, useCreateRecitations, useRecitations, useSessionRecitations } from './hooks/useRecitations';
export { useMemorizationProgress, useUpsertProgress } from './hooks/useMemorizationProgress';
export { useCreateAssignment, useAssignments, useCompleteAssignment, useCompleteRevisionHomework, useCancelAssignment } from './hooks/useAssignments';
export { useRevisionSchedule } from './hooks/useRevisionSchedule';
export { useMemorizationStats } from './hooks/useMemorizationStats';

// ─── Utils ───────────────────────────────────────────────────────────────────
export { calculateSM2, calculateQualityGrade, classifyReviewType } from './utils/spaced-repetition';
export { recitationSchema, assignmentSchema } from './utils/validation';

// ─── Components ──────────────────────────────────────────────────────────────
export { SurahAyahPicker } from './components/SurahAyahPicker';
export { RecitationTypeChip, RecitationTypeChips } from './components/RecitationTypeChip';
export { RecitationForm, EMPTY_RECITATION, validateRecitationForm } from './components/RecitationForm';
export type { RecitationFormData } from './components/RecitationForm';
export { RevisionCard } from './components/RevisionCard';
export { MemorizationProgressBar } from './components/MemorizationProgressBar';
export { MemorizationHealthCard } from './components/MemorizationHealthCard';
export { MemorizationRow } from './components/MemorizationRow';
