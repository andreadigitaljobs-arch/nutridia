import type { MealTypeRecord, FoodCategory, CollectionStatus } from '../types'

export const MEAL_TYPES: MealTypeRecord[] = [
  { id: 'a1000000-0000-0000-0000-000000000001', name: 'breakfast', display_name: 'Desayuno', sort_order: 1, icon_name: 'sun' },
  { id: 'a1000000-0000-0000-0000-000000000002', name: 'lunch', display_name: 'Almuerzo', sort_order: 2, icon_name: 'utensils' },
  { id: 'a1000000-0000-0000-0000-000000000003', name: 'snack', display_name: 'Media tarde', sort_order: 3, icon_name: 'sprout' },
  { id: 'a1000000-0000-0000-0000-000000000004', name: 'dinner', display_name: 'Cena', sort_order: 4, icon_name: 'moon' },
]

export const MEAL_TYPE_MAP: Record<string, MealTypeRecord> = Object.fromEntries(
  MEAL_TYPES.map(mt => [mt.name, mt])
)

export const FOOD_CATEGORIES: FoodCategory[] = [
  { id: 'b1000000-0000-0000-0000-000000000001', name: 'protein', display_name: 'Proteínas', icon_name: 'drumstick' },
  { id: 'b1000000-0000-0000-0000-000000000002', name: 'carb', display_name: 'Carbohidratos', icon_name: 'wheat' },
  { id: 'b1000000-0000-0000-0000-000000000003', name: 'fruit', display_name: 'Frutas', icon_name: 'apple' },
  { id: 'b1000000-0000-0000-0000-000000000004', name: 'fat', display_name: 'Grasas', icon_name: 'droplet' },
  { id: 'b1000000-0000-0000-0000-000000000005', name: 'vegetable', display_name: 'Vegetales', icon_name: 'leaf' },
  { id: 'b1000000-0000-0000-0000-000000000006', name: 'salad', display_name: 'Ensaladas', icon_name: 'salad' },
]

export const COLLECTION_STATUSES: { value: CollectionStatus; label: string; color: string }[] = [
  { value: 'to_try', label: 'Por probar', color: 'maize' },
  { value: 'favorite', label: 'Favorito', color: 'coral' },
  { value: 'eaten', label: 'Ya comí', color: 'sage' },
  { value: 'disliked', label: 'No me gustó', color: 'carbon' },
]

export const GENDER_OPTIONS = [
  { value: 'not_specified', label: 'No especificar' },
  { value: 'female', label: 'Mujer' },
  { value: 'male', label: 'Hombre' },
  { value: 'other', label: 'Otro' },
] as const

export const MEAL_CATEGORY_OPTIONS = [
  { value: 'protein', label: 'Proteína' },
  { value: 'carb', label: 'Carbohidrato' },
  { value: 'fruit', label: 'Fruta' },
  { value: 'fat', label: 'Grasa' },
  { value: 'salad', label: 'Ensalada' },
  { value: 'vegetable', label: 'Vegetal' },
  { value: 'dairy', label: 'Lácteo' },
] as const

export const FOOD_PREFERENCE_OPTIONS = [
  { value: 'love', label: 'Me encanta' },
  { value: 'ok', label: 'Está bien' },
  { value: 'dislike', label: 'No me gustó' },
  { value: 'later', label: 'Otro día' },
] as const

export const DEFAULT_WATER_TARGET_ML = 2500
export const DEFAULT_CALORIE_TARGET = 2000

export function getMealTypeLabel(mealType: string | null): string {
  if (!mealType) return 'Comida'
  const found = MEAL_TYPES.find(mt => mt.name === mealType)
  return found?.display_name ?? mealType
}

export function getMealTypeIcon(mealType: string): string {
  const found = MEAL_TYPES.find(mt => mt.name === mealType)
  return found?.icon_name ?? 'utensils'
}
