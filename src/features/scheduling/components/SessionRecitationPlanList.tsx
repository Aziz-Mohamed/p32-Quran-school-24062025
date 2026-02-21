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
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { normalize } from '@/theme/normalize';
import { shadows } from '@/theme/shadows';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RecitationPlanCard } from './RecitationPlanCard';
import { RecitationPlanForm } from './RecitationPlanForm';
import {
  useSessionRecitationPlans,
  useUpsertRecitationPlan,
  useDeleteRecitationPlan,
  useSetUnifiedPlan,
} from '@/features/scheduling/hooks/useRecitationPlans';
import type {
  CreateRecitationPlanInput,
  RecitationPlanWithDetails,
} from '@/features/scheduling/types/recitation-plan.types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SessionRecitationPlanListProps {
  sessionId: string;
  schoolId: string;
  userId: string;
  sessionDate: string;
  role: 'teacher' | 'student';
  isClassSession: boolean;
  students?: Array<{ id: string; name: string }>;
}

// ─── Component ───────────────────────────────────────────────────────────────

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

  // ── Form state ────────────────────────────────────────────────────────
  const [formVisible, setFormVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<RecitationPlanWithDetails | null>(null);
  const [formStudentId, setFormStudentId] = useState<string | null>(null);
  const [isSetForAll, setIsSetForAll] = useState(false);

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
      if (plan.student_id) {
        map.set(plan.student_id, plan);
      }
    }
    return map;
  }, [studentPlans]);

  const isTeacher = role === 'teacher';

  // ── Handlers ──────────────────────────────────────────────────────────
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
          text: t('common.continue'),
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

  const handleSave = useCallback(
    (input: CreateRecitationPlanInput) => {
      if (isSetForAll) {
        setUnifiedMutation.mutate(input, {
          onSuccess: () => {
            setFormVisible(false);
          },
        });
      } else {
        upsertMutation.mutate(input, {
          onSuccess: () => {
            setFormVisible(false);
          },
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
            onPress: () => {
              deleteMutation.mutate(plan.id);
            },
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

  // ── Form initial data ─────────────────────────────────────────────────
  const formInitialData = useMemo(() => {
    if (editingPlan == null) return undefined;
    return {
      selection_mode: editingPlan.selection_mode as CreateRecitationPlanInput['selection_mode'],
      start_surah: editingPlan.start_surah,
      start_ayah: editingPlan.start_ayah,
      end_surah: editingPlan.end_surah,
      end_ayah: editingPlan.end_ayah,
      rub_number: editingPlan.rub_number,
      hizb_number: editingPlan.hizb_number,
      juz_number: editingPlan.juz_number,
      recitation_type: editingPlan.recitation_type as CreateRecitationPlanInput['recitation_type'],
      notes: editingPlan.notes,
      source: editingPlan.source as CreateRecitationPlanInput['source'],
      assignment_id: editingPlan.assignment_id,
    };
  }, [editingPlan]);

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
    // Find the student's own plan or fallback to session default
    const myPlan = studentPlans.find((p) => p.set_by === userId) ?? sessionDefaultPlan;

    if (myPlan == null) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('scheduling.recitationPlan.myPlan')}
          </Text>
          <View style={styles.emptyState}>
            <Ionicons
              name="document-text-outline"
              size={normalize(24)}
              color={lightTheme.textTertiary}
            />
            <Text style={styles.emptyText}>
              {t('scheduling.recitationPlan.noPlanSet')}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {t('scheduling.recitationPlan.myPlan')}
          </Text>
          {myPlan.student_id == null && (
            <Badge
              label={t('scheduling.recitationPlan.sessionDefault')}
              variant="info"
              size="sm"
            />
          )}
        </View>
        <RecitationPlanCard
          plan={myPlan}
          canManage={false}
          onEdit={() => {}}
          onDelete={() => {}}
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
        onSave={handleSave}
        sessionId={sessionId}
        studentId={formStudentId}
        schoolId={schoolId}
        userId={userId}
        sessionDate={sessionDate}
        initialData={formInitialData}
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
  emptyButton: {
    marginTop: spacing.sm,
  },
});
