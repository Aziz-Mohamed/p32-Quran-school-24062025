import React, { useMemo, useState } from 'react';
import { Alert, I18nManager, Pressable, SectionList, StyleSheet, View, Text } from 'react-native';
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
  RevisionWarning,
  RevisionSheet,
} from '@/features/gamification';
import type { EnrichedCertification, RubReference } from '@/features/gamification';
import { useStudentDashboard } from '@/features/dashboard/hooks/useStudentDashboard';
import { assignmentService } from '@/features/memorization/services/assignment.service';
import { useQuery } from '@tanstack/react-query';
import { typography } from '@/theme/typography';
import { lightTheme, colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { normalize } from '@/theme/normalize';

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

// ─── Revision Health Screen ───────────────────────────────────────────────────

export default function RevisionHealthScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  const theme = useRoleTheme();

  const {
    enriched,
    activeCount,
    criticalCount,
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

  // "Add to Plan" mutation
  const requestRevision = useRequestRevision();

  // Pending assignments for "already in plan" check
  const { data: pendingAssignments } = useQuery({
    queryKey: ['assignments', 'pending-revision', profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error('No profile');
      const { data, error } = await assignmentService.getAssignments({
        studentId: profile.id,
        assignmentType: 'old_review',
        status: 'pending',
      });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profile?.id,
    staleTime: 1000 * 60,
  });

  // Build a set of surah:fromAyah keys that are already in plan
  const pendingKeys = useMemo(() => {
    const keys = new Set<string>();
    if (pendingAssignments) {
      for (const a of pendingAssignments) {
        keys.add(`${a.surah_number}:${a.from_ayah}`);
      }
    }
    return keys;
  }, [pendingAssignments]);

  const [selectedCert, setSelectedCert] = useState<EnrichedCertification | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  // Group certifications into "needs attention" vs "all certified"
  const { needsAttention, allCertified, healthCounts } = useMemo(() => {
    const attention: EnrichedCertification[] = [];
    const rest: EnrichedCertification[] = [];
    const counts: Record<string, number> = {
      fresh: 0,
      fading: 0,
      warning: 0,
      critical: 0,
      dormant: 0,
    };

    for (const cert of enriched) {
      counts[cert.freshness.state] = (counts[cert.freshness.state] ?? 0) + 1;

      if (cert.freshness.state === 'warning' || cert.freshness.state === 'critical') {
        attention.push(cert);
      } else {
        rest.push(cert);
      }
    }

    // Sort attention by urgency (fewest days left first)
    attention.sort((a, b) => a.freshness.daysUntilDormant - b.freshness.daysUntilDormant);
    // Sort rest by freshness % ascending (weakest first)
    rest.sort((a, b) => a.freshness.percentage - b.freshness.percentage);

    return { needsAttention: attention, allCertified: rest, healthCounts: counts };
  }, [enriched]);

  const handleCertPress = (cert: EnrichedCertification) => {
    setSelectedCert(cert);
    setSheetVisible(true);
  };

  const isAlreadyInPlan = (cert: EnrichedCertification): boolean => {
    const ref = rubReferenceMap.get(cert.rub_number);
    if (!ref) return false;
    return pendingKeys.has(`${ref.start_surah}:${ref.start_ayah}`);
  };

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

  // Build sections for SectionList
  const sections: { title: string; data: EnrichedCertification[]; key: string }[] = [];

  if (needsAttention.length > 0) {
    sections.push({
      title: `${t('student.revision.needsAttention')} (${needsAttention.length})`,
      data: needsAttention,
      key: 'attention',
    });
  }

  if (allCertified.length > 0) {
    sections.push({
      title: `${t('student.revision.allCertified')} (${allCertified.length})`,
      data: allCertified,
      key: 'certified',
    });
  }

  const freshCount = healthCounts.fresh ?? 0;
  const fadingCount = healthCounts.fading ?? 0;
  const warningCount = healthCounts.warning ?? 0;
  const criticalCountLocal = healthCounts.critical ?? 0;
  const dormantCountLocal = healthCounts.dormant ?? 0;

  const selectedRef = selectedCert ? rubReferenceMap.get(selectedCert.rub_number) ?? null : null;

  return (
    <Screen scroll={false} hasTabBar>
      <View style={styles.container}>
        <Text style={styles.title}>{t('student.revision.title')}</Text>

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            <>
              {/* Health Summary Card */}
              <Card variant="default" style={styles.healthCard}>
                <View style={styles.healthRow}>
                  {/* Left: Level ring placeholder */}
                  <View style={styles.healthLevel}>
                    <Text style={styles.healthLevelNumber}>{activeCount}</Text>
                    <Text style={styles.healthLevelTotal}>/240</Text>
                  </View>
                  {/* Right: State breakdown */}
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
              <RevisionWarning count={criticalCount} />

              {/* All-fresh success state */}
              {needsAttention.length === 0 && enriched.length > 0 && (
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
          renderItem={({ item, section }) => (
            <RubRow
              cert={item}
              showDaysLeft={section.key === 'attention'}
              chevron={chevron}
              onPress={() => handleCertPress(item)}
              t={t}
            />
          )}
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
              <Pressable
                style={[styles.pill, { backgroundColor: colors.accent.indigo[50] }]}
                onPress={() => router.push('/(student)/(tabs)/memorization')}
              >
                <Ionicons name="book" size={16} color={colors.accent.indigo[500]} />
                <Text style={[styles.pillText, { color: colors.accent.indigo[600] }]}>
                  {t('student.revision.todaysPlan')}
                </Text>
              </Pressable>
            </View>
          }
        />

        {/* Revision Sheet */}
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
      style={({ pressed }) => [styles.rubRow, pressed && styles.rubRowPressed]}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
    fontSize: normalize(24),
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
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
