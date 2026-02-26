import { StyleSheet } from 'react-native';
import { lightTheme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export const styles = StyleSheet.create({
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
