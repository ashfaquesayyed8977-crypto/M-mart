import { supabase, STORAGE_BUCKET } from '@/lib/supabase';

export async function uploadImage(file: File, folder = 'products'): Promise<{ url: string | null; error: string | null }> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });
  if (error) return { url: null, error: error.message };
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

export async function uploadImages(files: File[], folder = 'products'): Promise<{ urls: string[]; errors: string[] }> {
  const urls: string[] = [];
  const errors: string[] = [];
  for (const file of files) {
    const { url, error } = await uploadImage(file, folder);
    if (url) urls.push(url);
    if (error) errors.push(error);
  }
  return { urls, errors };
}
