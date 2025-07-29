// src/lib/uploadAvatar.ts
import { supabase } from './supabase';

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const sanitizedFileName = file.name.replace(/[^\w.]+/g, '-');
  const fileName = `${userId}_${Date.now()}_${sanitizedFileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error('Avatar upload failed:', uploadError);
    throw uploadError;
  }

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}
