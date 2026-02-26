import React, { useState, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { colors, lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RecitationPlanCard } from './RecitationPlanCard';
import { RecitationPlanForm } from './RecitationPlanForm';
import {
  useSessionRecitationPlans,
  useUpsertRecitationPlan,
  useDeleteRecitationPlan,
  useSetUnifiedPlan,
  useReplaceStudentSuggestions,
  useDeleteStudentSuggestion,
} from '@/features/scheduling/hooks/useRecitationPlans';
import type {
  CreateRecitationPlanInput,
  RecitationPlanWithDetails,
  SelectionMode,
  RecitationPlanType,
} from '@/features/scheduling/types/recitation-plan.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert DB plan rows to SelectedPlanItem[] for form pre-population */
function plansToSelectedItems(
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface SessionRecitationPlanListProps {
  sessionId: string;
  schoolId: string;
  userId: string;
  sessionDate: string;
  role: 'teacher' | 'student';
  isClassSession: boolean;
  students?: Array<{ id: string; name: string }>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SessionRecitationPlanList({
  sessionId,
  schoolId,
  userId,
  sessionDate,
  role,
  isClassSession,
  students,
}: SessionRecitationPlanListProps) {
  const { t } = useTranslation();

  // ── Data fetching ─────────────────────────────────────────────────────
  const { data: plans = [], isLoading } = useSessionRecitationPlans(sessionId);
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

  // ── Derived data ──────────────────────────────────────────────────────
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

  // Now holds arrays — multiple suggestions per student
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

  const isTeacher = role === 'teacher';

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
      // Teacher plans are constrained to one per (session, student) — use the first item
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
          inputs: inputs.map((i) => ({ ...i, source: 'student_suggestion' as any })),
        },
        {
          onSuccess: () => setSuggestionFormVisible(false),
          onError: (err) => Alert.alert(t('common.error'), err.message),
        },
      );
    },
    [replaceSuggestionsMutation, sessionId, userId],
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

  // ── Form initial data ─────────────────────────────────────────────────
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
    // Use notes from the first suggestion (shared across items)
    return mySuggestions[0]?.notes ?? undefined;
  }, [mySuggestions]);

  // ── Loading state ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={colors.primary[500]} />
      </View>
    );
  }

  // ── Student view ──────────────────────────────────────────────────────
  if (!isTeacher) {
    const teacherPlan = studentPlans.find(
      (p) => p.student_id === userId && p.source !== 'student_suggestion',
    ) ?? sessionDefaultPlan;

    return (
      <View style={styles.section}>
        {/* Teacher's plan (read-only) */}
        {teacherPlan != null && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                {t('scheduling.recitationPlan.myPlan')}
              </Text>
              {teacherPlan.student_id == null && (
                <Badge
                  label={t('scheduling.recitationPlan.sessionDefault')}
                  variant="info"
                  size="sm"
                />
              )}
            </View>
            <RecitationPlanCard
              plan={teacherPlan}
              canManage={false}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </>
        )}

        {/* Student suggestion section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {t('scheduling.recitationPlan.mySuggestion')}
          </Text>
          {mySuggestions.length > 0 && (
            <Button
              title={t('scheduling.recitationPlan.editPlan')}
              onPress={openSuggestionForm}
              variant="ghost"
              size="sm"
              icon={
                <Ionicons
                  name="create-outline"
                  size={normalize(16)}
                  color={colors.primary[600]}
                />
              }
            />
          )}
        </View>

        {mySuggestions.length > 0 ? (
          <View style={styles.suggestionsContainer}>
            {mySuggestions.map((suggestion) => (
              <RecitationPlanCard
                key={suggestion.id}
                plan={suggestion}
                canManage
                onEdit={openSuggestionForm}
                onDelete={handleDeleteSuggestions}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="bulb-outline"
              size={normalize(24)}
              color={lightTheme.textTertiary}
            />
            <Text style={styles.emptyText}>
              {t('scheduling.recitationPlan.noSuggestionYet')}
            </Text>
            <Text style={styles.hintText}>
              {t('scheduling.recitationPlan.suggestionHint')}
            </Text>
            <Button
              title={t('scheduling.recitationPlan.suggestPlan')}
              onPress={openSuggestionForm}
              variant="primary"
              size="sm"
              icon={
                <Ionicons
                  name="add-circle-outline"
                  size={normalize(16)}
                  color={colors.white}
                />
              }
              style={styles.emptyButton}
            />
          </View>
        )}

        {/* Suggestion form modal */}
        <RecitationPlanForm
          visible={suggestionFormVisible}
          onClose={handleCloseSuggestionForm}
          onSave={handleSaveSuggestions}
          sessionId={sessionId}
          studentId={userId}
          schoolId={schoolId}
          userId={userId}
          sessionDate={sessionDate}
          initialItems={suggestionInitialItems}
          initialNotes={suggestionInitialNotes}
        />
      </View>
    );
  }

  // ── Teacher view ──────────────────────────────────────────────────────
  return (
    <View style={styles.section}>
      {/* Section header with "Set for All" button */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>
          {t('scheduling.recitationPlan.title')}
        </Text>
        {isClassSession && (
          <Button
            title={t('scheduling.recitationPlan.setForAll')}
            onPress={openSetForAll}
            variant="secondary"
            size="sm"
            icon={
              <Ionicons
                name="layers-outline"
                size={normalize(16)}
                color={colors.primary[500]}
              />
            }
          />
        )}
      </View>

      {/* Session default plan */}
      {sessionDefaultPlan != null && (
        <View style={styles.defaultPlanContainer}>
          <Badge
            label={t('scheduling.recitationPlan.sessionDefault')}
            variant="info"
            size="sm"
          />
          <RecitationPlanCard
            plan={sessionDefaultPlan}
            canManage
            onEdit={() => openFormForStudent(null, sessionDefaultPlan)}
            onDelete={() => handleDelete(sessionDefaultPlan)}
          />
        </View>
      )}

      {/* Per-student plans */}
      {students != null &&
        students.map((student) => {
          const studentPlan = studentPlanMap.get(student.id);
          const studentSuggestions = studentSuggestionsMap.get(student.id) ?? [];

          return (
            <View key={student.id} style={styles.studentRow}>
              <View style={styles.studentHeader}>
                <View style={styles.studentNameRow}>
                  <Ionicons
                    name="person-outline"
                    size={normalize(16)}
                    color={lightTheme.textSecondary}
                  />
                  <Text style={styles.studentName} numberOfLines={1}>
                    {student.name}
                  </Text>
                </View>

                {studentPlan == null ? (
                  <Button
                    title={t('scheduling.recitationPlan.setPlan')}
                    onPress={() => openFormForStudent(student.id)}
                    variant="ghost"
                    size="sm"
                    icon={
                      <Ionicons
                        name="add-circle-outline"
                        size={normalize(16)}
                        color={colors.primary[600]}
                      />
                    }
                  />
                ) : null}
              </View>

              {studentPlan != null ? (
                <RecitationPlanCard
                  plan={studentPlan}
                  canManage
                  onEdit={() => openFormForStudent(student.id, studentPlan)}
                  onDelete={() => handleDelete(studentPlan)}
                />
              ) : sessionDefaultPlan != null ? (
                <View style={styles.inheritedBadge}>
                  <Badge
                    label={t('scheduling.recitationPlan.sessionDefault')}
                    variant="default"
                    size="sm"
                  />
                </View>
              ) : (
                <View style={styles.noPlanRow}>
                  <Text style={styles.noPlanText}>
                    {t('scheduling.recitationPlan.noPlanSet')}
                  </Text>
                </View>
              )}

              {/* Student suggestions (read-only for teacher) */}
              {studentSuggestions.length > 0 && (
                <View style={styles.suggestionContainer}>
                  <Badge
                    label={t('scheduling.recitationPlan.studentSuggestion')}
                    variant="warning"
                    size="sm"
                  />
                  {studentSuggestions.map((suggestion) => (
                    <RecitationPlanCard
                      key={suggestion.id}
                      plan={suggestion}
                      canManage={false}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  ))}
                </View>
              )}
            </View>
          );
        })}

      {/* No students provided and no session default (private session) */}
      {students == null && sessionDefaultPlan == null && (
        <View style={styles.emptyState}>
          <Ionicons
            name="document-text-outline"
            size={normalize(24)}
            color={lightTheme.textTertiary}
          />
          <Text style={styles.emptyText}>
            {t('scheduling.recitationPlan.noPlanSet')}
          </Text>
          <Button
            title={t('scheduling.recitationPlan.setPlan')}
            onPress={() => openFormForStudent(null)}
            variant="primary"
            size="sm"
            icon={
              <Ionicons
                name="add-circle-outline"
                size={normalize(16)}
                color={colors.white}
              />
            }
            style={styles.emptyButton}
          />
        </View>
      )}

      {/* Form modal */}
      <RecitationPlanForm
        visible={formVisible}
        onClose={handleCloseForm}
        onSave={handleTeacherSave}
        sessionId={sessionId}
        studentId={formStudentId}
        schoolId={schoolId}
        userId={userId}
        sessionDate={sessionDate}
        initialItems={teacherFormInitialItems}
        initialNotes={teacherFormInitialNotes}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loaderContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  section: {
    gap: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    color: lightTheme.text,
  },
  defaultPlanContainer: {
    gap: spacing.sm,
  },
  studentRow: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: lightTheme.border,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  studentName: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.base,
    color: lightTheme.text,
    flex: 1,
  },
  inheritedBadge: {
    paddingStart: spacing.xl,
  },
  noPlanRow: {
    paddingStart: spacing.xl,
    paddingVertical: spacing.xs,
  },
  noPlanText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: lightTheme.textTertiary,
    fontStyle: 'italic',
  },
  suggestionContainer: {
    gap: spacing.sm,
    paddingStart: spacing.xl,
  },
  suggestionsContainer: {
    gap: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: lightTheme.textTertiary,
  },
  hintText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: lightTheme.textTertiary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyButton: {
    marginTop: spacing.sm,
  },
});
