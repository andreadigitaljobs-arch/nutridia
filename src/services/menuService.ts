import { supabase } from '@/lib/supabase';
import type { DailyMenu, DailyMenuOption, MealOptionItem } from '@/types';

interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

export async function getTodayMenu(
  userId: string,
  planId: string
): Promise<ServiceResult<DailyMenu>> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_menus')
    .select('*')
    .eq('user_id', userId)
    .eq('plan_id', planId)
    .eq('date', today)
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function generateDailyMenu(
  userId: string,
  planId: string,
  date: string
): Promise<ServiceResult<DailyMenu>> {
  const { data: existing } = await supabase
    .from('daily_menus')
    .select('*')
    .eq('user_id', userId)
    .eq('plan_id', planId)
    .eq('date', date)
    .single();

  if (existing) return { data: existing, error: null };

  const { data: menu, error: menuError } = await supabase
    .from('daily_menus')
    .insert({
      user_id: userId,
      plan_id: planId,
      date,
      status: 'generated',
    })
    .select()
    .single();

  if (menuError) return { data: null, error: menuError.message };
  return { data: menu, error: null };
}

export async function selectMenuOption(
  menuOptionId: string,
  userId: string
): Promise<{ error: string | null }> {
  const { data: option, error: fetchError } = await supabase
    .from('daily_menu_options')
    .select('menu_id, meal_type_id')
    .eq('id', menuOptionId)
    .single();

  if (fetchError) return { error: fetchError.message };

  const { error } = await supabase
    .from('daily_menu_options')
    .update({ is_selected: false })
    .eq('menu_id', option.menu_id)
    .eq('meal_type_id', option.meal_type_id);

  if (error) return { error: error.message };

  const { error: selectError } = await supabase
    .from('daily_menu_options')
    .update({ is_selected: true })
    .eq('id', menuOptionId);

  if (selectError) return { error: selectError.message };
  return { error: null };
}

export async function saveOptionsToCollection(
  optionIds: string[],
  userId: string
): Promise<{ error: string | null }> {
  const inserts = optionIds.map((optionId) => ({
    user_id: userId,
    option_id: optionId,
    status: 'to_try' as const,
  }));

  const { error } = await supabase.from('collection_items').insert(inserts);
  if (error) return { error: error.message };

  await supabase
    .from('daily_menu_options')
    .update({ was_saved_to_collection: true })
    .in('id', optionIds);

  return { error: null };
}

export async function getMenuOptions(
  menuId: string,
  mealTypeId: string
): Promise<ServiceResult<DailyMenuOption[]>> {
  const { data, error } = await supabase
    .from('daily_menu_options')
    .select('*')
    .eq('menu_id', menuId)
    .eq('meal_type_id', mealTypeId)
    .order('sort_order');

  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

export async function getMenuOptionItems(
  optionId: string
): Promise<ServiceResult<MealOptionItem[]>> {
  const { data, error } = await supabase
    .from('meal_option_items')
    .select('*')
    .eq('option_id', optionId);

  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}
