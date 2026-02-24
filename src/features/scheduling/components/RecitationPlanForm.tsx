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
import { QuranRangePicker } from '@/features/memorization/components/QuranRangePicker';
import { RecitationTypeChips } from '@/features/memorization/components/RecitationTypeChip';
import { useMemorizationProgress } from '@/features/memorization/hooks/useMemorizationProgress';
import { useRevisionHomework, type HomeworkItem } from '@/features/gamification/hooks/useRevisionHomework';
import { getSurah } from '@/lib/quran-metadata';
import type {
  CreateRecitationPlanInput,
  SelectionMode,
  RecitationPlanType,
} from '@/features/scheduling/types/recitation-plan.types';

const STATUS_BADGE_VARIANT: Record<string, 'success' | 'warning' | 'rose' | 'info'> = {
  memorized: 'success',
  in_progress: 'warning',
  learning: 'warning',
  needs_review: 'rose',
  new: 'info',
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface RecitationPlanFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (input: CreateRecitationPlanInput) => void;
  sessionId: string;
  studentId?: string | null;
  schoolId: string;
  userId: string;
  sessionDate: string;
  initialData?: Partial<CreateRecitationPlanInput>;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RecitationPlanForm({
  visible,
  onClose,
  onSave,
  sessionId,
  studentId,
  schoolId,
  userId,
  sessionDate,
  initialData,
}: RecitationPlanFormProps) {
  const { t } = useTranslation();

  // ── Form state ──────────────────────────────────────────────────────────
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(
    initialData?.selection_mode ?? 'ayah_range',
  );
  const [surahNumber, setSurahNumber] = useState<number | null>(
    initialData?.start_surah ?? null,
  );
  const [fromAyah, setFromAyah] = useState<number | null>(
    initialData?.start_ayah ?? null,
  );
  const [toAyah, setToAyah] = useState<number | null>(
    initialData?.end_ayah ?? null,
  );
  const [rubNumber, setRubNumber] = useState<number | null>(
    initialData?.rub_number ?? null,
  );
  const [hizbNumber, setHizbNumber] = useState<number | null>(
    initialData?.hizb_number ?? null,
  );
  const [juzNumber, setJuzNumber] = useState<number | null>(
    initialData?.juz_number ?? null,
  );
  const [recitationType, setRecitationType] = useState<RecitationPlanType>(
    initialData?.recitation_type ?? 'new_hifz',
  );
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [source, setSource] = useState<'manual' | 'from_assignment'>(
    (initialData?.source as 'manual' | 'from_assignment') ?? 'manual',
  );
  const [assignmentId, setAssignmentId] = useState<string | null>(
    initialData?.assignment_id ?? null,
  );

  // Resolved range from juz/hizb/rub (stores resolved ayah range)
  const [resolvedStart, setResolvedStart] = useState<{
    surah: number;
    ayah: number;
  } | null>(null);
  const [resolvedEnd, setResolvedEnd] = useState<{
    surah: number;
    ayah: number;
  } | null>(null);

  // ── Custom range foldable ─────────────────────────────────────────────
  const [showCustomRange, setShowCustomRange] = useState(false);

  // ── Data sources ──────────────────────────────────────────────────────
  const { data: progressEntries = [], isLoading: loadingProgress } =
    useMemorizationProgress({ studentId: studentId ?? '' });

  const { homeworkItems, pendingAssignments: hwAssignments, isLoading: loadingHomework } =
    useRevisionHomework(studentId ?? undefined);

  // ── Reset form when modal opens ─────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      setSelectionMode(initialData?.selection_mode ?? 'ayah_range');
      setSurahNumber(initialData?.start_surah ?? null);
      setFromAyah(initialData?.start_ayah ?? null);
      setToAyah(initialData?.end_ayah ?? null);
      setRubNumber(initialData?.rub_number ?? null);
      setHizbNumber(initialData?.hizb_number ?? null);
      setJuzNumber(initialData?.juz_number ?? null);
      setRecitationType(initialData?.recitation_type ?? 'new_hifz');
      setNotes(initialData?.notes ?? '');
      setSource((initialData?.source as 'manual' | 'from_assignment') ?? 'manual');
      setAssignmentId(initialData?.assignment_id ?? null);
      setResolvedStart(null);
      setResolvedEnd(null);
      setShowCustomRange(false);
    }
  }, [visible, initialData]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleResolvedRange = useCallback(
    (range: {
      start_surah: number;
      start_ayah: number;
      end_surah: number;
      end_ayah: number;
    }) => {
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

  const handleApplyProgressItem = useCallback(
    (item: { surah_number: number; from_ayah: number; to_ayah: number; status: string }) => {
      setSelectionMode('ayah_range');
      setSurahNumber(item.surah_number);
      setFromAyah(item.from_ayah);
      setToAyah(item.to_ayah);
      setRecitationType(
        item.status === 'in_progress' || item.status === 'learning' || item.status === 'new'
          ? 'new_hifz'
          : item.status === 'needs_review'
            ? 'old_review'
            : 'recent_review',
      );
      setSource('manual');
      setAssignmentId(null);
      setShowCustomRange(false);
    },
    [],
  );

  const handleApplyHomeworkItem = useCallback(
    (hw: HomeworkItem) => {
      const assignment = (hwAssignments ?? []).find((a) => a.id === hw.assignmentId);
      if (!assignment) return;
      setSelectionMode('ayah_range');
      setSurahNumber(assignment.surah_number);
      setFromAyah(assignment.from_ayah);
      setToAyah(assignment.to_ayah);
      setRecitationType('old_review' as RecitationPlanType);
      setSource('from_assignment');
      setAssignmentId(assignment.id);
      setShowCustomRange(false);
    },
    [hwAssignments],
  );

  const isValid = useMemo(() => {
    if (selectionMode === 'ayah_range') {
      return surahNumber != null && fromAyah != null && toAyah != null;
    }
    if (selectionMode === 'rub') return rubNumber != null;
    if (selectionMode === 'hizb') return hizbNumber != null;
    if (selectionMode === 'juz') return juzNumber != null;
    return false;
  }, [selectionMode, surahNumber, fromAyah, toAyah, rubNumber, hizbNumber, juzNumber]);

  const handleSave = useCallback(() => {
    if (!isValid) return;

    let startSurah: number;
    let startAyah: number;
    let endSurah: number;
    let endAyah: number;

    if (selectionMode === 'ayah_range') {
      startSurah = surahNumber!;
      startAyah = fromAyah!;
      endSurah = surahNumber!;
      endAyah = toAyah!;
    } else if (resolvedStart && resolvedEnd) {
      startSurah = resolvedStart.surah;
      startAyah = resolvedStart.ayah;
      endSurah = resolvedEnd.surah;
      endAyah = resolvedEnd.ayah;
    } else {
      return;
    }

    const input: CreateRecitationPlanInput = {
      school_id: schoolId,
      scheduled_session_id: sessionId,
      student_id: studentId ?? null,
      set_by: userId,
      selection_mode: selectionMode,
      start_surah: startSurah,
      start_ayah: startAyah,
      end_surah: endSurah,
      end_ayah: endAyah,
      rub_number: selectionMode === 'rub' ? rubNumber : null,
      hizb_number: selectionMode === 'hizb' ? hizbNumber : null,
      juz_number: selectionMode === 'juz' ? juzNumber : null,
      recitation_type: recitationType,
      source,
      assignment_id: source === 'from_assignment' ? assignmentId : null,
      notes: notes.trim().length > 0 ? notes.trim() : null,
    };

    onSave(input);
  }, [
    isValid,
    selectionMode,
    surahNumber,
    fromAyah,
    toAyah,
    resolvedStart,
    resolvedEnd,
    schoolId,
    sessionId,
    studentId,
    userId,
    rubNumber,
    hizbNumber,
    juzNumber,
    recitationType,
    source,
    assignmentId,
    notes,
    onSave,
  ]);

  // ── Selected range display ────────────────────────────────────────────
  const selectedLabel = useMemo(() => {
    if (surahNumber == null) return null;
    const surah = getSurah(surahNumber);
    const name = surah?.nameEnglish ?? `Surah ${surahNumber}`;
    if (fromAyah != null && toAyah != null) {
      return `${name} ${fromAyah}–${toAyah}`;
    }
    return name;
  }, [surahNumber, fromAyah, toAyah]);

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
              {initialData != null
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
            {/* Selected range indicator */}
            {selectedLabel && (
              <View style={styles.selectedBanner}>
                <Ionicons name="checkmark-circle" size={normalize(18)} color={colors.primary[500]} />
                <Text style={styles.selectedText} numberOfLines={1}>{selectedLabel}</Text>
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

                {loadingProgress ? (
                  <ActivityIndicator size="small" color={colors.primary[500]} style={styles.loader} />
                ) : progressEntries.length === 0 ? (
                  <Text style={styles.emptyText}>
                    {t('scheduling.recitationPlan.noProgress')}
                  </Text>
                ) : (
                  <FlatList
                    data={progressEntries}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    renderItem={({ item }) => {
                      const surah = getSurah(item.surah_number);
                      const label = `${surah?.nameEnglish ?? item.surah_number} ${item.from_ayah}–${item.to_ayah}`;
                      return (
                        <Pressable
                          onPress={() => handleApplyProgressItem(item)}
                          style={({ pressed }) => [
                            styles.suggestionItem,
                            pressed && styles.suggestionItemPressed,
                          ]}
                          accessibilityRole="button"
                        >
                          <View style={styles.suggestionContent}>
                            <Text style={styles.suggestionLabel} numberOfLines={1}>
                              {label}
                            </Text>
                            <Badge
                              label={t(`memorization.status.${item.status}`)}
                              variant={STATUS_BADGE_VARIANT[item.status] ?? 'default'}
                              size="sm"
                            />
                          </View>
                          <Ionicons
                            name="arrow-forward"
                            size={normalize(16)}
                            color={colors.primary[500]}
                          />
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
                      const label = surah
                        ? `${surah.nameEnglish} ${assignment!.from_ayah}–${assignment!.to_ayah}`
                        : `Rub' ${hw.rubNumber}`;
                      return (
                        <Pressable
                          onPress={() => handleApplyHomeworkItem(hw)}
                          style={({ pressed }) => [
                            styles.suggestionItem,
                            pressed && styles.suggestionItemPressed,
                          ]}
                          accessibilityRole="button"
                        >
                          <View style={styles.suggestionContent}>
                            <Text style={styles.suggestionLabel} numberOfLines={1}>
                              {label}
                            </Text>
                            <Badge
                              label={`Juz ${hw.juz}`}
                              variant="sky"
                              size="sm"
                            />
                          </View>
                          <Ionicons
                            name="arrow-forward"
                            size={normalize(16)}
                            color={colors.primary[500]}
                          />
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
            )}

            {/* Recitation Type */}
            <RecitationTypeChips
              value={recitationType}
              onChange={setRecitationType}
              style={styles.section}
            />

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
              title={t('common.save')}
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
  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  selectedText: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.primary[700],
  },
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
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  suggestionItemPressed: {
    backgroundColor: colors.neutral[100],
  },
  suggestionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginEnd: spacing.sm,
  },
  suggestionLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: lightTheme.text,
    flexShrink: 1,
  },
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
