import { supabase } from '@/lib/supabase';
import type { Food, UserFoodRule, FoodPortion } from '@/types';

interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

export async function getFoods(): Promise<ServiceResult<Food[]>> {
  const { data, error } = await supabase.from('foods').select('*').order('name');
  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

export async function getFoodsByCategory(categoryId: string): Promise<ServiceResult<Food[]>> {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .eq('category_id', categoryId)
    .order('name');

  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

export async function getUserFoodRules(
  userId: string,
  planId: string
): Promise<ServiceResult<UserFoodRule[]>> {
  const { data, error } = await supabase
    .from('user_food_rules')
    .select('*')
    .eq('user_id', userId)
    .eq('plan_id', planId);

  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

export async function createUserFoodRule(
  userId: string,
  foodId: string,
  planId: string,
  data: Omit<UserFoodRule, 'id' | 'user_id' | 'food_id' | 'plan_id'>
): Promise<ServiceResult<UserFoodRule>> {
  const { data: created, error } = await supabase
    .from('user_food_rules')
    .insert({
      user_id: userId,
      food_id: foodId,
      plan_id: planId,
      ...data,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: created, error: null };
}

export async function getUserPortions(
  userId: string,
  planId: string
): Promise<ServiceResult<FoodPortion[]>> {
  const { data, error } = await supabase
    .from('food_portions')
    .select('*')
    .eq('user_id', userId)
    .eq('plan_id', planId);

  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

export async function createUserPortion(
  userId: string,
  foodId: string,
  planId: string,
  data: Omit<FoodPortion, 'id' | 'user_id' | 'food_id' | 'plan_id'>
): Promise<ServiceResult<FoodPortion>> {
  const { data: created, error } = await supabase
    .from('food_portions')
    .insert({
      user_id: userId,
      food_id: foodId,
      plan_id: planId,
      ...data,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: created, error: null };
}

export async function searchFoods(query: string): Promise<ServiceResult<Food[]>> {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name');

  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}
