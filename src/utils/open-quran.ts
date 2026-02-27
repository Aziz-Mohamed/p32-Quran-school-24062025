import { Alert, Linking } from 'react-native';
import i18n from '@/i18n/config';

export interface QuranRange {
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

/**
 * Build a Quran.com URL for a given verse range.
 * - Same surah: https://quran.com/2/255-260
 * - Cross-surah: https://quran.com/2/255 (starts reading from there)
 */
export function buildQuranUrl(range: QuranRange): string {
  if (range.startSurah === range.endSurah) {
    if (range.startAyah === range.endAyah) {
      return `https://quran.com/${range.startSurah}/${range.startAyah}`;
    }
    return `https://quran.com/${range.startSurah}/${range.startAyah}-${range.endAyah}`;
  }
  return `https://quran.com/${range.startSurah}/${range.startAyah}`;
}

/**
 * Open the given verse range in the Quran.com app (or mobile browser fallback).
 */
export async function openInQuranApp(range: QuranRange): Promise<void> {
  const url = buildQuranUrl(range);

  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(
      i18n.t('scheduling.recitationPlan.openInQuranError'),
      i18n.t('scheduling.recitationPlan.openInQuranErrorMessage'),
      [{ text: i18n.t('common.done') }],
    );
  }
}
