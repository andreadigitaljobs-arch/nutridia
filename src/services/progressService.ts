import { supabase } from '@/lib/supabase';
import type { WeightHistory, BodyAssessment } from '@/types';

interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

export async function getWeightHistory(userId: string): Promise<ServiceResult<WeightHistory[]>> {
  const { data, error } = await supabase
    .from('weight_history')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

export async function addWeightEntry(
  userId: string,
  data: Omit<WeightHistory, 'id' | 'user_id' | 'created_at'>
): Promise<ServiceResult<WeightHistory>> {
  const { data: created, error } = await supabase
    .from('weight_history')
    .insert({ ...data, user_id: userId })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: created, error: null };
}

export async function getBodyAssessments(
  userId: string
): Promise<ServiceResult<BodyAssessment[]>> {
  const { data, error } = await supabase
    .from('body_assessments')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

export async function addBodyAssessment(
  userId: string,
  data: Omit<BodyAssessment, 'id' | 'user_id'>
): Promise<ServiceResult<BodyAssessment>> {
  const { data: created, error } = await supabase
    .from('body_assessments')
    .insert({ ...data, user_id: userId })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: created, error: null };
}

export async function getLatestAssessment(
  userId: string
): Promise<ServiceResult<BodyAssessment>> {
  const { data, error } = await supabase
    .from('body_assessments')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}
