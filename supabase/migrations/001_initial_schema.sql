-- Nutridia Database Schema
-- Migration 001: Initial Schema
-- All tables live in the `nutridia` schema (multi-tenant, shared auth.users)

CREATE SCHEMA IF NOT EXISTS nutridia;
SET search_path TO nutridia;

-- Using gen_random_uuid() native to PG13+ (no extension needed)

-- Helper: RLS check that resolves the calling user inside the nutridia schema
CREATE OR REPLACE FUNCTION nutridia.user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = nutridia
AS $$ SELECT auth.uid(); $$;

-- ============================================================
-- TABLES
-- ============================================================

-- FOOD CATEGORIES (read-only catalog)
CREATE TABLE food_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  icon_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- FOODS (global catalog, read-only for authenticated users)
CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES nutridia.food_categories(id) ON DELETE SET NULL,
  default_unit TEXT DEFAULT 'g',
  calories_per_100g NUMERIC,
  protein_per_100g NUMERIC,
  carbs_per_100g NUMERIC,
  fat_per_100g NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_foods_category ON foods(category_id);
CREATE INDEX idx_foods_name ON foods(name);

-- PROFILES
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  height_cm NUMERIC,
  current_weight_kg NUMERIC,
  timezone TEXT DEFAULT 'America/Caracas',
  has_completed_onboarding BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_profiles_user ON profiles(user_id);

-- NUTRITION PLANS
CREATE TABLE nutrition_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Mi plan',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  start_date DATE DEFAULT current_date,
  end_date DATE,
  daily_calorie_target NUMERIC,
  daily_water_target_ml NUMERIC DEFAULT 2000,
  source TEXT DEFAULT 'manual',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_plans_user ON nutrition_plans(user_id);
CREATE INDEX idx_plans_status ON nutrition_plans(user_id, status);

-- MEAL TYPES (read-only catalog)
CREATE TABLE meal_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  sort_order INT NOT NULL,
  icon_name TEXT
);

-- MEAL RULES (owned via nutrition_plans → user_id)
CREATE TABLE meal_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES nutridia.nutrition_plans(id) ON DELETE CASCADE NOT NULL,
  meal_type_id UUID REFERENCES nutridia.meal_types(id) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('protein','carb','fruit','fat','salad','vegetable','dairy')),
  required_servings NUMERIC NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_meal_rules_plan ON meal_rules(plan_id);
CREATE INDEX idx_meal_rules_meal ON meal_rules(meal_type_id);

