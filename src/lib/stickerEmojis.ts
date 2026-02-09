/**
 * Curated emoji options for stickers.
 * Grouped into kid-friendly categories for a Quran school context.
 * The `image_url` column stores the emoji character directly.
 */

export interface StickerEmojiOption {
  emoji: string;
  label: string;
}

export interface StickerEmojiCategory {
  key: string;
  emojis: StickerEmojiOption[];
}

export const STICKER_EMOJI_CATEGORIES: StickerEmojiCategory[] = [
  {
    key: 'stars',
    emojis: [
      { emoji: '⭐', label: 'Star' },
      { emoji: '🌟', label: 'Glowing Star' },
      { emoji: '✨', label: 'Sparkles' },
      { emoji: '💫', label: 'Dizzy Star' },
      { emoji: '🌠', label: 'Shooting Star' },
    ],
  },
  {
    key: 'trophies',
    emojis: [
      { emoji: '🏆', label: 'Trophy' },
      { emoji: '🥇', label: 'Gold Medal' },
      { emoji: '🥈', label: 'Silver Medal' },
      { emoji: '🥉', label: 'Bronze Medal' },
      { emoji: '🎖️', label: 'Military Medal' },
    ],
  },
  {
    key: 'hearts',
    emojis: [
      { emoji: '❤️', label: 'Red Heart' },
      { emoji: '💚', label: 'Green Heart' },
      { emoji: '💎', label: 'Gem' },
      { emoji: '🤲', label: 'Palms Up' },
      { emoji: '🕌', label: 'Mosque' },
    ],
  },
  {
    key: 'nature',
    emojis: [
      { emoji: '🌙', label: 'Crescent Moon' },
      { emoji: '☀️', label: 'Sun' },
      { emoji: '🌈', label: 'Rainbow' },
      { emoji: '🌷', label: 'Tulip' },
      { emoji: '🌺', label: 'Hibiscus' },
    ],
  },
  {
    key: 'fun',
    emojis: [
      { emoji: '🎉', label: 'Party' },
      { emoji: '🎈', label: 'Balloon' },
      { emoji: '🦁', label: 'Lion' },
      { emoji: '🦋', label: 'Butterfly' },
      { emoji: '🐝', label: 'Bee' },
    ],
  },
  {
    key: 'learning',
    emojis: [
      { emoji: '📖', label: 'Open Book' },
      { emoji: '🎓', label: 'Graduation' },
      { emoji: '✏️', label: 'Pencil' },
      { emoji: '🧠', label: 'Brain' },
      { emoji: '💡', label: 'Lightbulb' },
    ],
  },
];

/** Flat list of all emojis for quick lookup */
export const ALL_STICKER_EMOJIS = STICKER_EMOJI_CATEGORIES.flatMap((c) => c.emojis);

/** Default emoji when none is selected */
export const DEFAULT_STICKER_EMOJI = '⭐';
