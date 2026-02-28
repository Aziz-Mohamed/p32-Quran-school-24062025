import { create } from 'zustand';

// ─── Store Shape ────────────────────────────────────────────────────────────

interface UIState {
  /** Number of open modals/sheets. Tab bar hides when > 0. */
  openModalCount: number;
}

interface UIActions {
  /** Call when a modal or bottom sheet opens. */
  pushModal: () => void;
  /** Call when a modal or bottom sheet closes. */
  popModal: () => void;
}

type UIStore = UIState & UIActions;

// ─── Store ──────────────────────────────────────────────────────────────────

export const useUIStore = create<UIStore>()((set) => ({
  openModalCount: 0,

  pushModal: () =>
    set((state) => ({ openModalCount: state.openModalCount + 1 })),

  popModal: () =>
    set((state) => ({ openModalCount: Math.max(0, state.openModalCount - 1) })),
}));
