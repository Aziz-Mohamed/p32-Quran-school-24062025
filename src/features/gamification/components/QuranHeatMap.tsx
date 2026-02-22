import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, I18nManager, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { HeatMapCell } from './HeatMapCell';
import { RevisionSheet } from './RevisionSheet';
import { useRubReference } from '../hooks/useRubReference';
import { useRubCertifications } from '../hooks/useRubCertifications';
import { useRevisionHomework } from '../hooks/useRevisionHomework';
import { useRequestRevision } from '../hooks/useRequestRevision';
import { LoadingState, ErrorState } from '@/components/feedback';
import { useStudentDashboard } from '@/features/dashboard/hooks/useStudentDashboard';
import { HEATMAP_LEGEND } from '../utils/heatmap-colors';
import type { EnrichedCertification, RubReference as RubRef } from '../types/gamification.types';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PADDING = spacing.lg;
const JUZ_LABEL_WIDTH = normalize(38);
const GAP = 3;
const COLS = 8;
const CELL_SIZE = Math.floor(
  (SCREEN_WIDTH - 2 * PADDING - JUZ_LABEL_WIDTH - (COLS - 1) * GAP) / COLS,
);

interface QuranHeatMapProps {
  studentId: string;
}

export function QuranHeatMap({ studentId }: QuranHeatMapProps) {
  const { t } = useTranslation();
  const { data: rubReference = [], isLoading: refLoading, error: refError } = useRubReference();
  const {
    enriched,
    certMap,
    isLoading: certLoading,
    error: certError,
    refetch,
  } = useRubCertifications(studentId);

  const { homeworkItems } = useRevisionHomework(studentId);
  const { data: dashboardData } = useStudentDashboard(studentId);
  const schoolId = dashboardData?.student?.school_id ?? '';
  const requestRevision = useRequestRevision();

  const [selectedCert, setSelectedCert] = useState<EnrichedCertification | null>(null);
  const [selectedRef, setSelectedRef] = useState<RubRef | null>(null);

  // Group into 30 juz rows
  const juzRows = useMemo(() => {
    if (rubReference.length === 0) return [];
    const rows: RubRef[][] = [];
    for (let juz = 1; juz <= 30; juz++) {
      rows.push(rubReference.filter((r) => r.juz_number === juz));
    }
    return rows;
  }, [rubReference]);

  // Stats
  const certifiedCount = enriched.length;
  const totalReviews = useMemo(
    () => enriched.reduce((sum, c) => sum + c.review_count, 0),
    [enriched],
  );

  const homeworkRubNumbers = useMemo(
    () => new Set(homeworkItems.map((h) => h.rubNumber)),
    [homeworkItems],
  );

  const handleCellPress = useCallback(
    (rubNumber: number) => {
      const cert = certMap.get(rubNumber);
      const ref = rubReference.find((r) => r.rub_number === rubNumber) ?? null;
      if (cert) {
        setSelectedCert(cert);
        setSelectedRef(ref);
      }
    },
    [certMap, rubReference],
  );

  const handleAddToPlan = useCallback(() => {
    if (selectedCert && selectedRef) {
      requestRevision.mutate({
        studentId,
        schoolId,
        reference: selectedRef,
      });
    }
  }, [selectedCert, selectedRef, studentId, schoolId, requestRevision]);

  const handleCloseSheet = useCallback(() => {
    setSelectedCert(null);
    setSelectedRef(null);
  }, []);

  if (refLoading || certLoading) return <LoadingState />;
  if (refError || certError) {
    return (
      <ErrorState
        description={(refError as Error)?.message ?? (certError as Error)?.message ?? ''}
        onRetry={refetch}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header stats */}
      <View style={styles.header}>
        <Text style={styles.statsText}>
          {t('student.journey.mapStats', { certified: certifiedCount })}
        </Text>
        <Text style={styles.statsSubtext}>
          {t('student.journey.totalReviews', { count: totalReviews })}
        </Text>
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <Text style={styles.legendLabel}>{t('student.journey.legendLess')}</Text>
        {HEATMAP_LEGEND.map((entry, i) => (
          <View
            key={i}
            style={[styles.legendBox, { backgroundColor: entry.color }]}
          />
        ))}
        <Text style={styles.legendLabel}>{t('student.journey.legendMore')}</Text>
      </View>

      {/* Grid */}
      <ScrollView
        style={styles.grid}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
      >
        {juzRows.map((row, juzIdx) => {
          const juzNumber = juzIdx + 1;
          const isRTL = I18nManager.isRTL;

          return (
            <View
              key={juzNumber}
              style={[
                styles.juzRow,
                isRTL && styles.juzRowRTL,
              ]}
            >
              <View style={styles.juzLabel}>
                <Text style={styles.juzText}>{juzNumber}</Text>
              </View>
              <View style={[styles.cellsRow, isRTL && styles.cellsRowRTL]}>
                {row.map((rub) => {
                  const cert = certMap.get(rub.rub_number);
                  return (
                    <HeatMapCell
                      key={rub.rub_number}
                      rubNumber={rub.rub_number}
                      reviewCount={cert ? cert.review_count : null}
                      size={CELL_SIZE}
                      onPress={() => handleCellPress(rub.rub_number)}
                    />
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Detail sheet */}
      <RevisionSheet
        visible={!!selectedCert}
        certification={selectedCert}
        reference={selectedRef}
        onClose={handleCloseSheet}
        mode="student"
        canSelfAssign={true}
        alreadyInPlan={
          selectedCert ? homeworkRubNumbers.has(selectedCert.rub_number) : false
        }
        isAddingToPlan={requestRevision.isPending}
        onAddToPlan={handleAddToPlan}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: PADDING,
    paddingTop: spacing.sm,
    gap: normalize(2),
  },
  statsText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(18),
    color: colors.neutral[900],
  },
  statsSubtext: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(12),
    color: colors.neutral[500],
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
    paddingHorizontal: PADDING,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  legendLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: normalize(11),
    color: colors.neutral[500],
  },
  legendBox: {
    width: normalize(14),
    height: normalize(14),
    borderRadius: normalize(2),
  },
  grid: {
    flex: 1,
  },
  gridContent: {
    paddingHorizontal: PADDING,
    paddingBottom: spacing.xl,
    gap: GAP,
  },
  juzRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP,
  },
  juzRowRTL: {
    flexDirection: 'row-reverse',
  },
  juzLabel: {
    width: JUZ_LABEL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  juzText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: normalize(11),
    color: colors.neutral[400],
  },
  cellsRow: {
    flexDirection: 'row',
    gap: GAP,
  },
  cellsRowRTL: {
    flexDirection: 'row-reverse',
  },
});
