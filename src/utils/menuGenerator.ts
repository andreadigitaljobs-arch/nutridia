import { supabase } from '@/lib/supabase';
import type { Food, FoodPortion, UserFoodRule, MealOptionItem } from '@/types';

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function getCarbOptionsForUser(userId: string, planId: string): Promise<Food[]> {
  const { data: carbCategory } = await supabase
    .from('food_categories')
    .select('id')
    .eq('name', 'carb')
    .single();

  if (!carbCategory) return [];

  const { data: allowedRules } = await supabase
    .from('user_food_rules')
    .select('food_id')
    .eq('user_id', userId)
    .eq('plan_id', planId)
    .eq('status', 'allowed');

  if (!allowedRules || allowedRules.length === 0) return [];

  const allowedIds = allowedRules.map((r) => r.food_id);

  const { data: foods } = await supabase
    .from('foods')
    .select('*')
    .eq('category_id', carbCategory.id)
    .in('id', allowedIds);

  return foods ?? [];
}

export async function getProteinOptionsForUser(userId: string, planId: string): Promise<Food[]> {
  const { data: proteinCategory } = await supabase
    .from('food_categories')
    .select('id')
    .eq('name', 'protein')
    .single();

  if (!proteinCategory) return [];

  const { data: allowedRules } = await supabase
    .from('user_food_rules')
    .select('food_id')
    .eq('user_id', userId)
    .eq('plan_id', planId)
    .eq('status', 'allowed');

  if (!allowedRules || allowedRules.length === 0) return [];

  const allowedIds = allowedRules.map((r) => r.food_id);

  const { data: foods } = await supabase
    .from('foods')
    .select('*')
    .eq('category_id', proteinCategory.id)
    .in('id', allowedIds);

  return foods ?? [];
}

export async function getFruitOptionsForUser(userId: string, planId: string): Promise<Food[]> {
  const { data: fruitCategory } = await supabase
    .from('food_categories')
    .select('id')
    .eq('name', 'fruit')
    .single();

  if (!fruitCategory) return [];

  const { data: allowedRules } = await supabase
    .from('user_food_rules')
    .select('food_id')
    .eq('user_id', userId)
    .eq('plan_id', planId)
    .eq('status', 'allowed');

  if (!allowedRules || allowedRules.length === 0) return [];

  const allowedIds = allowedRules.map((r) => r.food_id);

  const { data: foods } = await supabase
    .from('foods')
    .select('*')
    .eq('category_id', fruitCategory.id)
    .in('id', allowedIds);

  return foods ?? [];
}

export async function getOptionsForCategory(
  userId: string,
  planId: string,
  categoryName: string
): Promise<Food[]> {
  const { data: category } = await supabase
    .from('food_categories')
    .select('id')
    .eq('name', categoryName)
    .single();

  if (!category) return [];

  const { data: allowedRules } = await supabase
    .from('user_food_rules')
    .select('food_id')
    .eq('user_id', userId)
    .eq('plan_id', planId)
    .eq('status', 'allowed');

  if (!allowedRules || allowedRules.length === 0) return [];

  const allowedIds = allowedRules.map((r) => r.food_id);

  const { data: foods } = await supabase
    .from('foods')
    .select('*')
    .eq('category_id', category.id)
    .in('id', allowedIds);

  return foods ?? [];
}

export function calculatePortionAmount(food: Food, portion: FoodPortion): number {
  return portion.amount * portion.servings;
}

export function generateOptionName(items: MealOptionItem[]): string {
  return items.map((item) => item.food_name).join(' + ');
}

export function calculateEstimatedCalories(items: MealOptionItem[]): number {
  return items.reduce((sum, item) => {
    return sum + item.amount * (item.servings || 1);
  }, 0);
}
