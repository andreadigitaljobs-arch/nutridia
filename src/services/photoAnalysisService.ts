import { supabase } from '@/lib/supabase';
import type { FoodPhotoAnalysis, UploadedPlanDocument } from '@/types';

interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

export async function uploadPhoto(
  file: File,
  userId: string,
  bucket: string = 'food-photos'
): Promise<ServiceResult<string>> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (uploadError) return { data: null, error: uploadError.message };

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return { data: urlData.publicUrl, error: null };
}

export async function analyzePhoto(
  photoUrl: string
): Promise<ServiceResult<FoodPhotoAnalysis>> {
  const placeholder: FoodPhotoAnalysis = {
    id: crypto.randomUUID(),
    user_id: '',
    photo_url: photoUrl,
    detected_items: {
      items: [
        { name: 'Alimento detectado', confidence: 0.85, category: 'unknown' },
      ],
      note: 'Análisis simulado - integración de IA pendiente',
    },
    status: 'placeholder',
    created_at: new Date().toISOString(),
  };

  return { data: placeholder, error: null };
}

export async function savePhotoAnalysis(
  userId: string,
  photoUrl: string,
  detectedItems: Record<string, unknown>
): Promise<ServiceResult<FoodPhotoAnalysis>> {
  const { data, error } = await supabase
    .from('food_photo_analyses')
    .insert({
      user_id: userId,
      photo_url: photoUrl,
      detected_items: detectedItems,
      status: 'analyzed',
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function saveUploadedDocument(
  userId: string,
  fileUrl: string
): Promise<ServiceResult<UploadedPlanDocument>> {
  const { data, error } = await supabase
    .from('uploaded_plan_documents')
    .insert({
      user_id: userId,
      file_url: fileUrl,
      status: 'uploaded',
      detected_data: null,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}
