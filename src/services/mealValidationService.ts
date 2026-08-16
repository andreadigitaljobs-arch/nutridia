import type {
  MealRule,
  UserFoodRule,
  FoodPortion,
  MealOptionItem,
  Food,
} from '@/types';

interface MealOption {
  items: MealOptionItem[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateMealOption(
  option: MealOption,
  mealRules: MealRule[],
  userFoodRules: UserFoodRule[],
  portions: FoodPortion[],
  restrictions?: { maxCalories?: number }
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const prohibitedIds = new Set(
    userFoodRules
      .filter((r) => r.status === 'prohibited')
      .map((r) => r.food_id)
  );

  const hardBlockIds = new Set(
    userFoodRules
      .filter((r) => r.hard_block)
      .map((r) => r.food_id)
  );

  const foodIds = new Set<string>();

  for (const item of option.items) {
    if (item.food_id && prohibitedIds.has(item.food_id)) {
      errors.push(`"${item.food_name}" está prohibido en tu plan`);
    }

    if (item.food_id && hardBlockIds.has(item.food_id)) {
      errors.push(`"${item.food_name}" es un alimento de bloqueo duro y no puede estar presente`);
    }

    if (item.food_id && foodIds.has(item.food_id)) {
      errors.push(`"${item.food_name}" está duplicado en la opción`);
    }
    if (item.food_id) foodIds.add(item.food_id);
  }

  const categoryCounts: Record<string, number> = {};
  for (const item of option.items) {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + item.servings;
  }

  for (const rule of mealRules) {
    const count = categoryCounts[rule.category] || 0;
    if (count < rule.required_servings) {
      errors.push(
        `Faltan porciones de ${rule.category}: se requieren ${rule.required_servings}, hay ${count}`
      );
    }
    if (count > rule.required_servings) {
      warnings.push(
        `Exceso de porciones de ${rule.category}: se esperaban ${rule.required_servings}, hay ${count}`
      );
    }
  }

  for (const item of option.items) {
    const portion = portions.find((p) => p.food_id === item.food_id);
    if (portion) {
      const expectedAmount = portion.amount * portion.servings;
      if (Math.abs(item.amount - expectedAmount) > 0.1) {
        warnings.push(
          `La cantidad de "${item.food_name}" (${item.amount} ${item.unit}) difiere de la porción configurada (${expectedAmount} ${item.unit})`
        );
      }
    }
  }

  if (restrictions?.maxCalories) {
    const totalCalories = option.items.reduce(
      (sum, item) => sum + item.amount * item.servings,
      0
    );
    if (totalCalories > restrictions.maxCalories) {
      warnings.push(
        `Las calorías estimadas (${totalCalories}) exceden el límite de ${restrictions.maxCalories}`
      );
    }
  }

  if (option.items.length === 0) {
    errors.push('La opción no tiene alimentos');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
