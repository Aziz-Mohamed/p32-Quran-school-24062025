jest.mock('@/i18n/config', () => ({
  __esModule: true,
  default: { language: 'en' },
}));

import {
  getLocalizedName,
  getLocalizedFirstName,
  buildNameLocalized,
  getCanonicalName,
} from './localized-name';

// ─── getLocalizedName ───────────────────────────────────────────────────────

describe('getLocalizedName', () => {
  it('returns the name for the current language', () => {
    expect(getLocalizedName({ en: 'Ahmed', ar: 'أحمد' }, null, 'en')).toBe('Ahmed');
  });

  it('returns Arabic when lang is ar', () => {
    expect(getLocalizedName({ en: 'Ahmed', ar: 'أحمد' }, null, 'ar')).toBe('أحمد');
  });

  it('falls back to English when current language is missing', () => {
    expect(getLocalizedName({ en: 'Ahmed' }, null, 'fr')).toBe('Ahmed');
  });

  it('falls back to first available value when no en key', () => {
    expect(getLocalizedName({ ar: 'أحمد' }, null, 'fr')).toBe('أحمد');
  });

  it('falls back to fallbackName when map is empty', () => {
    expect(getLocalizedName({}, 'Ahmed Ali', 'en')).toBe('Ahmed Ali');
  });

  it('returns em dash when everything is empty', () => {
    expect(getLocalizedName({}, null, 'en')).toBe('\u2014');
  });

  it('handles null/undefined nameLocalized gracefully', () => {
    expect(getLocalizedName(null, 'Fallback', 'en')).toBe('Fallback');
    expect(getLocalizedName(undefined, null, 'en')).toBe('\u2014');
  });

  it('handles array nameLocalized gracefully', () => {
    expect(getLocalizedName(['not', 'a', 'map'], 'Fallback', 'en')).toBe('Fallback');
  });

  it('uses i18n.language as default when no lang param', () => {
    // The mock sets i18n.language = 'en'
    expect(getLocalizedName({ en: 'Ahmed', ar: 'أحمد' }, null)).toBe('Ahmed');
  });
});

// ─── getLocalizedFirstName ──────────────────────────────────────────────────

describe('getLocalizedFirstName', () => {
  it('returns the first word of the localized name', () => {
    expect(getLocalizedFirstName({ en: 'Ahmed Ali' }, null, 'en')).toBe('Ahmed');
  });

  it('returns the whole name if single word', () => {
    expect(getLocalizedFirstName({ en: 'Ahmed' }, null, 'en')).toBe('Ahmed');
  });

  it('uses fallback chain from getLocalizedName', () => {
    expect(getLocalizedFirstName({}, 'Mohamed Hassan', 'en')).toBe('Mohamed');
  });
});

// ─── buildNameLocalized ─────────────────────────────────────────────────────

describe('buildNameLocalized', () => {
  it('filters out empty strings', () => {
    expect(buildNameLocalized({ en: 'Ahmed', ar: '' })).toEqual({ en: 'Ahmed' });
  });

  it('trims whitespace', () => {
    expect(buildNameLocalized({ en: '  Ahmed  ' })).toEqual({ en: 'Ahmed' });
  });

  it('returns empty object when all entries are empty', () => {
    expect(buildNameLocalized({ en: '', ar: '  ' })).toEqual({});
  });

  it('preserves all non-empty entries', () => {
    const result = buildNameLocalized({ en: 'Ahmed', ar: 'أحمد', fr: 'Ahmed' });
    expect(result).toEqual({ en: 'Ahmed', ar: 'أحمد', fr: 'Ahmed' });
  });
});

// ─── getCanonicalName ───────────────────────────────────────────────────────

describe('getCanonicalName', () => {
  it('prefers English name', () => {
    expect(getCanonicalName({ en: 'Ahmed', ar: 'أحمد' })).toBe('Ahmed');
  });

  it('falls back to first available when no English', () => {
    expect(getCanonicalName({ ar: 'أحمد' })).toBe('أحمد');
  });

  it('returns empty string for empty map', () => {
    expect(getCanonicalName({})).toBe('');
  });
});
