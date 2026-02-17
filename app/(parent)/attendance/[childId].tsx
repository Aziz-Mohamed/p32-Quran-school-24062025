import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '@/components/feedback';
import { useAttendanceCalendar, useAttendanceRate } from '@/features/attendance/hooks/useAttendance';
import { typography } from '@/theme/typography';
import { lightTheme, colors, semantic } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { normalize } from '@/theme/normalize';

const STATUS_DOT_COLORS: Record<string, string> = {
  present: semantic.success,
  absent: semantic.error,
  late: semantic.warning,
  excused: semantic.info,
};

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

// ─── Attendance Calendar Screen ──────────────────────────────────────────────

export default function AttendanceCalendarScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { childId } = useLocalSearchParams<{ childId: string }>();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: calendar = [], isLoading, error, refetch } = useAttendanceCalendar(
    childId,
    month,
    year,
  );
  const { data: rate } = useAttendanceRate(childId);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // Build calendar grid
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const calendarMap = new Map<number, string>();
  for (const entry of calendar) {
    const day = new Date(entry.date).getDate();
    calendarMap.set(day, entry.status);
  }

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState description={(error as Error).message} onRetry={refetch} />;

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Button
          title={t('common.back')}
          onPress={() => router.back()}
          variant="ghost"
          size="sm"
        />

        <Text style={styles.title}>{t('parent.attendanceCalendar')}</Text>

        {/* Overall Rate */}
        {rate && (
          <Card variant="outlined" style={styles.rateCard}>
            <Text style={styles.rateValue}>{rate.rate}%</Text>
            <Text style={styles.rateLabel}>{t('dashboard.attendanceRate')}</Text>
            <View style={styles.rateBreakdown}>
              <Text style={[styles.breakdownItem, { color: semantic.success }]}>
                {t('admin.attendance.status.present')}: {rate.present}
              </Text>
              <Text style={[styles.breakdownItem, { color: semantic.error }]}>
                {t('admin.attendance.status.absent')}: {rate.absent}
              </Text>
              <Text style={[styles.breakdownItem, { color: semantic.warning }]}>
                {t('admin.attendance.status.late')}: {rate.late}
              </Text>
              <Text style={[styles.breakdownItem, { color: semantic.info }]}>
                {t('admin.attendance.status.excused')}: {rate.excused}
              </Text>
            </View>
          </Card>
        )}

        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <Button title="‹" onPress={handlePrevMonth} variant="ghost" size="sm" />
          <Text style={styles.monthTitle}>{monthName} {year}</Text>
          <Button title="›" onPress={handleNextMonth} variant="ghost" size="sm" />
        </View>

        {/* Day Headers */}
        <View style={styles.weekHeader}>
          {DAY_KEYS.map((d) => (
            <Text key={d} style={styles.weekDay}>{t(`common.daysShort.${d}`)}</Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {calendarCells.map((day, i) => {
            const status = day ? calendarMap.get(day) : undefined;
            return (
              <View key={i} style={styles.calendarCell}>
                {day && (
                  <>
                    <Text style={styles.dayNumber}>{day}</Text>
                    {status && (
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: STATUS_DOT_COLORS[status] ?? lightTheme.textTertiary },
                        ]}
                      />
                    )}
                  </>
                )}
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {Object.entries(STATUS_DOT_COLORS).map(([key, color]) => (
            <View key={key} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{t(`admin.attendance.status.${key}`)}</Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.textStyles.heading,
    color: lightTheme.text,
  },
  rateCard: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  rateValue: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: lightTheme.text,
  },
  rateLabel: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
  },
  rateBreakdown: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  breakdownItem: {
    ...typography.textStyles.caption,
    fontFamily: typography.fontFamily.medium,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthTitle: {
    ...typography.textStyles.subheading,
    color: lightTheme.text,
  },
  weekHeader: {
    flexDirection: 'row',
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
    fontFamily: typography.fontFamily.medium,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(2),
  },
  dayNumber: {
    ...typography.textStyles.caption,
    color: lightTheme.text,
  },
  statusDot: {
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  legendDot: {
    width: normalize(10),
    height: normalize(10),
    borderRadius: normalize(5),
  },
  legendText: {
    ...typography.textStyles.caption,
    color: lightTheme.textSecondary,
  },
});
