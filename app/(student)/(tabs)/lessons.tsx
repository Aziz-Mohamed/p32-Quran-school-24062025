import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, I18nManager, Modal, Pressable, SectionList, StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { useAuth } from '@/hooks/useAuth';
import { useRoleTheme } from '@/hooks/useRoleTheme';
import {
  useRubCertifications,
  useRubReference,
  useRequestRevision,
  useRevisionHomework,
  RevisionWarning,
  RevisionSheet,
} from '@/features/gamification';
import type { EnrichedCertification, RubReference, FreshnessState } from '@/features/gamification';
import { useStudentDashboard } from '@/features/dashboard/hooks/useStudentDashboard';
import { getMushafPageRange } from '@/lib/quran-metadata';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { normalize } from '@/theme/normalize';

// ─── Types ───────────────────────────────────────────────────────────────────

type ViewMode = 'rub' | 'hizb' | 'juz';

interface CertGroup {
  _type: 'group';
  id: string;
  groupNumber: number;
  juzNumber: number;
  children: EnrichedCertification[];
  worstState: FreshnessState;
  needsRevisionCount: number;
}

type SectionItem = EnrichedCertification | CertGroup;

function isGroup(item: SectionItem): item is CertGroup {
  return '_type' in item && item._type === 'group';
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FRESHNESS_DOT_COLORS: Record<string, string> = {
  fresh: '#22C55E',
  fading: '#EAB308',
  warning: '#F97316',
  critical: '#EF4444',
  dormant: '#9CA3AF',
};

const FRESHNESS_BG_COLORS: Record<string, string> = {
  fresh: '#DCFCE7',
  fading: '#FEF9C3',
  warning: '#FFEDD5',
  critical: '#FEE2E2',
  dormant: '#F3F4F6',
};

const STATE_PRIORITY: Record<string, number> = {
  fresh: 1,
  fading: 2,
  dormant: 3,
  warning: 4,
  critical: 5,
};

const VIEW_MODES: ViewMode[] = ['rub', 'hizb', 'juz'];

function getWorstState(children: EnrichedCertification[]): FreshnessState {
  let worst: FreshnessState = 'fresh';
  let worstPriority = 0;
  for (const c of children) {
    const p = STATE_PRIORITY[c.freshness.state] ?? 0;
    if (p > worstPriority) {
      worstPriority = p;
      worst = c.freshness.state;
    }
  }
  return worst;
}

// ─── Revision Health Screen ───────────────────────────────────────────────────

export default function RevisionHealthScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  const theme = useRoleTheme();

  const {
    enriched,
    activeCount,
    dormantCount,
    isLoading,
    error,
    refetch,
  } = useRubCertifications(profile?.id);

  // Rubʿ reference data for verse ranges
  const { data: rubReferenceList } = useRubReference();
  const rubReferenceMap = useMemo(() => {
    const map = new Map<number, RubReference>();
    if (rubReferenceList) {
      for (const ref of rubReferenceList) {
        map.set(ref.rub_number, ref);
      }
    }
    return map;
  }, [rubReferenceList]);

  // Student data for can_self_assign and school_id
  const { data: dashboardData } = useStudentDashboard(profile?.id);
  const canSelfAssign = dashboardData?.student?.can_self_assign ?? false;
  const schoolId = dashboardData?.student?.school_id ?? '';

  // "Add to Homework" mutation
  const requestRevision = useRequestRevision();

  // Revision homework data (shared hook)
  const { homeworkItems, pendingKeys } = useRevisionHomework(profile?.id);

  // Smart warning: exclude rubʿ already covered by homework
  const homeworkRubSet = useMemo(
    () => new Set(homeworkItems.map((h) => h.rubNumber)),
    [homeworkItems],
  );
  const effectiveCriticalCount = useMemo(
    () => enriched.filter(
      (c) => (c.freshness.state === 'critical' || c.freshness.state === 'warning')
        && !homeworkRubSet.has(c.rub_number),
    ).length,
    [enriched, homeworkRubSet],
  );

  const [viewMode, setViewMode] = useState<ViewMode>('rub');
  const [selectedCert, setSelectedCert] = useState<EnrichedCertification | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<CertGroup | null>(null);

  // Health counts (always computed from raw enriched, regardless of view mode)
  const healthCounts = useMemo(() => {
    const counts: Record<string, number> = {
      fresh: 0, fading: 0, warning: 0, critical: 0, dormant: 0,
    };
    for (const cert of enriched) {
      counts[cert.freshness.state] = (counts[cert.freshness.state] ?? 0) + 1;
    }
    return counts;
  }, [enriched]);

  // Build sections based on view mode
  const sections = useMemo((): { title: string; data: SectionItem[]; key: string }[] => {
    if (viewMode === 'rub') {
      // Current behavior — individual rubʿ rows
      const attention: EnrichedCertification[] = [];
      const rest: EnrichedCertification[] = [];

      for (const cert of enriched) {
        if (cert.freshness.state === 'warning' || cert.freshness.state === 'critical') {
          attention.push(cert);
        } else {
          rest.push(cert);
        }
      }

      attention.sort((a, b) => a.freshness.daysUntilDormant - b.freshness.daysUntilDormant);
      rest.sort((a, b) => a.freshness.percentage - b.freshness.percentage);

      const result: { title: string; data: SectionItem[]; key: string }[] = [];
      if (attention.length > 0) {
        result.push({
          title: `${t('student.revision.needsAttention')} (${attention.length})`,
          data: attention,
          key: 'attention',
        });
      }
      if (rest.length > 0) {
        result.push({
          title: `${t('student.revision.allCertified')} (${rest.length})`,
          data: rest,
          key: 'certified',
        });
      }
      return result;
    }

    // Group mode (hizb or juz)
    const divisor = viewMode === 'hizb' ? 2 : 8;
    const groupMap = new Map<number, EnrichedCertification[]>();

    for (const cert of enriched) {
      const groupNum = Math.ceil(cert.rub_number / divisor);
      const existing = groupMap.get(groupNum);
      if (existing) existing.push(cert);
      else groupMap.set(groupNum, [cert]);
    }

    const attention: CertGroup[] = [];
    const rest: CertGroup[] = [];

    for (const [groupNumber, children] of groupMap) {
      // For hizb: 4 hizbs per juz. For juz: groupNumber IS the juz number
      const juzNumber = viewMode === 'juz'
        ? groupNumber
        : Math.ceil(groupNumber / 4);

      const worstState = getWorstState(children);
      const needsRevisionCount = children.filter(
        (c) => c.freshness.state === 'warning' || c.freshness.state === 'critical',
      ).length;

      const group: CertGroup = {
        _type: 'group',
        id: `${viewMode}-${groupNumber}`,
        groupNumber,
        juzNumber,
        children: children.sort((a, b) => a.rub_number - b.rub_number),
        worstState,
        needsRevisionCount,
      };

      if (needsRevisionCount > 0) {
        attention.push(group);
      } else {
        rest.push(group);
      }
    }

    attention.sort((a, b) => a.groupNumber - b.groupNumber);
    rest.sort((a, b) => a.groupNumber - b.groupNumber);

    const result: { title: string; data: SectionItem[]; key: string }[] = [];
    if (attention.length > 0) {
      result.push({
        title: `${t('student.revision.needsAttention')} (${attention.length})`,
        data: attention,
        key: 'attention',
      });
    }
    if (rest.length > 0) {
      result.push({
        title: `${t('student.revision.allCertified')} (${rest.length})`,
        data: rest,
        key: 'certified',
      });
    }
    return result;
  }, [enriched, viewMode, t]);

  const handleCertPress = (cert: EnrichedCertification) => {
    setSelectedCert(cert);
    setSheetVisible(true);
  };

  const handleGroupPress = (group: CertGroup) => {
    setSelectedGroup(group);
  };

  const isAlreadyInPlan = useCallback((cert: EnrichedCertification): boolean => {
    const ref = rubReferenceMap.get(cert.rub_number);
    if (!ref) return false;
    return pendingKeys.has(`${ref.start_surah}:${ref.start_ayah}`);
  }, [rubReferenceMap, pendingKeys]);

  const handleAddToPlan = () => {
    if (!selectedCert || !profile?.id || !schoolId) return;
    const ref = rubReferenceMap.get(selectedCert.rub_number);
    if (!ref) return;

    requestRevision.mutate(
      { studentId: profile.id, schoolId, reference: ref },
      {
        onSuccess: () => {
          Alert.alert('', t('gamification.revision.addedToPlan'));
          setSheetVisible(false);
          setSelectedCert(null);
        },
      },
    );
  };

  const handleGroupAddToPlan = useCallback(async () => {
    if (!selectedGroup || !profile?.id || !schoolId || !canSelfAssign) return;

    const eligible = selectedGroup.children.filter((c) => {
      if (c.freshness.state === 'dormant') return false;
      return !isAlreadyInPlan(c);
    });

    if (eligible.length === 0) return;

    try {
      const promises = eligible.map((cert) => {
        const ref = rubReferenceMap.get(cert.rub_number);
        if (!ref) return Promise.resolve();
        return requestRevision.mutateAsync({ studentId: profile.id!, schoolId, reference: ref });
      });
      await Promise.all(promises);
      Alert.alert('', t('student.revision.batchAddedToPlan', { count: eligible.length }));
      setSelectedGroup(null);
    } catch {
      // Individual failures handled by TanStack Query
    }
  }, [selectedGroup, profile?.id, schoolId, canSelfAssign, isAlreadyInPlan, rubReferenceMap, requestRevision, t]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={error.message} onRetry={refetch} />;

  // Empty state — no certifications at all
  if (enriched.length === 0) {
    return (
      <Screen scroll={false} hasTabBar>
        <EmptyState
          icon="pulse-outline"
          title={t('student.revision.noCertifications')}
          description={t('student.revision.noCertificationsDesc')}
        />
      </Screen>
    );
  }

  const chevron = I18nManager.isRTL ? 'chevron-back' : 'chevron-forward';
  const needsAttentionCount = enriched.filter(
    (c) => c.freshness.state === 'warning' || c.freshness.state === 'critical',
  ).length;

  const freshCount = healthCounts.fresh ?? 0;
  const fadingCount = healthCounts.fading ?? 0;
  const warningCount = healthCounts.warning ?? 0;
  const criticalCountLocal = healthCounts.critical ?? 0;
  const dormantCountLocal = healthCounts.dormant ?? 0;

  const selectedRef = selectedCert ? rubReferenceMap.get(selectedCert.rub_number) ?? null : null;

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('student.revision.title')}</Text>

        <SectionList
          sections={sections}
          keyExtractor={(item) => isGroup(item) ? item.id : item.id}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            <>
              {/* View Mode Segment Control */}
              <View style={styles.segmentRow}>
                {VIEW_MODES.map((mode) => {
                  const isActive = viewMode === mode;
                  return (
                    <Pressable
                      key={mode}
                      style={[
                        styles.segmentButton,
                        isActive && styles.segmentButtonActive,
                      ]}
                      onPress={() => setViewMode(mode)}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          isActive && styles.segmentTextActive,
                        ]}
                      >
                        {t(`student.revision.viewMode.${mode}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Health Summary Card */}
              <Card variant="default" style={styles.healthCard}>
                <View style={styles.healthRow}>
                  <View style={styles.healthLevel}>
                    <Text style={styles.healthLevelNumber}>{activeCount}</Text>
                    <Text style={styles.healthLevelTotal}>/240</Text>
                  </View>
                  <View style={styles.healthBreakdown}>
                    {freshCount > 0 && (
                      <HealthLine color={FRESHNESS_DOT_COLORS.fresh} count={freshCount} label={t('gamification.freshness.fresh')} />
                    )}
                    {fadingCount > 0 && (
                      <HealthLine color={FRESHNESS_DOT_COLORS.fading} count={fadingCount} label={t('gamification.freshness.fading')} />
                    )}
                    {warningCount > 0 && (
                      <HealthLine color={FRESHNESS_DOT_COLORS.warning} count={warningCount} label={t('gamification.freshness.warning')} />
                    )}
                    {criticalCountLocal > 0 && (
                      <HealthLine color={FRESHNESS_DOT_COLORS.critical} count={criticalCountLocal} label={t('gamification.freshness.critical')} />
                    )}
                    {dormantCountLocal > 0 && (
                      <HealthLine color={FRESHNESS_DOT_COLORS.dormant} count={dormantCountLocal} label={t('gamification.freshness.dormant')} />
                    )}
                  </View>
                </View>
                <ProgressBar
                  progress={activeCount / 240}
                  variant={theme.tag}
                  height={6}
                />
              </Card>

              {/* Revision Warning */}
              <RevisionWarning count={effectiveCriticalCount} />

              {/* Revision Plan — pending old_review assignments due today, shown as rubʿ */}
              {homeworkItems.length > 0 && (
                <Card variant="default" style={styles.planCard}>
                  <View style={styles.planHeader}>
                    <Ionicons name="book-outline" size={18} color={colors.primary[500]} />
                    <Text style={styles.planTitle}>{t('student.revision.plannedItems')}</Text>
                    <View style={styles.planBadge}>
                      <Text style={styles.planBadgeText}>{homeworkItems.length}</Text>
                    </View>
                  </View>
                  {homeworkItems.map((item) => {
                    const cert = enriched.find((c) => c.rub_number === item.rubNumber);
                    const dotColor = cert
                      ? (FRESHNESS_DOT_COLORS[cert.freshness.state] ?? colors.primary[400])
                      : colors.primary[400];

                    return (
                      <Pressable
                        key={item.assignmentId}
                        style={({ pressed }) => [styles.planRow, pressed && styles.rubRowPressed]}
                        onPress={() => {
                          if (cert) handleCertPress(cert);
                        }}
                      >
                        <View style={[styles.rubDot, { backgroundColor: dotColor }]} />
                        <Text style={[styles.rubTitle, { flex: 1 }]} numberOfLines={1}>
                          {t('gamification.rub')} {item.rubNumber} {'\u00B7'} {t('gamification.juz')} {item.juz}
                        </Text>
                        <Ionicons name={chevron as any} size={16} color={colors.neutral[300]} />
                      </Pressable>
                    );
                  })}
                </Card>
              )}

              {/* All-fresh success state */}
              {needsAttentionCount === 0 && enriched.length > 0 && (
                <Card variant="outlined" style={styles.allFreshCard}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary[500]} />
                  <View style={styles.allFreshText}>
                    <Text style={styles.allFreshTitle}>{t('student.revision.allFresh')}</Text>
                    <Text style={styles.allFreshDesc}>{t('student.revision.allFreshDesc')}</Text>
                  </View>
                </Card>
              )}
            </>
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item, section }) => {
            if (isGroup(item)) {
              const dotColor = FRESHNESS_DOT_COLORS[item.worstState] ?? colors.neutral[400];
              const bgColor = FRESHNESS_BG_COLORS[item.worstState] ?? colors.neutral[50];
              const label = viewMode === 'juz'
                ? `${t('gamification.juz')} ${item.groupNumber}`
                : `${t('gamification.hizb')} ${item.groupNumber} ${'\u00B7'} ${t('gamification.juz')} ${item.juzNumber}`;
              const divisor = viewMode === 'hizb' ? 2 : 8;

              return (
                <Pressable
                  style={({ pressed }) => [styles.rubRow, pressed && styles.rubRowPressed]}
                  onPress={() => handleGroupPress(item)}
                >
                  <View style={[styles.rubDot, { backgroundColor: dotColor }]} />
                  <View style={styles.rubInfo}>
                    <Text style={styles.rubTitle}>{label}</Text>
                    <View style={[styles.rubChip, { backgroundColor: bgColor }]}>
                      <Text style={[styles.rubChipText, { color: dotColor }]}>
                        {item.needsRevisionCount > 0
                          ? t('student.revision.itemsNeedRevision', { count: item.needsRevisionCount })
                          : t(`gamification.freshness.${item.worstState}`)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.groupCountBadge}>
                    <Text style={styles.groupCountText}>{item.children.length}/{divisor}</Text>
                  </View>
                  <Ionicons name={chevron as any} size={16} color={colors.neutral[300]} />
                </Pressable>
              );
            }
            return (
              <RubRow
                cert={item}
                showDaysLeft={section.key === 'attention'}
                chevron={chevron}
                onPress={() => handleCertPress(item)}
                t={t}
              />
            );
          }}
          ListFooterComponent={
            <View style={styles.quickLinks}>
              <Pressable
                style={[styles.pill, { backgroundColor: colors.accent.violet[50] }]}
                onPress={() => router.push('/(student)/rub-progress')}
              >
                <Ionicons name="map" size={16} color={colors.accent.violet[500]} />
                <Text style={[styles.pillText, { color: colors.accent.violet[600] }]}>
                  {t('student.revision.fullMap')}
                </Text>
              </Pressable>
            </View>
          }
        />

        {/* Revision Sheet (single rubʿ) */}
        <RevisionSheet
          mode="student"
          visible={sheetVisible}
          certification={selectedCert}
          reference={selectedRef}
          canSelfAssign={canSelfAssign}
          alreadyInPlan={selectedCert ? isAlreadyInPlan(selectedCert) : false}
          isAddingToPlan={requestRevision.isPending}
          onAddToPlan={handleAddToPlan}
          onClose={() => {
            setSheetVisible(false);
            setSelectedCert(null);
          }}
        />

        {/* Group Revision Sheet (hizb/juz) */}
        <GroupRevisionSheet
          group={selectedGroup}
          viewMode={viewMode}
          canSelfAssign={canSelfAssign}
          isAdding={requestRevision.isPending}
          isAlreadyInPlan={isAlreadyInPlan}
          onAddToPlan={handleGroupAddToPlan}
          onClose={() => setSelectedGroup(null)}
        />
      </View>
    </Screen>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function HealthLine({ color, count, label }: { color: string; count: number; label: string }) {
  return (
    <View style={styles.healthLine}>
      <View style={[styles.healthDot, { backgroundColor: color }]} />
      <Text style={styles.healthCount}>{count}</Text>
      <Text style={styles.healthLabel}>{label}</Text>
    </View>
  );
}

function RubRow({
  cert,
  showDaysLeft,
  chevron,
  onPress,
  t,
}: {
  cert: EnrichedCertification;
  showDaysLeft: boolean;
  chevron: string;
  onPress: () => void;
  t: (key: string, opts?: any) => string;
}) {
  const juz = Math.ceil(cert.rub_number / 8);
  const dotColor = FRESHNESS_DOT_COLORS[cert.freshness.state] ?? colors.neutral[400];
  const bgColor = FRESHNESS_BG_COLORS[cert.freshness.state] ?? colors.neutral[50];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.rubRow,
        pressed && styles.rubRowPressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.rubDot, { backgroundColor: dotColor }]} />
      <View style={styles.rubInfo}>
        <Text style={styles.rubTitle}>
          {t('gamification.rub')} {cert.rub_number} {'\u00B7'} {t('gamification.juz')} {juz}
        </Text>
        <View style={[styles.rubChip, { backgroundColor: bgColor }]}>
          <Text style={[styles.rubChipText, { color: dotColor }]}>
            {showDaysLeft
              ? t('student.revision.daysLeft', { count: cert.freshness.daysUntilDormant })
              : `${t(`gamification.freshness.${cert.freshness.state}`)} (${cert.freshness.percentage}%)`}
          </Text>
        </View>
      </View>
      <Ionicons name={chevron as any} size={16} color={colors.neutral[300]} />
    </Pressable>
  );
}

function GroupRevisionSheet({
  group,
  viewMode,
  canSelfAssign,
  isAdding,
  isAlreadyInPlan,
  onAddToPlan,
  onClose,
}: {
  group: CertGroup | null;
  viewMode: ViewMode;
  canSelfAssign: boolean;
  isAdding: boolean;
  isAlreadyInPlan: (cert: EnrichedCertification) => boolean;
  onAddToPlan: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  if (!group) return null;

  const dotColor = FRESHNESS_DOT_COLORS[group.worstState] ?? colors.neutral[400];
  const bgColor = FRESHNESS_BG_COLORS[group.worstState] ?? colors.neutral[50];
  const divisor = viewMode === 'hizb' ? 2 : 8;

  const label = viewMode === 'juz'
    ? `${t('gamification.juz')} ${group.groupNumber}`
    : `${t('gamification.hizb')} ${group.groupNumber} ${'\u00B7'} ${t('gamification.juz')} ${group.juzNumber}`;

  // Count eligible for plan (any non-dormant rubʿ not already in plan — same as individual rubʿ behavior)
  const eligibleCount = group.children.filter((c) => {
    if (c.freshness.state === 'dormant') return false;
    return !isAlreadyInPlan(c);
  }).length;

  // Average freshness
  const avgFreshness = group.children.length > 0
    ? Math.round(group.children.reduce((sum, c) => sum + c.freshness.percentage, 0) / group.children.length)
    : 0;

  const nonDormantCount = group.children.filter((c) => c.freshness.state !== 'dormant').length;
  const allInPlan = eligibleCount === 0 && nonDormantCount > 0;

  // Page range for the group
  const firstRub = group.children[0]?.rub_number;
  const lastRub = group.children[group.children.length - 1]?.rub_number;
  const pageRange = firstRub && lastRub ? getMushafPageRange(firstRub, lastRub) : undefined;

  return (
    <Modal visible={!!group} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.sheetOverlay} onPress={onClose}>
        <Pressable style={styles.sheetContent} onPress={() => {}}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <View style={[styles.sheetChip, { backgroundColor: bgColor }]}>
              <Text style={[styles.sheetChipText, { color: dotColor }]}>
                {t(`gamification.freshness.${group.worstState}`)}
              </Text>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.sheetInfo}>
            <View style={styles.sheetInfoRow}>
              <Text style={styles.sheetInfoLabel}>{t('student.revision.certifiedRub')}</Text>
              <Text style={styles.sheetInfoValue}>{group.children.length}/{divisor}</Text>
            </View>
            <View style={styles.sheetInfoRow}>
              <Text style={styles.sheetInfoLabel}>{t('student.revision.needRevision')}</Text>
              <Text style={styles.sheetInfoValue}>{group.needsRevisionCount}</Text>
            </View>
            {pageRange && (
              <View style={styles.sheetInfoRow}>
                <Text style={styles.sheetInfoLabel}>{t('gamification.revision.mushafPage')}</Text>
                <Text style={styles.sheetInfoValue}>
                  {pageRange.startPage === pageRange.endPage
                    ? `${pageRange.startPage}`
                    : `${pageRange.startPage}-${pageRange.endPage}`}
                </Text>
              </View>
            )}
            {/* Freshness bar */}
            <View style={styles.sheetBarRow}>
              <View style={styles.sheetBarTrack}>
                <View
                  style={[
                    styles.sheetBarFill,
                    { width: `${avgFreshness}%`, backgroundColor: dotColor },
                  ]}
                />
              </View>
              <Text style={styles.sheetBarPercent}>{avgFreshness}%</Text>
            </View>
          </View>

          {/* Action */}
          {canSelfAssign && eligibleCount > 0 && (
            <Pressable
              style={({ pressed }) => [styles.sheetPlanButton, pressed && styles.sheetPressed]}
              onPress={onAddToPlan}
              disabled={isAdding}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color={colors.primary[500]} />
              ) : (
                <Ionicons name="book-outline" size={22} color={colors.primary[500]} />
              )}
              <View style={styles.sheetPlanText}>
                <Text style={styles.sheetPlanLabel}>
                  {isAdding
                    ? t('student.revision.addingToPlan')
                    : `${t('student.revision.addAllToPlan')} (${eligibleCount})`}
                </Text>
              </View>
            </Pressable>
          )}

          {allInPlan && (
            <View style={[styles.sheetPlanButton, styles.sheetPlanDisabled]}>
              <Ionicons name="checkmark-circle" size={22} color={colors.primary[500]} />
              <View style={styles.sheetPlanText}>
                <Text style={[styles.sheetPlanLabel, { color: colors.primary[600] }]}>
                  {t('gamification.revision.alreadyInPlan')}
                </Text>
              </View>
            </View>
          )}

          {!canSelfAssign && (
            <View style={styles.sheetInfoMessage}>
              <Ionicons name="person" size={20} color={colors.neutral[500]} />
              <Text style={styles.sheetInfoMessageText}>
                {t('gamification.revision.askTeacherDesc')}
              </Text>
            </View>
          )}

          {/* Cancel */}
          <Pressable
            style={({ pressed }) => [styles.sheetCancel, pressed && styles.sheetPressed]}
            onPress={onClose}
          >
            <Text style={styles.sheetCancelText}>{t('common.cancel')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: 0,
    paddingBottom: 110,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    fontSize: normalize(24),
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },

  // Segment Control
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.white,
  },
  segmentButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  segmentText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(13),
    color: colors.neutral[600],
  },
  segmentTextActive: {
    color: colors.white,
  },

  // Health Summary
  healthCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  healthLevel: {
    alignItems: 'center',
    justifyContent: 'center',
    width: normalize(72),
    height: normalize(72),
    borderRadius: normalize(36),
    borderWidth: 3,
    borderColor: colors.primary[200],
  },
  healthLevelNumber: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(22),
    color: colors.primary[600],
  },
  healthLevelTotal: {
    fontFamily: typography.fontFamily.regular,
    fontSize: normalize(11),
    color: colors.neutral[400],
    marginTop: -2,
  },
  healthBreakdown: {
    flex: 1,
    gap: normalize(4),
  },
  healthLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  healthDot: {
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
  },
  healthCount: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(13),
    color: colors.neutral[800],
    minWidth: normalize(20),
  },
  healthLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: normalize(13),
    color: colors.neutral[500],
  },

  // All-fresh success
  allFreshCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  allFreshText: {
    flex: 1,
  },
  allFreshTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(14),
    color: colors.primary[700],
  },
  allFreshDesc: {
    fontFamily: typography.fontFamily.regular,
    fontSize: normalize(12),
    color: colors.neutral[500],
    marginTop: normalize(2),
  },

  // Today's Plan
  planCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  planTitle: {
    flex: 1,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(14),
    color: colors.neutral[800],
  },
  planBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: normalize(2),
    borderRadius: radius.full,
    minWidth: normalize(24),
    alignItems: 'center',
  },
  planBadgeText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(11),
    color: colors.primary[600],
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral[100],
  },

  // Section Headers
  sectionHeaderContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
    fontSize: normalize(15),
  },

  // Rub Rows
  rubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.06)',
  },
  rubRowPressed: {
    opacity: 0.7,
  },
  rubDot: {
    width: normalize(10),
    height: normalize(10),
    borderRadius: normalize(5),
  },
  rubInfo: {
    flex: 1,
    gap: normalize(4),
  },
  rubTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(14),
    color: colors.neutral[900],
  },
  rubChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: normalize(2),
    borderRadius: radius.full,
  },
  rubChipText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(11),
  },

  // Group count badge (used in flat group rows)
  groupCountBadge: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: normalize(2),
    borderRadius: radius.full,
  },
  groupCountText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(11),
    color: colors.neutral[600],
  },

  // Group Revision Sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: colors.white,
    borderTopStartRadius: radius.xl,
    borderTopEndRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  sheetTitle: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
  },
  sheetChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginStart: spacing.sm,
  },
  sheetChipText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(12),
  },
  sheetInfo: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.base,
    gap: spacing.sm,
  },
  sheetInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetInfoLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(13),
    color: colors.neutral[500],
  },
  sheetInfoValue: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(13),
    color: colors.neutral[800],
  },
  sheetBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  sheetBarTrack: {
    flex: 1,
    height: normalize(6),
    backgroundColor: colors.neutral[200],
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  sheetBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  sheetBarPercent: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(12),
    color: colors.neutral[600],
    minWidth: normalize(32),
    textAlign: 'right',
  },
  sheetPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.primary[50],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary[200],
    marginBottom: spacing.lg,
  },
  sheetPlanDisabled: {
    opacity: 0.8,
    borderColor: colors.primary[100],
  },
  sheetPlanText: {
    flex: 1,
  },
  sheetPlanLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(15),
    color: colors.primary[600],
  },
  sheetInfoMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  sheetInfoMessageText: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(13),
    color: colors.neutral[600],
  },
  sheetPressed: {
    opacity: 0.7,
  },
  sheetCancel: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  sheetCancelText: {
    ...typography.textStyles.bodyMedium,
    color: colors.neutral[500],
  },

  // Quick Links
  quickLinks: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  pillText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: normalize(13),
  },
});
