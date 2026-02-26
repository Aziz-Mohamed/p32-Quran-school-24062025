import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
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
import { TextField } from '@/components/ui/TextField';
import { Badge } from '@/components/ui/Badge';
import { useQuery } from '@tanstack/react-query';
import { QuranRangePicker } from '@/features/memorization/components/QuranRangePicker';
import { assignmentService } from '@/features/memorization/services/assignment.service';
import { useRevisionHomework, type HomeworkItem } from '@/features/gamification/hooks/useRevisionHomework';
import { useAllRubReferences, findRubForAyah } from '@/features/scheduling/hooks/useQuranRubReference';
import { getSurah } from '@/lib/quran-metadata';
import type { Tables } from '@/types/database.types';
import type {
  CreateRecitationPlanInput,
  SelectionMode,
  RecitationPlanType,
} from '@/features/scheduling/types/recitation-plan.types';

type RubReference = Tables<'quran_rub_reference'>;

// ─── Types ────────────────────────────────────────────────────────────────────

interface SelectedPlanItem {
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
}

interface RecitationPlanFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (inputs: CreateRecitationPlanInput[]) => void;
  sessionId: string;
  studentId?: string | null;
  schoolId: string;
  userId: string;
  sessionDate: string;
  initialItems?: SelectedPlanItem[];
  initialNotes?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeItemId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatRubContext(
  rubData: RubReference[],
  surah: number,
  ayah: number,
  t: (key: string) => string,
): string | null {
  const info = findRubForAyah(rubData, surah, ayah);
  if (!info) return null;
  return `${t('gamification.rub')} ${info.rub_number} · ${t('gamification.juz')} ${info.juz_number}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RecitationPlanForm({
  visible,
  onClose,
  onSave,
  sessionId,
  studentId,
  schoolId,
  userId,
  sessionDate,
  initialItems,
  initialNotes,
}: RecitationPlanFormProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  // ── Multi-item state ─────────────────────────────────────────────────
  const [selectedItems, setSelectedItems] = useState<SelectedPlanItem[]>([]);
  const [notes, setNotes] = useState('');

  // ── Custom range staging state ───────────────────────────────────────
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('ayah_range');
  const [surahNumber, setSurahNumber] = useState<number | null>(null);
  const [fromAyah, setFromAyah] = useState<number | null>(null);
  const [toAyah, setToAyah] = useState<number | null>(null);
  const [rubNumber, setRubNumber] = useState<number | null>(null);
  const [hizbNumber, setHizbNumber] = useState<number | null>(null);
  const [juzNumber, setJuzNumber] = useState<number | null>(null);
  const [resolvedStart, setResolvedStart] = useState<{ surah: number; ayah: number } | null>(null);
  const [resolvedEnd, setResolvedEnd] = useState<{ surah: number; ayah: number } | null>(null);

  // ── Data sources ────────────────────────────────────────────────────
  // Memorization section: pending new_hifz assignments (what the student chose to memorize)
  const { data: memorizationAssignments = [], isLoading: loadingMemo } = useQuery({
    queryKey: ['assignments', 'pending-new-hifz', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data, error } = await assignmentService.getAssignments({
        studentId,
        assignmentType: 'new_hifz',
        status: 'pending',
      });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!studentId,
    staleTime: 1000 * 60,
  });

  const { homeworkItems, pendingAssignments: hwAssignments, isLoading: loadingHomework } =
    useRevisionHomework(studentId ?? undefined);

  const { data: rubData = [] } = useAllRubReferences();

  // ── Reset form when modal opens ───────────────────────────────────────
  useEffect(() => {
    if (visible) {
      setSelectedItems(initialItems ?? []);
      setNotes(initialNotes ?? '');
      setShowCustomRange(false);
      resetCustomRange();
    }
  }, [visible, initialItems, initialNotes]);

  const resetCustomRange = useCallback(() => {
    setSelectionMode('ayah_range');
    setSurahNumber(null);
    setFromAyah(null);
    setToAyah(null);
    setRubNumber(null);
    setHizbNumber(null);
    setJuzNumber(null);
    setResolvedStart(null);
    setResolvedEnd(null);
  }, []);

  // ── Item matching helpers ───────────────────────────────────────────
  const isMemorizationItemSelected = useCallback(
    (assignmentId: string) =>
      selectedItems.some((s) => s.assignment_id === assignmentId),
    [selectedItems],
  );

  const isHomeworkItemSelected = useCallback(
    (hw: HomeworkItem) =>
      selectedItems.some((s) => s.assignment_id === hw.assignmentId),
    [selectedItems],
  );

  // ── Handlers ────────────────────────────────────────────────────────
  const handleResolvedRange = useCallback(
    (range: { start_surah: number; start_ayah: number; end_surah: number; end_ayah: number }) => {
      setResolvedStart({ surah: range.start_surah, ayah: range.start_ayah });
      setResolvedEnd({ surah: range.end_surah, ayah: range.end_ayah });
    },
    [],
  );

  const handleSurahChange = useCallback((surah: number) => {
    setSurahNumber(surah);
    setFromAyah(null);
    setToAyah(null);
  }, []);

  const handleToggleMemorizationItem = useCallback(
    (assignment: { id: string; surah_number: number; from_ayah: number; to_ayah: number }) => {
      setSelectedItems((prev) => {
        const existingIdx = prev.findIndex((s) => s.assignment_id === assignment.id);

        if (existingIdx >= 0) {
          return prev.filter((_, i) => i !== existingIdx);
        }

        return [
          ...prev,
          {
            id: makeItemId(),
            surah_number: assignment.surah_number,
            from_ayah: assignment.from_ayah,
            to_ayah: assignment.to_ayah,
            recitation_type: 'new_hifz' as RecitationPlanType,
            source: 'from_assignment' as const,
            assignment_id: assignment.id,
            selection_mode: 'ayah_range' as SelectionMode,
          },
        ];
      });
    },
    [],
  );

  const handleToggleHomeworkItem = useCallback(
    (hw: HomeworkItem) => {
      const assignment = (hwAssignments ?? []).find((a) => a.id === hw.assignmentId);
      if (!assignment) return;

      setSelectedItems((prev) => {
        const existingIdx = prev.findIndex((s) => s.assignment_id === hw.assignmentId);

        if (existingIdx >= 0) {
          return prev.filter((_, i) => i !== existingIdx);
        }

        return [
          ...prev,
          {
            id: makeItemId(),
            surah_number: assignment.surah_number,
            from_ayah: assignment.from_ayah,
            to_ayah: assignment.to_ayah,
            recitation_type: 'old_review' as RecitationPlanType,
            source: 'from_assignment' as const,
            assignment_id: assignment.id,
            selection_mode: 'ayah_range' as SelectionMode,
          },
        ];
      });
    },
    [hwAssignments],
  );

  const handleAddCustomRange = useCallback(() => {
    let itemSurah: number;
    let itemFromAyah: number;
    let itemEndSurah: number;
    let itemToAyah: number;
    let itemSelectionMode = selectionMode;
    let itemRub = rubNumber;
    let itemHizb = hizbNumber;
    let itemJuz = juzNumber;

    if (selectionMode === 'ayah_range') {
      if (surahNumber == null || fromAyah == null || toAyah == null) return;
      itemSurah = surahNumber;
      itemFromAyah = fromAyah;
      itemEndSurah = surahNumber;
      itemToAyah = toAyah;
    } else if (resolvedStart && resolvedEnd) {
      itemSurah = resolvedStart.surah;
      itemFromAyah = resolvedStart.ayah;
      itemEndSurah = resolvedEnd.surah;
      itemToAyah = resolvedEnd.ayah;
    } else {
      return;
    }

    setSelectedItems((prev) => [
      ...prev,
      {
        id: makeItemId(),
        surah_number: itemSurah,
        from_ayah: itemFromAyah,
        to_ayah: itemToAyah,
        end_surah: itemEndSurah,
        end_ayah: itemToAyah,
        recitation_type: 'new_hifz' as RecitationPlanType,
        source: 'manual' as const,
        assignment_id: null,
        selection_mode: itemSelectionMode,
        rub_number: itemSelectionMode === 'rub' ? itemRub : null,
        hizb_number: itemSelectionMode === 'hizb' ? itemHizb : null,
        juz_number: itemSelectionMode === 'juz' ? itemJuz : null,
      },
    ]);

    resetCustomRange();
  }, [
    selectionMode,
    surahNumber,
    fromAyah,
    toAyah,
    resolvedStart,
    resolvedEnd,
    rubNumber,
    hizbNumber,
    juzNumber,
    resetCustomRange,
  ]);

  const handleRemoveItem = useCallback((itemId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const customRangeValid = useMemo(() => {
    if (selectionMode === 'ayah_range') {
      return surahNumber != null && fromAyah != null && toAyah != null;
    }
    if (selectionMode === 'rub') return rubNumber != null;
    if (selectionMode === 'hizb') return hizbNumber != null;
    if (selectionMode === 'juz') return juzNumber != null;
    return false;
  }, [selectionMode, surahNumber, fromAyah, toAyah, rubNumber, hizbNumber, juzNumber]);

  const isValid = selectedItems.length > 0;

  const handleSave = useCallback(() => {
    if (!isValid) return;

    const inputs: CreateRecitationPlanInput[] = selectedItems.map((item) => ({
      school_id: schoolId,
      scheduled_session_id: sessionId,
      student_id: studentId ?? null,
      set_by: userId,
      selection_mode: item.selection_mode,
      start_surah: item.surah_number,
      start_ayah: item.from_ayah,
      end_surah: item.end_surah ?? item.surah_number,
      end_ayah: item.end_ayah ?? item.to_ayah,
      rub_number: item.rub_number ?? null,
      juz_number: item.juz_number ?? null,
      hizb_number: item.hizb_number ?? null,
      recitation_type: item.recitation_type,
      source: item.source,
      assignment_id: item.source === 'from_assignment' ? item.assignment_id : null,
      notes: notes.trim().length > 0 ? notes.trim() : null,
    }));

    onSave(inputs);
  }, [isValid, selectedItems, schoolId, sessionId, studentId, userId, notes, onSave]);

  // ── Render helpers ──────────────────────────────────────────────────
  const renderItemLabel = useCallback(
    (surah: number, fromA: number, toA: number) => {
      const surahData = getSurah(surah);
      const name = isArabic
        ? (surahData?.nameArabic ?? surahData?.nameEnglish ?? String(surah))
        : (surahData?.nameEnglish ?? String(surah));
      return `${name} ${fromA}–${toA}`;
    },
    [isArabic],
  );

  const renderRubContext = useCallback(
    (surah: number, ayah: number) => {
      if (rubData.length === 0) return null;
      return formatRubContext(rubData, surah, ayah, t);
    },
    [rubData, t],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {initialItems != null && initialItems.length > 0
                ? t('scheduling.recitationPlan.editPlan')
                : t('scheduling.recitationPlan.setPlan')}
            </Text>
            <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button">
              <Ionicons
                name="close"
                size={normalize(24)}
                color={lightTheme.textSecondary}
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Selected Items Cart ── */}
            {selectedItems.length > 0 && (
              <View style={styles.cartSection}>
                <Text style={styles.cartTitle}>
                  {t('scheduling.recitationPlan.selectedCount', { count: selectedItems.length })}
                </Text>
                {selectedItems.map((item) => {
                  const label = renderItemLabel(item.surah_number, item.from_ayah, item.to_ayah);
                  const rubCtx = renderRubContext(item.surah_number, item.from_ayah);
                  return (
                    <View key={item.id} style={styles.cartItem}>
                      <View style={styles.cartItemContent}>
                        <Text style={styles.cartItemLabel} numberOfLines={1}>
                          {label}
                        </Text>
                        {rubCtx && (
                          <Text style={styles.rubContext}>{rubCtx}</Text>
                        )}
                      </View>
                      <Pressable
                        onPress={() => handleRemoveItem(item.id)}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={t('common.remove')}
                      >
                        <Ionicons name="close-circle" size={normalize(20)} color={colors.semantic.error} />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}

            {/* ── Memorization Section ── */}
            {studentId != null && (
              <View style={styles.dataSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="book-outline" size={normalize(16)} color={colors.primary[600]} />
                  <Text style={styles.sectionTitle}>
                    {t('scheduling.recitationPlan.memorizationSection')}
                  </Text>
                </View>

                {loadingMemo ? (
                  <ActivityIndicator size="small" color={colors.primary[500]} style={styles.loader} />
                ) : memorizationAssignments.length === 0 ? (
                  <Text style={styles.emptyText}>
                    {t('scheduling.recitationPlan.noProgress')}
                  </Text>
                ) : (
                  <FlatList
                    data={memorizationAssignments}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    renderItem={({ item }) => {
                      const label = renderItemLabel(item.surah_number, item.from_ayah, item.to_ayah);
                      const rubCtx = renderRubContext(item.surah_number, item.from_ayah);
                      const selected = isMemorizationItemSelected(item.id);
                      return (
                        <Pressable
                          onPress={() => handleToggleMemorizationItem(item)}
                          style={({ pressed }) => [
                            styles.suggestionItem,
                            selected && styles.suggestionItemSelected,
                            pressed && styles.suggestionItemPressed,
                          ]}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: selected }}
                        >
                          <View style={styles.suggestionContent}>
                            <Ionicons
                              name={selected ? 'checkbox' : 'square-outline'}
                              size={normalize(18)}
                              color={selected ? colors.primary[500] : colors.neutral[400]}
                            />
                            <View style={styles.suggestionTextCol}>
                              <Text style={styles.suggestionLabel} numberOfLines={1}>
                                {label}
                              </Text>
                              {rubCtx && (
                                <Text style={styles.rubContext}>{rubCtx}</Text>
                              )}
                            </View>
                          </View>
                        </Pressable>
                      );
                    }}
                  />
                )}
              </View>
            )}

            {/* ── Revision Section ── */}
            {studentId != null && (
              <View style={styles.dataSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="refresh-outline" size={normalize(16)} color={colors.accent.sky[600]} />
                  <Text style={styles.sectionTitle}>
                    {t('scheduling.recitationPlan.revisionSection')}
                  </Text>
                </View>

                {loadingHomework ? (
                  <ActivityIndicator size="small" color={colors.primary[500]} style={styles.loader} />
                ) : homeworkItems.length === 0 ? (
                  <Text style={styles.emptyText}>
                    {t('scheduling.recitationPlan.noHomework')}
                  </Text>
                ) : (
                  <FlatList
                    data={homeworkItems}
                    keyExtractor={(item) => item.assignmentId}
                    scrollEnabled={false}
                    renderItem={({ item: hw }) => {
                      const assignment = (hwAssignments ?? []).find(
                        (a) => a.id === hw.assignmentId,
                      );
                      const surah = assignment ? getSurah(assignment.surah_number) : null;
                      const surahName = surah
                        ? (isArabic ? (surah.nameArabic ?? surah.nameEnglish) : surah.nameEnglish)
                        : null;
                      const label = surahName
                        ? `${surahName} ${assignment!.from_ayah}–${assignment!.to_ayah}`
                        : `${t('gamification.rub')} ${hw.rubNumber}`;
                      const rubCtx = assignment
                        ? renderRubContext(assignment.surah_number, assignment.from_ayah)
                        : null;
                      const selected = isHomeworkItemSelected(hw);
                      return (
                        <Pressable
                          onPress={() => handleToggleHomeworkItem(hw)}
                          style={({ pressed }) => [
                            styles.suggestionItem,
                            selected && styles.suggestionItemSelected,
                            pressed && styles.suggestionItemPressed,
                          ]}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: selected }}
                        >
                          <View style={styles.suggestionContent}>
                            <Ionicons
                              name={selected ? 'checkbox' : 'square-outline'}
                              size={normalize(18)}
                              color={selected ? colors.primary[500] : colors.neutral[400]}
                            />
                            <View style={styles.suggestionTextCol}>
                              <Text style={styles.suggestionLabel} numberOfLines={1}>
                                {label}
                              </Text>
                              {rubCtx && (
                                <Text style={styles.rubContext}>{rubCtx}</Text>
                              )}
                            </View>
                            <Badge
                              label={`${t('gamification.rub')} ${hw.rubNumber}`}
                              variant="sky"
                              size="sm"
                            />
                          </View>
                        </Pressable>
                      );
                    }}
                  />
                )}
              </View>
            )}

            {/* ── Custom Range (foldable) ── */}
            <Pressable
              onPress={() => setShowCustomRange((prev) => !prev)}
              style={styles.customRangeToggle}
              accessibilityRole="button"
            >
              <Ionicons
                name="create-outline"
                size={normalize(18)}
                color={colors.neutral[600]}
              />
              <Text style={styles.customRangeText}>
                {t('scheduling.recitationPlan.customRange')}
              </Text>
              <Ionicons
                name={showCustomRange ? 'chevron-up' : 'chevron-down'}
                size={normalize(18)}
                color={lightTheme.textTertiary}
              />
            </Pressable>

            {showCustomRange && (
              <View style={styles.customRangeContent}>
                <QuranRangePicker
                  selectionMode={selectionMode}
                  onChangeSelectionMode={setSelectionMode}
                  surahNumber={surahNumber}
                  fromAyah={fromAyah}
                  toAyah={toAyah}
                  onChangeSurah={handleSurahChange}
                  onChangeFromAyah={setFromAyah}
                  onChangeToAyah={setToAyah}
                  rubNumber={rubNumber}
                  hizbNumber={hizbNumber}
                  juzNumber={juzNumber}
                  onChangeRub={setRubNumber}
                  onChangeHizb={setHizbNumber}
                  onChangeJuz={setJuzNumber}
                  onResolvedRange={handleResolvedRange}
                />

                {/* Rub context for staged custom range */}
                {selectionMode === 'ayah_range' && surahNumber != null && fromAyah != null && (
                  <Text style={styles.rubContextStaged}>
                    {renderRubContext(surahNumber, fromAyah) ?? ''}
                  </Text>
                )}

                <Button
                  title={t('scheduling.recitationPlan.addCustomRange')}
                  onPress={handleAddCustomRange}
                  variant="secondary"
                  size="sm"
                  disabled={!customRangeValid}
                  icon={
                    <Ionicons
                      name="add-circle-outline"
                      size={normalize(16)}
                      color={customRangeValid ? colors.primary[600] : colors.neutral[400]}
                    />
                  }
                  style={styles.addButton}
                />
              </View>
            )}

            {/* Notes */}
            <TextField
              label={t('common.notes')}
              placeholder=""
              value={notes}
              onChangeText={setNotes}
              multiline
              style={styles.section}
            />
          </ScrollView>

          {/* Footer buttons */}
          <View style={styles.footer}>
            <Button
              title={t('common.cancel')}
              onPress={onClose}
              variant="ghost"
              size="md"
              style={styles.footerButton}
            />
            <Button
              title={
                selectedItems.length > 0
                  ? `${t('common.save')} (${selectedItems.length})`
                  : t('common.save')
              }
              onPress={handleSave}
              variant="primary"
              size="md"
              disabled={!isValid}
              style={styles.footerButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: lightTheme.overlay,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '90%',
    ...shadows.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.border,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.lg,
    color: lightTheme.text,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.base,
  },
  section: {
    marginTop: spacing.xs,
  },
  // ── Cart ──
  cartSection: {
    backgroundColor: colors.primary[50],
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary[200],
    gap: spacing.xs,
  },
  cartTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.primary[700],
    paddingHorizontal: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
  },
  cartItemContent: {
    flex: 1,
    marginEnd: spacing.sm,
  },
  cartItemLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.primary[700],
  },
  // ── Data sections ──
  dataSection: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: lightTheme.text,
  },
  loader: {
    paddingVertical: spacing.md,
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: lightTheme.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  // ── Suggestion items ──
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  suggestionItemSelected: {
    backgroundColor: colors.primary[50],
  },
  suggestionItemPressed: {
    backgroundColor: colors.neutral[100],
  },
  suggestionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  suggestionTextCol: {
    flex: 1,
    flexShrink: 1,
  },
  suggestionLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: lightTheme.text,
  },
  rubContext: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: lightTheme.textTertiary,
    marginTop: normalize(1),
  },
  rubContextStaged: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: lightTheme.textTertiary,
    paddingHorizontal: spacing.sm,
  },
  // ── Custom range ──
  customRangeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  customRangeText: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.neutral[700],
  },
  customRangeContent: {
    gap: spacing.sm,
  },
  addButton: {
    alignSelf: 'flex-end',
  },
  // ── Footer ──
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    borderTopWidth: 1,
    borderTopColor: lightTheme.border,
  },
  footerButton: {
    flex: 1,
  },
});