-- USER FOOD RULES
CREATE TABLE user_food_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES nutridia.foods(id) NOT NULL,
  plan_id UUID REFERENCES nutridia.nutrition_plans(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'allowed' CHECK (status IN ('allowed','prohibited','allowed_limited')),
  hard_block BOOLEAN DEFAULT false,
  max_amount NUMERIC,
  notes TEXT,
  source TEXT DEFAULT 'nutritionist_plan',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_food_rules_user ON user_food_rules(user_id);
CREATE INDEX idx_food_rules_plan ON user_food_rules(plan_id);
CREATE INDEX idx_food_rules_food ON user_food_rules(food_id);

-- FOOD PORTIONS
CREATE TABLE food_portions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES nutridia.foods(id) NOT NULL,
  plan_id UUID REFERENCES nutridia.nutrition_plans(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  unit TEXT DEFAULT 'g',
  servings NUMERIC DEFAULT 1,
  needs_confirmation BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_portions_user ON food_portions(user_id);
CREATE INDEX idx_portions_plan ON food_portions(plan_id);

-- DAILY MENUS
CREATE TABLE daily_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES nutridia.nutrition_plans(id),
  date DATE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);
CREATE INDEX idx_menus_user_date ON daily_menus(user_id, date);

-- DAILY MENU OPTIONS (owned via daily_menus → user_id)
CREATE TABLE daily_menu_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID REFERENCES nutridia.daily_menus(id) ON DELETE CASCADE NOT NULL,
  meal_type_id UUID REFERENCES nutridia.meal_types(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  estimated_calories NUMERIC,
  is_selected BOOLEAN DEFAULT false,
  was_saved_to_collection BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_menu_options_menu ON daily_menu_options(menu_id);
CREATE INDEX idx_menu_options_meal ON daily_menu_options(meal_type_id);

-- MEAL OPTION ITEMS (owned via daily_menu_options → daily_menus → user_id)
CREATE TABLE meal_option_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID REFERENCES nutridia.daily_menu_options(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES nutridia.foods(id),
  food_name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  unit TEXT DEFAULT 'g',
  servings NUMERIC DEFAULT 1,
  preparation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_option_items_option ON meal_option_items(option_id);

-- MEAL LOGS
CREATE TABLE meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_type_id UUID REFERENCES nutridia.meal_types(id),
  option_id UUID REFERENCES nutridia.daily_menu_options(id),
  date DATE NOT NULL,
  time TIME,
  foods JSONB,
  estimated_calories NUMERIC,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_meal_logs_user_date ON meal_logs(user_id, date);

-- COLLECTION ITEMS (owned via daily_menu_options → daily_menus → user_id)
CREATE TABLE collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES nutridia.daily_menu_options(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'to_try' CHECK (status IN ('to_try','favorite','eaten','disliked')),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_collection_user ON collection_items(user_id);
CREATE INDEX idx_collection_status ON collection_items(user_id, status);

-- USER FOOD PREFERENCES
CREATE TABLE user_food_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES nutridia.foods(id) NOT NULL,
  preference TEXT CHECK (preference IN ('love','ok','dislike','later')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, food_id)
);
CREATE INDEX idx_preferences_user ON user_food_preferences(user_id);

-- WEIGHT HISTORY
CREATE TABLE weight_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight_kg NUMERIC NOT NULL,
  date DATE NOT NULL DEFAULT current_date,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_weight_user ON weight_history(user_id);
CREATE INDEX idx_weight_date ON weight_history(user_id, date);

-- BODY ASSESSMENTS
CREATE TABLE body_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT current_date,
  device TEXT,
  weight_kg NUMERIC,
  bmi NUMERIC,
  body_fat_pct NUMERIC,
  fat_mass_kg NUMERIC,
  lean_mass_kg NUMERIC,
  visceral_fat NUMERIC,
  water_pct NUMERIC,
  water_mass_kg NUMERIC,
  muscle_mass_kg NUMERIC,
  bone_mass_kg NUMERIC,
  heart_rate_bpm INT,
  bmr_kcal INT,
  metabolic_age INT,
  smi NUMERIC,
  subcutaneous_fat_pct NUMERIC,
  measures JSONB,
  skinfolds JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_assessments_user ON body_assessments(user_id);
CREATE INDEX idx_assessments_date ON body_assessments(user_id, date);

-- HYDRATION LOGS
CREATE TABLE hydration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT current_date,
  amount_ml INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_hydration_user_date ON hydration_logs(user_id, date);

-- USER AVAILABLE FOODS
CREATE TABLE user_available_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES nutridia.foods(id) NOT NULL,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, food_id)
);
CREATE INDEX idx_available_user ON user_available_foods(user_id);

-- UPLOADED PLAN DOCUMENTS
CREATE TABLE uploaded_plan_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  detected_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- FOOD PHOTO ANALYSES
CREATE TABLE food_photo_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  detected_items JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_food_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_portions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_menu_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_option_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_food_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_available_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_plan_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_photo_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_types ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- CATALOG TABLES: readable by authenticated, NOT writable
-- Only service_role (bypasses RLS) can modify these.
-- ============================================================

CREATE POLICY "Foods readable by authenticated"
  ON nutridia.foods FOR SELECT TO authenticated USING (true);

CREATE POLICY "Food categories readable by authenticated"
  ON nutridia.food_categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Meal types readable by authenticated"
  ON nutridia.meal_types FOR SELECT TO authenticated USING (true);

-- ============================================================
-- PROFILES
-- ============================================================

CREATE POLICY "Users view own profile"
  ON nutridia.profiles FOR SELECT TO authenticated
  USING (nutridia.user_id() = user_id);

CREATE POLICY "Users insert own profile"
  ON nutridia.profiles FOR INSERT TO authenticated
  WITH CHECK (nutridia.user_id() = user_id);

CREATE POLICY "Users update own profile"
  ON nutridia.profiles FOR UPDATE TO authenticated
  USING (nutridia.user_id() = user_id);

-- ============================================================
-- NUTRITION PLANS
-- ============================================================

CREATE POLICY "Users view own plans"
  ON nutridia.nutrition_plans FOR SELECT TO authenticated
  USING (nutridia.user_id() = user_id);

CREATE POLICY "Users insert own plans"
  ON nutridia.nutrition_plans FOR INSERT TO authenticated
  WITH CHECK (nutridia.user_id() = user_id);

CREATE POLICY "Users update own plans"
  ON nutridia.nutrition_plans FOR UPDATE TO authenticated
  USING (nutridia.user_id() = user_id);

-- ============================================================
-- MEAL RULES (owned via nutrition_plans → user_id)
-- ============================================================

CREATE POLICY "Users view own meal rules"
  ON nutridia.meal_rules FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM nutridia.nutrition_plans
    WHERE nutrition_plans.id = meal_rules.plan_id
      AND nutrition_plans.user_id = nutridia.user_id()
  ));

