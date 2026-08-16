import { supabase } from '@/lib/supabase';
import type { HydrationLog } from '@/types';

interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

export async function getTodayHydration(
  userId: string,
  date?: string
): Promise<ServiceResult<HydrationLog[]>> {
  const targetDate = date || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('hydration_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', targetDate)
    .order('created_at', { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

export async function addHydrationLog(
  userId: string,
  amountMl: number,
  date?: string
): Promise<ServiceResult<HydrationLog>> {
  const targetDate = date || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('hydration_logs')
    .insert({
      user_id: userId,
      amount_ml: amountMl,
      date: targetDate,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function getHydrationHistory(
  userId: string,
  days: number = 7
): Promise<ServiceResult<HydrationLog[]>> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('hydration_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', sinceStr)
    .order('date', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}
