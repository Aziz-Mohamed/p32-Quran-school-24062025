import { useState, useEffect, useRef, useCallback } from 'react';
import { useWorkspaceDraftStore, type EvalData } from '@/stores/workspaceDraftStore';
import type { RecitationFormData } from '@/features/memorization';
import type { AttendanceStatus } from '@/types/common.types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UseWorkspaceDraftReturn {
  attendanceStatuses: Record<string, AttendanceStatus>;
  evaluations: Record<string, EvalData>;
  recitations: Record<string, RecitationFormData[]>;
  setAttendanceStatuses: React.Dispatch<React.SetStateAction<Record<string, AttendanceStatus>>>;
  setEvaluations: React.Dispatch<React.SetStateAction<Record<string, EvalData>>>;
  setRecitations: React.Dispatch<React.SetStateAction<Record<string, RecitationFormData[]>>>;
  restoredFromDraft: boolean;
  clearDraft: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 500;

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useWorkspaceDraft(sessionId: string | undefined): UseWorkspaceDraftReturn {
  const { getDraft, saveDraft, clearDraft: clearStoreDraft } = useWorkspaceDraftStore();

  // Restore draft on mount (computed once)
  const existingDraft = sessionId ? getDraft(sessionId) : undefined;
  const restoredFromDraft = useRef(!!existingDraft);

  // Initialize state from draft or empty defaults
  const [attendanceStatuses, setAttendanceStatuses] = useState<Record<string, AttendanceStatus>>(
    existingDraft?.attendanceStatuses ?? {},
  );
  const [evaluations, setEvaluations] = useState<Record<string, EvalData>>(
    existingDraft?.evaluations ?? {},
  );
  const [recitations, setRecitations] = useState<Record<string, RecitationFormData[]>>(
    existingDraft?.recitations ?? {},
  );

  // Keep a ref to the latest state for the unmount flush
  const latestRef = useRef({ attendanceStatuses, evaluations, recitations });
  useEffect(() => {
    latestRef.current = { attendanceStatuses, evaluations, recitations };
  });

  // Debounced auto-save on state changes
  useEffect(() => {
    if (!sessionId) return;

    const timer = setTimeout(() => {
      saveDraft(sessionId, {
        attendanceStatuses,
        evaluations,
        recitations,
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [sessionId, attendanceStatuses, evaluations, recitations, saveDraft]);

  // Flush final state on unmount
  useEffect(() => {
    return () => {
      if (sessionId) {
        saveDraft(sessionId, latestRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const clearDraft = useCallback(() => {
    if (sessionId) {
      clearStoreDraft(sessionId);
    }
  }, [sessionId, clearStoreDraft]);

  return {
    attendanceStatuses,
    evaluations,
    recitations,
    setAttendanceStatuses,
    setEvaluations,
    setRecitations,
    restoredFromDraft: restoredFromDraft.current,
    clearDraft,
  };
}