CREATE POLICY "Users insert own meal rules"
  ON nutridia.meal_rules FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM nutridia.nutrition_plans
    WHERE nutrition_plans.id = meal_rules.plan_id
      AND nutrition_plans.user_id = nutridia.user_id()
  ));

CREATE POLICY "Users update own meal rules"
  ON nutridia.meal_rules FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM nutridia.nutrition_plans
    WHERE nutrition_plans.id = meal_rules.plan_id
      AND nutrition_plans.user_id = nutridia.user_id()
  ));

CREATE POLICY "Users delete own meal rules"
  ON nutridia.meal_rules FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM nutridia.nutrition_plans
    WHERE nutrition_plans.id = meal_rules.plan_id
      AND nutrition_plans.user_id = nutridia.user_id()
  ));

-- ============================================================
-- USER FOOD RULES
-- ============================================================

CREATE POLICY "Users view own food rules"
  ON nutridia.user_food_rules FOR SELECT TO authenticated
  USING (nutridia.user_id() = user_id);

CREATE POLICY "Users insert own food rules"
  ON nutridia.user_food_rules FOR INSERT TO authenticated
  WITH CHECK (nutridia.user_id() = user_id);

CREATE POLICY "Users update own food rules"
  ON nutridia.user_food_rules FOR UPDATE TO authenticated
  USING (nutridia.user_id() = user_id);

CREATE POLICY "Users delete own food rules"
  ON nutridia.user_food_rules FOR DELETE TO authenticated
  USING (nutridia.user_id() = user_id);

-- ============================================================
-- FOOD PORTIONS
-- ============================================================

CREATE POLICY "Users view own portions"
  ON nutridia.food_portions FOR SELECT TO authenticated
  USING (nutridia.user_id() = user_id);

CREATE POLICY "Users insert own portions"
  ON nutridia.food_portions FOR INSERT TO authenticated
  WITH CHECK (nutridia.user_id() = user_id);

CREATE POLICY "Users update own portions"
  ON nutridia.food_portions FOR UPDATE TO authenticated
  USING (nutridia.user_id() = user_id);

CREATE POLICY "Users delete own portions"
  ON nutridia.food_portions FOR DELETE TO authenticated
  USING (nutridia.user_id() = user_id);

-- ============================================================
-- DAILY MENUS
-- ============================================================

