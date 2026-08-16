import { supabase } from '@/lib/supabase';
import type { MealLog } from '@/types';

interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

export async function getMealLogs(
  userId: string,
  date: string
): Promise<ServiceResult<MealLog[]>> {
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('time', { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

export async function logMeal(
  userId: string,
  data: {
    meal_type_id: string;
    option_id?: string;
    date: string;
    time: string;
    foods: Record<string, unknown>;
    estimated_calories?: number;
    notes?: string;
    photo_url?: string;
  }
): Promise<ServiceResult<MealLog>> {
  const { data: created, error } = await supabase
    .from('meal_logs')
    .insert({
      user_id: userId,
      meal_type_id: data.meal_type_id,
      option_id: data.option_id ?? null,
      date: data.date,
      time: data.time,
      foods: data.foods,
      estimated_calories: data.estimated_calories ?? null,
      notes: data.notes ?? null,
      photo_url: data.photo_url ?? null,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: created, error: null };
}

export async function logManualMeal(
  userId: string,
  data: {
    meal_type_id: string;
    date: string;
    time: string;
    foods: Record<string, unknown>;
    estimated_calories?: number;
    notes?: string;
  }
): Promise<ServiceResult<MealLog>> {
  const { data: created, error } = await supabase
    .from('meal_logs')
    .insert({
      user_id: userId,
      meal_type_id: data.meal_type_id,
      option_id: null,
      date: data.date,
      time: data.time,
      foods: data.foods,
      estimated_calories: data.estimated_calories ?? null,
      notes: data.notes ?? null,
      photo_url: null,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: created, error: null };
}

export async function getMealLog(
  userId: string,
  logId: string
): Promise<ServiceResult<MealLog>> {
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('id', logId)
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}
