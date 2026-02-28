import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RecitationFormData } from '@/features/memorization';
import type { AttendanceStatus } from '@/types/common.types';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EvalData {
  memorization_score: number | null;
  tajweed_score: number | null;
  recitation_quality: number | null;
  notes: string;
}

export interface WorkspaceDraft {
  attendanceStatuses: Record<string, AttendanceStatus>;
  evaluations: Record<string, EvalData>;
  recitations: Record<string, RecitationFormData[]>;
  savedAt: number;
}

// ─── Store Shape ─────────────────────────────────────────────────────────────

interface WorkspaceDraftState {
  drafts: Record<string, WorkspaceDraft>;
}

interface WorkspaceDraftActions {
  getDraft: (sessionId: string) => WorkspaceDraft | undefined;
  saveDraft: (sessionId: string, draft: Omit<WorkspaceDraft, 'savedAt'>) => void;
  clearDraft: (sessionId: string) => void;
  clearStaleDrafts: (maxAgeMs?: number) => void;
}

type WorkspaceDraftStore = WorkspaceDraftState & WorkspaceDraftActions;

// ─── Constants ───────────────────────────────────────────────────────────────

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// ─── Store ───────────────────────────────────────────────────────────────────

export const useWorkspaceDraftStore = create<WorkspaceDraftStore>()(
  persist(
    (set, get) => ({
      drafts: {},

      getDraft: (sessionId) => get().drafts[sessionId],

      saveDraft: (sessionId, draft) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [sessionId]: { ...draft, savedAt: Date.now() },
          },
        })),

      clearDraft: (sessionId) =>
        set((state) => {
          const { [sessionId]: _, ...rest } = state.drafts;
          return { drafts: rest };
        }),

      clearStaleDrafts: (maxAgeMs = SEVEN_DAYS_MS) =>
        set((state) => {
          const now = Date.now();
          const fresh: Record<string, WorkspaceDraft> = {};
          for (const [id, draft] of Object.entries(state.drafts)) {
            if (now - draft.savedAt < maxAgeMs) {
              fresh[id] = draft;
            }
          }
          return { drafts: fresh };
        }),
    }),
    {
      name: 'workspace-draft-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
