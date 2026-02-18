import type { ColorValue } from 'react-native';

export interface IslamicIconProps {
  size?: number;
  color?: ColorValue;
}

export type IslamicIconName =
  | 'mosque'
  | 'quran'
  | 'kaaba'
  | 'crescent-moon'
  | 'prayer-beads'
  | 'lantern'
  | 'prayer-mat'
  | 'dua-hands'
  | 'islamic-star'
  | 'dome'
  | 'minaret'
  | 'arch'
  | 'geometric-pattern'
  | 'palm-tree'
  | 'olive-branch'
  | 'sword'
  | 'shield'
  | 'crown'
  | 'bismillah'
  | 'mashallah'
  | 'alhamdulillah'
  | 'sun'
  | 'desert'
  | 'medal';

export interface IslamicIconCategory {
  key: string;
  icons: IslamicIconName[];
}
