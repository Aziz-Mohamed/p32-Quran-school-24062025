import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  useUpsertRecitationPlan,
  useDeleteRecitationPlan,
  useSetUnifiedPlan,
  useReplaceStudentSuggestions,
  useDeleteStudentSuggestion,
} from './useRecitationPlans';
import type {
  CreateRecitationPlanInput,
  RecitationPlanWithDetails,
} from '../types/recitation-plan.types';
import { plansToSelectedItems } from '../utils/plan-conversion';

export { plansToSelectedItems } from '../utils/plan-conversion';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseSessionRecitationPlanActionsInput {
  sessionId: string;
  userId: string;
  plans: RecitationPlanWithDetails[];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSessionRecitationPlanActions({
  sessionId,
  userId,
  plans,
}: UseSessionRecitationPlanActionsInput) {
  const { t } = useTranslation();

  // ── Mutations ────────────────────────────────────────────────────────
  const upsertMutation = useUpsertRecitationPlan();
  const deleteMutation = useDeleteRecitationPlan();
  const setUnifiedMutation = useSetUnifiedPlan();
  const replaceSuggestionsMutation = useReplaceStudentSuggestions();
  const deleteSuggestionMutation = useDeleteStudentSuggestion();

  // ── Form state (teacher) ────────────────────────────────────────────
  const [formVisible, setFormVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<RecitationPlanWithDetails | null>(null);
  const [formStudentId, setFormStudentId] = useState<string | null>(null);
  const [isSetForAll, setIsSetForAll] = useState(false);

  // ── Form state (student suggestion) ─────────────────────────────────
  const [suggestionFormVisible, setSuggestionFormVisible] = useState(false);

  // ── Derived data ────────────────────────────────────────────────────
  const sessionDefaultPlan = useMemo(
    () => plans.find((p) => p.student_id == null) ?? null,
    [plans],
  );

  const studentPlans = useMemo(
    () => plans.filter((p) => p.student_id != null),
    [plans],
  );

  const studentPlanMap = useMemo(() => {
    const map = new Map<string, RecitationPlanWithDetails>();
    for (const plan of studentPlans) {
      if (plan.student_id && plan.source !== 'student_suggestion') {
        map.set(plan.student_id, plan);
      }
    }
    return map;
  }, [studentPlans]);

  const studentSuggestionsMap = useMemo(() => {
    const map = new Map<string, RecitationPlanWithDetails[]>();
    for (const plan of studentPlans) {
      if (plan.student_id && plan.source === 'student_suggestion') {
        const existing = map.get(plan.student_id) ?? [];
        existing.push(plan);
        map.set(plan.student_id, existing);
      }
    }
    return map;
  }, [studentPlans]);

  // ── Teacher handlers ────────────────────────────────────────────────
  const openFormForStudent = useCallback(
    (studentId: string | null, existing?: RecitationPlanWithDetails) => {
      setFormStudentId(studentId);
      setEditingPlan(existing ?? null);
      setIsSetForAll(false);
      setFormVisible(true);
    },
    [],
  );

  const openSetForAll = useCallback(() => {
    Alert.alert(
      t('scheduling.recitationPlan.setForAll'),
      t('scheduling.recitationPlan.setForAllWarning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: () => {
            setFormStudentId(null);
            setEditingPlan(sessionDefaultPlan);
            setIsSetForAll(true);
            setFormVisible(true);
          },
        },
      ],
    );
  }, [t, sessionDefaultPlan]);

  const handleTeacherSave = useCallback(
    (inputs: CreateRecitationPlanInput[]) => {
      const input = inputs[0];
      if (!input) return;

      if (isSetForAll) {
        setUnifiedMutation.mutate(input, {
          onSuccess: () => setFormVisible(false),
        });
      } else {
        upsertMutation.mutate(input, {
          onSuccess: () => setFormVisible(false),
        });
      }
    },
    [isSetForAll, setUnifiedMutation, upsertMutation],
  );

  const handleDelete = useCallback(
    (plan: RecitationPlanWithDetails) => {
      Alert.alert(
        t('scheduling.recitationPlan.removePlan'),
        '',
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: () => deleteMutation.mutate(plan.id),
          },
        ],
      );
    },
    [t, deleteMutation],
  );

  const handleCloseForm = useCallback(() => {
    setFormVisible(false);
    setEditingPlan(null);
    setFormStudentId(null);
    setIsSetForAll(false);
  }, []);

  // ── Student suggestion handlers ─────────────────────────────────────
  const openSuggestionForm = useCallback(() => {
    setSuggestionFormVisible(true);
  }, []);

  const handleSaveSuggestions = useCallback(
    (inputs: CreateRecitationPlanInput[]) => {
      replaceSuggestionsMutation.mutate(
        {
          sessionId,
          studentId: userId,
          inputs: inputs.map((i) => ({ ...i, source: 'student_suggestion' as const })),
        },
        {
          onSuccess: () => setSuggestionFormVisible(false),
          onError: (err) => Alert.alert(t('common.error'), err.message),
        },
      );
    },
    [replaceSuggestionsMutation, sessionId, userId, t],
  );

  const handleDeleteSuggestions = useCallback(() => {
    Alert.alert(
      t('scheduling.recitationPlan.removeSuggestion'),
      '',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteSuggestionMutation.mutate({ sessionId, studentId: userId }),
        },
      ],
    );
  }, [t, deleteSuggestionMutation, sessionId, userId]);

  const handleCloseSuggestionForm = useCallback(() => {
    setSuggestionFormVisible(false);
  }, []);

  // ── Form initial data ───────────────────────────────────────────────
  const teacherFormInitialItems = useMemo(() => {
    if (!editingPlan) return undefined;
    return plansToSelectedItems([editingPlan]);
  }, [editingPlan]);

  const teacherFormInitialNotes = useMemo(() => {
    return editingPlan?.notes ?? undefined;
  }, [editingPlan]);

  const mySuggestions = useMemo(
    () => studentSuggestionsMap.get(userId) ?? [],
    [studentSuggestionsMap, userId],
  );

  const suggestionInitialItems = useMemo(() => {
    if (mySuggestions.length === 0) return undefined;
    return plansToSelectedItems(mySuggestions);
  }, [mySuggestions]);

  const suggestionInitialNotes = useMemo(() => {
    return mySuggestions[0]?.notes ?? undefined;
  }, [mySuggestions]);

  return {
    // Derived data
    sessionDefaultPlan,
    studentPlanMap,
    studentSuggestionsMap,
    mySuggestions,

    // Teacher form state
    formVisible,
    formStudentId,
    isSetForAll,
    teacherFormInitialItems,
    teacherFormInitialNotes,

    // Student suggestion form state
    suggestionFormVisible,
    suggestionInitialItems,
    suggestionInitialNotes,

    // Teacher actions
    openFormForStudent,
    openSetForAll,
    handleTeacherSave,
    handleDelete,
    handleCloseForm,

    // Student suggestion actions
    openSuggestionForm,
    handleSaveSuggestions,
    handleDeleteSuggestions,
    handleCloseSuggestionForm,
  };
}
