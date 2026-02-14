import { supabase } from './supabase';

/**
 * Get the public URL for a sticker image in Supabase Storage.
 * Images are stored flat in the `stickers` bucket: stickers/{image_path}
 */
export function getStickerImageUrl(imagePath: string): string {
  const { data } = supabase.storage.from('stickers').getPublicUrl(imagePath);
  return data.publicUrl;
}
