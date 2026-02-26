import { generateUsername } from './username';

describe('generateUsername', () => {
  it('generates username from ASCII name with 3-digit suffix', () => {
    const result = generateUsername('Ahmed Ali');
    expect(result).toMatch(/^ahmedali_\d{3}$/);
  });

  it('lowercases the name', () => {
    const result = generateUsername('JOHN DOE');
    expect(result).toMatch(/^johndoe_\d{3}$/);
  });

  it('strips non-alphanumeric characters', () => {
    const result = generateUsername("Ahmad O'Brien");
    expect(result).toMatch(/^ahmadobrien_\d{3}$/);
  });

  it('falls back to "user" prefix for Arabic-only names', () => {
    const result = generateUsername('أحمد علي');
    expect(result).toMatch(/^user_\d{3}$/);
  });

  it('falls back to "user" prefix for empty string', () => {
    const result = generateUsername('');
    expect(result).toMatch(/^user_\d{3}$/);
  });

  it('generates suffix between 100 and 999', () => {
    for (let i = 0; i < 50; i++) {
      const result = generateUsername('Test');
      const suffix = parseInt(result.split('_')[1], 10);
      expect(suffix).toBeGreaterThanOrEqual(100);
      expect(suffix).toBeLessThanOrEqual(999);
    }
  });
});
