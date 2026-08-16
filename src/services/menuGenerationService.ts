import { supabase } from '@/lib/supabase';
import type { MealRule, UserFoodRule, FoodPortion, Food, MealOptionItem } from '@/types';
import { shuffleArray, calculatePortionAmount, generateOptionName } from '@/utils/menuGenerator';
import { validateMealOption } from './mealValidationService';

interface GeneratedOption {
  name: string;
  items: Omit<MealOptionItem, 'id' | 'option_id'>[];
  estimatedCalories: number;
  isValid: boolean;
}

async function getAvailableFoods(
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

  const { data: rules } = await supabase
    .from('user_food_rules')
    .select('food_id')
    .eq('user_id', userId)
    .eq('plan_id', planId)
    .eq('status', 'allowed');

  if (!rules || rules.length === 0) return [];

  const allowedIds = rules.map((r) => r.food_id);

  const { data: foods } = await supabase
    .from('foods')
    .select('*')
    .eq('category_id', category.id)
    .in('id', allowedIds);

  return foods ?? [];
}

async function getRecentMealFoodIds(userId: string, days: number = 3): Promise<Set<string>> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split('T')[0];

  const { data: logs } = await supabase
    .from('meal_logs')
    .select('foods')
    .eq('user_id', userId)
    .gte('date', sinceStr);

  const recentIds = new Set<string>();
  if (logs) {
    for (const log of logs) {
      const foods = log.foods as Record<string, unknown>;
      if (foods && Array.isArray(foods.items)) {
        for (const item of foods.items as { food_id?: string }[]) {
          if (item.food_id) recentIds.add(item.food_id);
        }
      }
    }
  }
  return recentIds;
}

function pickRandom<T>(arr: T[], exclude?: Set<string>): T | undefined {
  const filtered = exclude ? arr.filter((item) => {
    const id = (item as unknown as { id: string }).id;
    return !exclude.has(id);
  }) : arr;
  if (filtered.length === 0) return arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : undefined;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export async function generateMealOptions(
  planId: string,
  userId: string,
  mealTypeId: string,
  count: number = 4
): Promise<GeneratedOption[]> {
  const { data: mealRules } = await supabase
    .from('meal_rules')
    .select('*')
    .eq('plan_id', planId)
    .eq('meal_type_id', mealTypeId);

  if (!mealRules || mealRules.length === 0) return [];

  const { data: userFoodRules } = await supabase
    .from('user_food_rules')
    .select('*')
    .eq('user_id', userId)
    .eq('plan_id', planId);

  const { data: portions } = await supabase
    .from('food_portions')
    .select('*')
    .eq('user_id', userId)
    .eq('plan_id', planId);

  const recentFoodIds = await getRecentMealFoodIds(userId, 3);

  const foodsByCategory: Record<string, Food[]> = {};
  const categoryNames = [...new Set(mealRules.map((r) => r.category))];

  for (const cat of categoryNames) {
    foodsByCategory[cat] = await getAvailableFoods(userId, planId, cat);
  }

  const options: GeneratedOption[] = [];

  for (let i = 0; i < count; i++) {
    const items: Omit<MealOptionItem, 'id' | 'option_id'>[] = [];
    let isValid = true;

    for (const rule of mealRules) {
      const available = foodsByCategory[rule.category] || [];
      if (available.length === 0) {
        isValid = false;
        continue;
      }

      const recentIds = i < 2 ? recentFoodIds : new Set<string>();

      for (let s = 0; s < rule.required_servings; s++) {
        const food = pickRandom(available, recentIds);
        if (!food) {
          isValid = false;
          continue;
        }

        const portion = portions?.find((p) => p.food_id === food.id);
        const amount = portion
          ? calculatePortionAmount(food, portion)
          : food.calories_per_100g ?? 0;

        items.push({
          food_id: food.id,
          food_name: food.name,
          category: rule.category,
          amount,
          unit: food.default_unit,
          servings: portion?.servings ?? 1,
          preparation_notes: null,
          created_at: new Date().toISOString(),
        });
      }
    }

    const estimatedCalories = items.reduce(
      (sum, item) => sum + item.amount * item.servings,
      0
    );

    const validation = validateMealOption(
      { items: items as MealOptionItem[] },
      mealRules,
      userFoodRules ?? [],
      portions ?? []
    );

    options.push({
      name: generateOptionName(items as MealOptionItem[]),
      items,
      estimatedCalories,
      isValid: validation.isValid,
    });
  }

  return options.filter((o) => o.isValid);
}
