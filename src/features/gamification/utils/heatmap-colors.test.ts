import { getHeatMapColor, HEATMAP_LEGEND } from './heatmap-colors';
import type { FreshnessState } from '../types/gamification.types';

describe('getHeatMapColor', () => {
  it.each([
    ['fresh', '#22C55E'],
    ['fading', '#EAB308'],
    ['warning', '#F97316'],
    ['critical', '#EF4444'],
    ['dormant', '#9CA3AF'],
    ['uncertified', '#EBEDF0'],
  ] as const)('returns correct color for state "%s"', (state, expected) => {
    expect(getHeatMapColor(state)).toBe(expected);
  });

  it('returns uncertified color for null', () => {
    expect(getHeatMapColor(null)).toBe('#EBEDF0');
  });
});

describe('HEATMAP_LEGEND', () => {
  it('has 5 legend entries', () => {
    expect(HEATMAP_LEGEND).toHaveLength(5);
  });

  it('each entry has label and color', () => {
    for (const entry of HEATMAP_LEGEND) {
      expect(entry).toHaveProperty('label');
      expect(entry).toHaveProperty('color');
      expect(entry.color).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });
});
