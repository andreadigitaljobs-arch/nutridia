export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner'

export type MealCategory = 'protein' | 'carb' | 'fruit' | 'fat' | 'salad' | 'vegetable' | 'dairy'
export type PlanStatus = 'active' | 'inactive'
export type FoodRuleStatus = 'allowed' | 'prohibited' | 'allowed_limited'
export type CollectionStatus = 'to_try' | 'favorite' | 'eaten' | 'disliked'
export type Gender = 'male' | 'female' | 'other' | 'not_specified'
export type FoodPreference = 'love' | 'ok' | 'dislike' | 'later'
export type RuleSource = 'nutritionist_plan' | 'user_confirmed' | 'imported_photo' | 'manual'

export interface Profile {
  id: string
  user_id: string
  name: string
  date_of_birth: string | null
  gender: string | null
  height_cm: number | null
  current_weight_kg: number | null
  timezone: string
  has_completed_onboarding: boolean
  created_at: string
  updated_at: string
}

export interface NutritionPlan {
  id: string
  user_id: string
  name: string
  status: PlanStatus
  start_date: string | null
  end_date: string | null
  daily_calorie_target: number | null
  daily_water_target_ml: number | null
  source: string
  notes: string | null
  created_at: string
}

export interface MealTypeRecord {
  id: string
  name: string
  display_name: string
  sort_order: number
  icon_name: string | null
}

export interface MealRule {
  id: string
  plan_id: string
  meal_type_id: string
  category: MealCategory
  required_servings: number
  notes: string | null
  created_at: string
}

export interface FoodCategory {
  id: string
  name: string
  display_name: string
  icon_name: string | null
  created_at?: string
}

export interface Food {
  id: string
  name: string
  category_id: string | null
  default_unit: string
  calories_per_100g: number | null
  protein_per_100g: number | null
  carbs_per_100g: number | null
  fat_per_100g: number | null
  notes: string | null
  created_at: string
}

export interface UserFoodRule {
  id: string
  user_id: string
  food_id: string
  plan_id: string | null
  status: FoodRuleStatus
  hard_block: boolean
  max_amount: number | null
  notes: string | null
  source: RuleSource
  created_at: string
}

export interface FoodPortion {
  id: string
  user_id: string
  food_id: string
  plan_id: string | null
  amount: number
  unit: string
  servings: number
  needs_confirmation: boolean
  created_at: string
}

export interface DailyMenu {
  id: string
  user_id: string
  plan_id: string | null
  date: string
  status: string
  created_at: string
}

export interface DailyMenuOption {
  id: string
  menu_id: string
  meal_type_id: string
  name: string
  description: string | null
  estimated_calories: number | null
  is_selected: boolean
  was_saved_to_collection: boolean
  sort_order: number
  created_at: string
}

export interface MealOptionItem {
  id: string
  option_id: string
  food_id: string | null
  food_name: string
  category: MealCategory
  amount: number
  unit: string
  servings: number
  preparation_notes: string | null
  created_at: string
}

export interface MealLog {
  id: string
  user_id: string
  meal_type_id: string | null
  option_id: string | null
  date: string
  time: string | null
  foods: unknown
  estimated_calories: number | null
  notes: string | null
  photo_url: string | null
  created_at: string
}

export interface CollectionItem {
  id: string
  user_id: string
  option_id: string
  status: CollectionStatus
  created_at: string
}

export interface UserFoodPreference {
  id: string
  user_id: string
  food_id: string
  preference: FoodPreference | null
  created_at: string
}

export interface WeightHistory {
  id: string
  user_id: string
  weight_kg: number
  date: string
  notes: string | null
  created_at: string
}

export interface BodyAssessment {
  id: string
  user_id: string
  date: string
  device: string | null
  weight_kg: number | null
  bmi: number | null
  body_fat_pct: number | null
  fat_mass_kg: number | null
  lean_mass_kg: number | null
  visceral_fat: number | null
  water_pct: number | null
  water_mass_kg: number | null
  muscle_mass_kg: number | null
  bone_mass_kg: number | null
  heart_rate_bpm: number | null
  bmr_kcal: number | null
  metabolic_age: number | null
  smi: number | null
  subcutaneous_fat_pct: number | null
  measures: unknown
  skinfolds: unknown
  notes: string | null
  created_at: string
}

export interface HydrationLog {
  id: string
  user_id: string
  date: string
  amount_ml: number
  created_at: string
}

export interface UserAvailableFood {
  id: string
  user_id: string
  food_id: string
  available: boolean
  created_at: string
}

export interface UploadedPlanDocument {
  id: string
  user_id: string
  file_url: string
  status: string
  detected_data: unknown
  created_at: string
}

export interface FoodPhotoAnalysis {
  id: string
  user_id: string
  photo_url: string
  detected_items: unknown
  status: string
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile }
      nutrition_plans: { Row: NutritionPlan }
      meal_types: { Row: MealTypeRecord }
      meal_rules: { Row: MealRule }
      food_categories: { Row: FoodCategory }
      foods: { Row: Food }
      user_food_rules: { Row: UserFoodRule }
      food_portions: { Row: FoodPortion }
      daily_menus: { Row: DailyMenu }
      daily_menu_options: { Row: DailyMenuOption }
      meal_option_items: { Row: MealOptionItem }
      meal_logs: { Row: MealLog }
      collection_items: { Row: CollectionItem }
      user_food_preferences: { Row: UserFoodPreference }
      weight_history: { Row: WeightHistory }
      body_assessments: { Row: BodyAssessment }
      hydration_logs: { Row: HydrationLog }
      user_available_foods: { Row: UserAvailableFood }
      uploaded_plan_documents: { Row: UploadedPlanDocument }
      food_photo_analyses: { Row: FoodPhotoAnalysis }
    }
  }
}