CREATE POLICY "Users view own menus"
  ON nutridia.daily_menus FOR SELECT TO authenticated
  USING (nutridia.user_id() = user_id);

CREATE POLICY "Users insert own menus"
  ON nutridia.daily_menus FOR INSERT TO authenticated
  WITH CHECK (nutridia.user_id() = user_id);

CREATE POLICY "Users update own menus"
  ON nutridia.daily_menus FOR UPDATE TO authenticated
  USING (nutridia.user_id() = user_id);

-- ============================================================
-- DAILY MENU OPTIONS (owned via daily_menus → user_id)
-- ============================================================

CREATE POLICY "Users view own menu options"
  ON nutridia.daily_menu_options FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM nutridia.daily_menus
    WHERE daily_menus.id = daily_menu_options.menu_id
      AND daily_menus.user_id = nutridia.user_id()
  ));

CREATE POLICY "Users insert own menu options"
  ON nutridia.daily_menu_options FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM nutridia.daily_menus
    WHERE daily_menus.id = daily_menu_options.menu_id
      AND daily_menus.user_id = nutridia.user_id()
  ));

CREATE POLICY "Users update own menu options"
  ON nutridia.daily_menu_options FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM nutridia.daily_menus
    WHERE daily_menus.id = daily_menu_options.menu_id
      AND daily_menus.user_id = nutridia.user_id()
  ));

-- ============================================================
-- MEAL OPTION ITEMS (owned via daily_menu_options → daily_menus → user_id)
-- ============================================================

CREATE POLICY "Users view own option items"
  ON nutridia.meal_option_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM nutridia.daily_menu_options
    JOIN nutridia.daily_menus ON daily_menus.id = daily_menu_options.menu_id
    WHERE daily_menu_options.id = meal_option_items.option_id
      AND daily_menus.user_id = nutridia.user_id()
  ));

CREATE POLICY "Users insert own option items"
  ON nutridia.meal_option_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM nutridia.daily_menu_options
    JOIN nutridia.daily_menus ON daily_menus.id = daily_menu_options.menu_id
    WHERE daily_menu_options.id = meal_option_items.option_id
      AND daily_menus.user_id = nutridia.user_id()
  ));

-- ============================================================
-- MEAL LOGS
-- ============================================================

CREATE POLICY "Users view own meal logs"
  ON nutridia.meal_logs FOR SELECT TO authenticated
  USING (nutridia.user_id() = user_id);

CREATE POLICY "Users insert own meal logs"
  ON nutridia.meal_logs FOR INSERT TO authenticated
  WITH CHECK (nutridia.user_id() = user_id);

CREATE POLICY "Users update own meal logs"
  ON nutridia.meal_logs FOR UPDATE TO authenticated
  USING (nutridia.user_id() = user_id);

CREATE POLICY "Users delete own meal logs"
  ON nutridia.meal_logs FOR DELETE TO authenticated
  USING (nutridia.user_id() = user_id);

-- ============================================================
-- COLLECTION ITEMS (owned via daily_menu_options → daily_menus → user_id)
-- ============================================================

CREATE POLICY "Users view own collection"
  ON nutridia.collection_items FOR SELECT TO authenticated
  USING (nutridia.user_id() = user_id);

CREATE POLICY "Users insert own collection"
  ON nutridia.collection_items FOR INSERT TO authenticated
  WITH CHECK (nutridia.user_id() = user_id);

CREATE POLICY "Users update own collection"
  ON nutridia.collection_items FOR UPDATE TO authenticated
  USING (nutridia.user_id() = user_id);

CREATE POLICY "Users delete own collection"
  ON nutridia.collection_items FOR DELETE TO authenticated
  USING (nutridia.user_id() = user_id);

-- ============================================================
-- USER FOOD PREFERENCES
-- ============================================================

CREATE POLICY "Users view own preferences"
  ON nutridia.user_food_preferences FOR SELECT TO authenticated
  USING (nutridia.user_id() = user_id);

