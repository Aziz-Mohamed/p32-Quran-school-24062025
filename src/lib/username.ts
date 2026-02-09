/**
 * Generate a username from a full name.
 * Format: lowercase name concatenated + underscore + 3 random digits (100-999)
 * Example: "Ahmed Ali" -> "ahmedali_342"
 */
export function generateUsername(fullName: string): string {
  const base = fullName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const suffix = Math.floor(Math.random() * 900 + 100);
  return `${base}_${suffix}`;
}
