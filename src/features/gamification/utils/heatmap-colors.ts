// GitHub-style green intensity scale based on review_count.
// The more a rub' is revised, the darker the green.

const HEATMAP_LEVELS = [
  { max: -1, color: '#EBEDF0' }, // uncertified (gray)
  { max: 0, color: '#9BE9A8' },  // certified, no reviews yet
  { max: 2, color: '#40C463' },  // 1-2 reviews
  { max: 5, color: '#30A14E' },  // 3-5 reviews
  { max: 10, color: '#216E39' }, // 6-10 reviews
  { max: Infinity, color: '#0E4429' }, // 11+ reviews (mastery)
] as const;

/**
 * Get heatmap color for a rub' based on review count.
 * Pass `null` for uncertified rub'.
 */
export function getHeatMapColor(reviewCount: number | null): string {
  if (reviewCount === null) return HEATMAP_LEVELS[0].color;
  if (reviewCount <= 0) return HEATMAP_LEVELS[1].color;
  if (reviewCount <= 2) return HEATMAP_LEVELS[2].color;
  if (reviewCount <= 5) return HEATMAP_LEVELS[3].color;
  if (reviewCount <= 10) return HEATMAP_LEVELS[4].color;
  return HEATMAP_LEVELS[5].color;
}

/** Legend entries for the heatmap */
export const HEATMAP_LEGEND = [
  { label: 'Less', color: HEATMAP_LEVELS[0].color },
  { label: '', color: HEATMAP_LEVELS[1].color },
  { label: '', color: HEATMAP_LEVELS[2].color },
  { label: '', color: HEATMAP_LEVELS[3].color },
  { label: '', color: HEATMAP_LEVELS[4].color },
  { label: 'More', color: HEATMAP_LEVELS[5].color },
] as const;
