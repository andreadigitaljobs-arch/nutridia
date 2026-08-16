import { supabase } from '@/lib/supabase';
import type { CollectionItem, CollectionStatus } from '@/types';

interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

export async function getCollectionItems(
  userId: string,
  status?: CollectionStatus
): Promise<ServiceResult<CollectionItem[]>> {
  let query = supabase
    .from('collection_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

export async function addToCollection(
  userId: string,
  optionId: string,
  status: CollectionStatus = 'to_try'
): Promise<ServiceResult<CollectionItem>> {
  const { data, error } = await supabase
    .from('collection_items')
    .insert({
      user_id: userId,
      option_id: optionId,
      status,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function updateCollectionItem(
  itemId: string,
  status: CollectionStatus
): Promise<ServiceResult<CollectionItem>> {
  const { data, error } = await supabase
    .from('collection_items')
    .update({ status })
    .eq('id', itemId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function removeFromCollection(
  itemId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('collection_items')
    .delete()
    .eq('id', itemId);

  if (error) return { error: error.message };
  return { error: null };
}
