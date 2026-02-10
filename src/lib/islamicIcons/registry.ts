import type React from 'react';
import type { IslamicIconName, IslamicIconProps, IslamicIconCategory } from './types';
import {
  MosqueIcon,
  QuranIcon,
  KaabaIcon,
  PrayerBeadsIcon,
  LanternIcon,
  PrayerMatIcon,
  DuaHandsIcon,
  CrescentMoonIcon,
  IslamicStarIcon,
  SunIcon,
  DomeIcon,
  MinaretIcon,
  ArchIcon,
  GeometricPatternIcon,
  PalmTreeIcon,
  OliveBranchIcon,
  DesertIcon,
  SwordIcon,
  ShieldIcon,
  CrownIcon,
  MedalIcon,
  BismillahIcon,
  MashallahIcon,
  AlhamdulillahIcon,
} from './icons';

export const ISLAMIC_ICON_REGISTRY: Record<IslamicIconName, React.FC<IslamicIconProps>> = {
  'mosque': MosqueIcon,
  'quran': QuranIcon,
  'kaaba': KaabaIcon,
  'crescent-moon': CrescentMoonIcon,
  'prayer-beads': PrayerBeadsIcon,
  'lantern': LanternIcon,
  'prayer-mat': PrayerMatIcon,
  'dua-hands': DuaHandsIcon,
  'islamic-star': IslamicStarIcon,
  'dome': DomeIcon,
  'minaret': MinaretIcon,
  'arch': ArchIcon,
  'geometric-pattern': GeometricPatternIcon,
  'palm-tree': PalmTreeIcon,
  'olive-branch': OliveBranchIcon,
  'sword': SwordIcon,
  'shield': ShieldIcon,
  'crown': CrownIcon,
  'bismillah': BismillahIcon,
  'mashallah': MashallahIcon,
  'alhamdulillah': AlhamdulillahIcon,
  'sun': SunIcon,
  'desert': DesertIcon,
  'medal': MedalIcon,
};

export const DEFAULT_STICKER_ICON: IslamicIconName = 'islamic-star';

export const ALL_ICON_NAMES = Object.keys(ISLAMIC_ICON_REGISTRY) as IslamicIconName[];

export const ISLAMIC_ICON_CATEGORIES: IslamicIconCategory[] = [
  {
    key: 'worship',
    icons: ['mosque', 'quran', 'kaaba', 'prayer-mat', 'prayer-beads', 'dua-hands'],
  },
  {
    key: 'celestial',
    icons: ['crescent-moon', 'islamic-star', 'lantern', 'sun'],
  },
  {
    key: 'architecture',
    icons: ['dome', 'minaret', 'arch', 'geometric-pattern'],
  },
  {
    key: 'nature',
    icons: ['palm-tree', 'olive-branch', 'desert'],
  },
  {
    key: 'achievement',
    icons: ['sword', 'shield', 'crown', 'medal'],
  },
  {
    key: 'calligraphy',
    icons: ['bismillah', 'mashallah', 'alhamdulillah'],
  },
];

/**
 * Checks if a stored `image_url` value is a legacy emoji (not an icon key).
 */
export function isEmojiValue(value: string): boolean {
  if (!value) return false;
  if (value in ISLAMIC_ICON_REGISTRY) return false;
  return /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[\u{FE00}-\u{FEFF}]/u.test(value);
}
