import { formatTimeHHMM, formatTimeDisplay } from './time-format';

describe('formatTimeHHMM', () => {
  it('formats midnight as 00:00', () => {
    expect(formatTimeHHMM(new Date(2025, 0, 1, 0, 0))).toBe('00:00');
  });

  it('formats noon as 12:00', () => {
    expect(formatTimeHHMM(new Date(2025, 0, 1, 12, 0))).toBe('12:00');
  });

  it('pads single-digit hours', () => {
    expect(formatTimeHHMM(new Date(2025, 0, 1, 9, 30))).toBe('09:30');
  });

  it('pads single-digit minutes', () => {
    expect(formatTimeHHMM(new Date(2025, 0, 1, 14, 5))).toBe('14:05');
  });

  it('formats late evening correctly', () => {
    expect(formatTimeHHMM(new Date(2025, 0, 1, 23, 59))).toBe('23:59');
  });
});

describe('formatTimeDisplay', () => {
  it('formats midnight as 12:00 AM', () => {
    expect(formatTimeDisplay(new Date(2025, 0, 1, 0, 0))).toBe('12:00 AM');
  });

  it('formats noon as 12:00 PM', () => {
    expect(formatTimeDisplay(new Date(2025, 0, 1, 12, 0))).toBe('12:00 PM');
  });

  it('formats morning time correctly', () => {
    expect(formatTimeDisplay(new Date(2025, 0, 1, 9, 30))).toBe('9:30 AM');
  });

  it('formats afternoon time correctly', () => {
    expect(formatTimeDisplay(new Date(2025, 0, 1, 14, 5))).toBe('2:05 PM');
  });

  it('formats 1 AM correctly', () => {
    expect(formatTimeDisplay(new Date(2025, 0, 1, 1, 0))).toBe('1:00 AM');
  });

  it('formats 11:59 PM correctly', () => {
    expect(formatTimeDisplay(new Date(2025, 0, 1, 23, 59))).toBe('11:59 PM');
  });
});