CREATE POLICY "Users insert own preferences"
  ON nutridia.user_food_preferences FOR INSERT TO authenticated
  WITH CHECK (nutridia.user_id() = user_id);

CREATE POLICY "Users update own preferences"
  ON nutridia.user_food_preferences FOR UPDATE TO authenticated
  USING (nutridia.user_id() = user_id);

-- ============================================================
-- WEIGHT HISTORY
-- ============================================================

CREATE POLICY "Users view own weight"
  ON nutridia.weight_history FOR SELECT TO authenticated
  USING (nutridia.user_id() = user_id);

CREATE POLICY "Users insert own weight"
  ON nutridia.weight_history FOR INSERT TO authenticated
  WITH CHECK (nutridia.user_id() = user_id);

CREATE POLICY "Users update own weight"
  ON nutridia.weight_history FOR UPDATE TO authenticated
  USING (nutridia.user_id() = user_id);

CREATE POLICY "Users delete own weight"
  ON nutridia.weight_history FOR DELETE TO authenticated
  USING (nutridia.user_id() = user_id);

-- ============================================================
-- BODY ASSESSMENTS
-- ============================================================

CREATE POLICY "Users view own assessments"
  ON nutridia.body_assessments FOR SELECT TO authenticated
  USING (nutridia.user_id() = user_id);

CREATE POLICY "Users insert own assessments"
  ON nutridia.body_assessments FOR INSERT TO authenticated
  WITH CHECK (nutridia.user_id() = user_id);

CREATE POLICY "Users update own assessments"
  ON nutridia.body_assessments FOR UPDATE TO authenticated
  USING (nutridia.user_id() = user_id);

CREATE POLICY "Users delete own assessments"
  ON nutridia.body_assessments FOR DELETE TO authenticated
  USING (nutridia.user_id() = user_id);

-- ============================================================
-- HYDRATION LOGS
-- ============================================================

CREATE POLICY "Users view own hydration"
  ON nutridia.hydration_logs FOR SELECT TO authenticated
  USING (nutridia.user_id() = user_id);

CREATE POLICY "Users insert own hydration"
  ON nutridia.hydration_logs FOR INSERT TO authenticated
  WITH CHECK (nutridia.user_id() = user_id);

CREATE POLICY "Users delete own hydration"
  ON nutridia.hydration_logs FOR DELETE TO authenticated
  USING (nutridia.user_id() = user_id);

-- ============================================================
-- USER AVAILABLE FOODS
-- ============================================================

CREATE POLICY "Users view own available foods"
  ON nutridia.user_available_foods FOR SELECT TO authenticated
  USING (nutridia.user_id() = user_id);

CREATE POLICY "Users insert own available foods"
  ON nutridia.user_available_foods FOR INSERT TO authenticated
  WITH CHECK (nutridia.user_id() = user_id);

CREATE POLICY "Users update own available foods"
  ON nutridia.user_available_foods FOR UPDATE TO authenticated
  USING (nutridia.user_id() = user_id);

-- ============================================================
-- UPLOADED PLAN DOCUMENTS
-- ============================================================

CREATE POLICY "Users view own uploads"
  ON nutridia.uploaded_plan_documents FOR SELECT TO authenticated
  USING (nutridia.user_id() = user_id);

CREATE POLICY "Users insert own uploads"
  ON nutridia.uploaded_plan_documents FOR INSERT TO authenticated
  WITH CHECK (nutridia.user_id() = user_id);

-- ============================================================
-- FOOD PHOTO ANALYSES
-- ============================================================

CREATE POLICY "Users view own analyses"
  ON nutridia.food_photo_analyses FOR SELECT TO authenticated
  USING (nutridia.user_id() = user_id);

CREATE POLICY "Users insert own analyses"
  ON nutridia.food_photo_analyses FOR INSERT TO authenticated
  WITH CHECK (nutridia.user_id() = user_id);
