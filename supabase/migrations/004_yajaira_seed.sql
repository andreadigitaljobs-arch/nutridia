-- Link Yajaira's data to her real auth UUID
-- Real UUID: 3eabf498-b131-4943-971a-c020ba5df374

SET search_path TO nutridia;

-- Profile
INSERT INTO nutridia.profiles (user_id, name, date_of_birth, gender, height_cm, current_weight_kg, timezone, has_completed_onboarding)
VALUES ('3eabf498-b131-4943-971a-c020ba5df374', 'Yajaira Barreto', '1975-01-01', 'female', 161, 68.5, 'America/Caracas', true)
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  date_of_birth = EXCLUDED.date_of_birth,
  gender = EXCLUDED.gender,
  height_cm = EXCLUDED.height_cm,
  current_weight_kg = EXCLUDED.current_weight_kg,
  has_completed_onboarding = true;

-- Nutrition Plan
INSERT INTO nutridia.nutrition_plans (id, user_id, name, status, daily_calorie_target, daily_water_target_ml, source)
VALUES ('55555555-5555-5555-5555-000000000001', '3eabf498-b131-4943-971a-c020ba5df374', 'Plan Yajaira', 'active', 1327, 4000, 'nutritionist_plan')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  daily_calorie_target = EXCLUDED.daily_calorie_target,
  daily_water_target_ml = EXCLUDED.daily_water_target_ml;

-- Meal Rules: Breakfast (3 protein, 1 fruit, 1 carb)
INSERT INTO nutridia.meal_rules (plan_id, meal_type_id, category, required_servings)
SELECT '55555555-5555-5555-5555-000000000001', mt.id, 'protein', 3
FROM nutridia.meal_types mt WHERE mt.name = 'breakfast'
ON CONFLICT DO NOTHING;
INSERT INTO nutridia.meal_rules (plan_id, meal_type_id, category, required_servings)
SELECT '55555555-5555-5555-5555-000000000001', mt.id, 'fruit', 1
FROM nutridia.meal_types mt WHERE mt.name = 'breakfast'
ON CONFLICT DO NOTHING;
INSERT INTO nutridia.meal_rules (plan_id, meal_type_id, category, required_servings)
SELECT '55555555-5555-5555-5555-000000000001', mt.id, 'carb', 1
FROM nutridia.meal_types mt WHERE mt.name = 'breakfast'
ON CONFLICT DO NOTHING;

-- Meal Rules: Lunch (4 protein, 1 carb, 1 fat/aguacate)
INSERT INTO nutridia.meal_rules (plan_id, meal_type_id, category, required_servings)
SELECT '55555555-5555-5555-5555-000000000001', mt.id, 'protein', 4
FROM nutridia.meal_types mt WHERE mt.name = 'lunch'
ON CONFLICT DO NOTHING;
INSERT INTO nutridia.meal_rules (plan_id, meal_type_id, category, required_servings)
SELECT '55555555-5555-5555-5555-000000000001', mt.id, 'carb', 1
FROM nutridia.meal_types mt WHERE mt.name = 'lunch'
ON CONFLICT DO NOTHING;
INSERT INTO nutridia.meal_rules (plan_id, meal_type_id, category, required_servings)
SELECT '55555555-5555-5555-5555-000000000001', mt.id, 'fat', 1
FROM nutridia.meal_types mt WHERE mt.name = 'lunch'
ON CONFLICT DO NOTHING;

-- Meal Rules: Snack (2 protein)
INSERT INTO nutridia.meal_rules (plan_id, meal_type_id, category, required_servings)
SELECT '55555555-5555-5555-5555-000000000001', mt.id, 'protein', 2
FROM nutridia.meal_types mt WHERE mt.name = 'snack'
ON CONFLICT DO NOTHING;

-- Meal Rules: Dinner (4 protein, 1 salad)
INSERT INTO nutridia.meal_rules (plan_id, meal_type_id, category, required_servings)
SELECT '55555555-5555-5555-5555-000000000001', mt.id, 'protein', 4
FROM nutridia.meal_types mt WHERE mt.name = 'dinner'
ON CONFLICT DO NOTHING;
INSERT INTO nutridia.meal_rules (plan_id, meal_type_id, category, required_servings)
SELECT '55555555-5555-5555-5555-000000000001', mt.id, 'salad', 1
FROM nutridia.meal_types mt WHERE mt.name = 'dinner'
ON CONFLICT DO NOTHING;

-- User Food Rules: All proteins ALLOWED
INSERT INTO nutridia.user_food_rules (user_id, food_id, plan_id, status, hard_block, source)
SELECT '3eabf498-b131-4943-971a-c020ba5df374', f.id, '55555555-5555-5555-5555-000000000001', 'allowed', false, 'nutritionist_plan'
FROM nutridia.foods f
JOIN nutridia.food_categories fc ON fc.id = f.category_id
WHERE fc.name = 'protein'
ON CONFLICT DO NOTHING;

-- User Food Rules: Huevo 1 unit = 1 serving (special rule)
UPDATE nutridia.user_food_rules
SET notes = '1 unidad = 1 racion'
WHERE user_id = '3eabf498-b131-4943-971a-c020ba5df374'
  AND food_id = (SELECT id FROM nutridia.foods WHERE name = 'Huevo entero');

-- User Food Rules: ALL DAIRY PROHIBITED (hard block)
INSERT INTO nutridia.user_food_rules (user_id, food_id, plan_id, status, hard_block, notes, source)
SELECT '3eabf498-b131-4943-971a-c020ba5df374', f.id, '55555555-5555-5555-5555-000000000001', 'prohibited', true, 'Sin lacteos - hard block', 'nutritionist_plan'
FROM nutridia.foods f
JOIN nutridia.food_categories fc ON fc.id = f.category_id
WHERE fc.name = 'dairy'
ON CONFLICT DO NOTHING;

-- User Food Rules: Aceite de oliva LIMITED
INSERT INTO nutridia.user_food_rules (user_id, food_id, plan_id, status, hard_block, notes, source)
SELECT '3eabf498-b131-4943-971a-c020ba5df374', f.id, '55555555-5555-5555-5555-000000000001', 'allowed_limited', false, 'Cantidad maxima por confirmar', 'nutritionist_plan'
FROM nutridia.foods f WHERE f.name = 'Aceite de oliva'
ON CONFLICT DO NOTHING;

-- User Food Rules: Aguacate ALLOWED (amount needs confirmation)
INSERT INTO nutridia.user_food_rules (user_id, food_id, plan_id, status, hard_block, notes, source)
SELECT '3eabf498-b131-4943-971a-c020ba5df374', f.id, '55555555-5555-5555-5555-000000000001', 'allowed', false, 'Peso por confirmar', 'nutritionist_plan'
FROM nutridia.foods f WHERE f.name = 'Aguacate'
ON CONFLICT DO NOTHING;

-- Food Portions: Proteins (30g = 1 serving)
INSERT INTO nutridia.food_portions (user_id, food_id, plan_id, amount, unit, servings)
SELECT '3eabf498-b131-4943-971a-c020ba5df374', f.id, '55555555-5555-5555-5555-000000000001', 30, 'g', 1
FROM nutridia.foods f
JOIN nutridia.food_categories fc ON fc.id = f.category_id
WHERE fc.name = 'protein' AND f.name != 'Huevo entero'
ON CONFLICT DO NOTHING;

-- Huevo: 1 unit = 1 serving
INSERT INTO nutridia.food_portions (user_id, food_id, plan_id, amount, unit, servings)
SELECT '3eabf498-b131-4943-971a-c020ba5df374', f.id, '55555555-5555-5555-5555-000000000001', 1, 'unit', 1
FROM nutridia.foods f WHERE f.name = 'Huevo entero'
ON CONFLICT DO NOTHING;

-- Food Portions: Carbs (exact grams from spec)
INSERT INTO nutridia.food_portions (user_id, food_id, plan_id, amount, unit, servings)
SELECT '3eabf498-b131-4943-971a-c020ba5df374', f.id, '55555555-5555-5555-5555-000000000001',
  CASE f.name
    WHEN 'Corn flakes sin azucar' THEN 20
    WHEN 'Galleta de arroz' THEN 19
    WHEN 'Pan pita integral' THEN 25
    WHEN 'Cachapa' THEN 50
    WHEN 'Cotufa sin grasa' THEN 13
    WHEN 'Mazorca' THEN 80
    WHEN 'Pan arabe' THEN 25
    WHEN 'Pan blanco' THEN 25
    WHEN 'Pan campesino' THEN 25
    WHEN 'Yuca' THEN 45
    WHEN 'Papa' THEN 80
    WHEN 'Ocumo' THEN 50
    WHEN 'Batata' THEN 80
    WHEN 'Platano' THEN 65
    WHEN 'Pasta' THEN 50
    WHEN 'Arroz' THEN 60
    WHEN 'Avena' THEN 20
    WHEN 'Caraota' THEN 55
    WHEN 'Lenteja' THEN 60
    WHEN 'Arvejas' THEN 90
    WHEN 'Garbanzo' THEN 45
    WHEN 'Casabe' THEN 30
    WHEN 'Harina de trigo' THEN 20
    ELSE 100
  END, 'g', 1
FROM nutridia.foods f
JOIN nutridia.food_categories fc ON fc.id = f.category_id
WHERE fc.name = 'carb'
ON CONFLICT DO NOTHING;

-- Pan integral: 1 unit = 1 serving
INSERT INTO nutridia.food_portions (user_id, food_id, plan_id, amount, unit, servings)
SELECT '3eabf498-b131-4943-971a-c020ba5df374', f.id, '55555555-5555-5555-5555-000000000001', 1, 'unit', 1
FROM nutridia.foods f WHERE f.name = 'Pan integral'
ON CONFLICT DO NOTHING;

-- Galleta de soda: 3 units = 1 serving
INSERT INTO nutridia.food_portions (user_id, food_id, plan_id, amount, unit, servings)
SELECT '3eabf498-b131-4943-971a-c020ba5df374', f.id, '55555555-5555-5555-5555-000000000001', 3, 'unit', 1
FROM nutridia.foods f WHERE f.name = 'Galleta de soda'
ON CONFLICT DO NOTHING;

-- Food Portions: Fruits (exact grams from spec)
INSERT INTO nutridia.food_portions (user_id, food_id, plan_id, amount, unit, servings)
SELECT '3eabf498-b131-4943-971a-c020ba5df374', f.id, '55555555-5555-5555-5555-000000000001',
  CASE f.name
    WHEN 'Fresa' THEN 230
    WHEN 'Mora' THEN 170
    WHEN 'Mandarina' THEN 140
    WHEN 'Pera' THEN 130
    WHEN 'Melocoton' THEN 180
    WHEN 'Manzana' THEN 240
    WHEN 'Naranja' THEN 150
    WHEN 'Durazno' THEN 180
    WHEN 'Parchita' THEN 75
    WHEN 'Guanabana' THEN 110
    WHEN 'Pina' THEN 150
    WHEN 'Cambur manzano' THEN 80
    WHEN 'Cambur guineo' THEN 80
    WHEN 'Melon' THEN 220
    WHEN 'Patilla' THEN 250
    WHEN 'Lechosa' THEN 170
    WHEN 'Uvas' THEN 105
    WHEN 'Mango' THEN 125
    WHEN 'Guayaba' THEN 110
    WHEN 'Agua de coco' THEN 390
    ELSE 150
  END, 'g', 1
FROM nutridia.foods f
JOIN nutridia.food_categories fc ON fc.id = f.category_id
WHERE fc.name = 'fruit'
ON CONFLICT DO NOTHING;

-- Food Portions: Vegetables
INSERT INTO nutridia.food_portions (user_id, food_id, plan_id, amount, unit, servings, needs_confirmation)
SELECT '3eabf498-b131-4943-971a-c020ba5df374', f.id, '55555555-5555-5555-5555-000000000001',
  CASE f.name
    WHEN 'Berenjena' THEN 200
    WHEN 'Zanahoria' THEN 200
    WHEN 'Brocoli' THEN 200
    WHEN 'Calabacin' THEN 500
    WHEN 'Champinon' THEN 260
    WHEN 'Esparragos' THEN 340
    WHEN 'Remolacha' THEN 160
    WHEN 'Repollo' THEN 320
    WHEN 'Coliflor' THEN 300
    ELSE NULL
  END, 'g', 1,
  CASE WHEN f.name IN ('Lechuga','Tomate','Cebolla') THEN true ELSE false END
FROM nutridia.foods f
JOIN nutridia.food_categories fc ON fc.id = f.category_id
WHERE fc.name = 'vegetable'
ON CONFLICT DO NOTHING;

-- Food Portions: Aguacate (NULL amount, needs confirmation)
INSERT INTO nutridia.food_portions (user_id, food_id, plan_id, amount, unit, servings, needs_confirmation)
SELECT '3eabf498-b131-4943-971a-c020ba5df374', f.id, '55555555-5555-5555-5555-000000000001', NULL, 'g', 1, true
FROM nutridia.foods f WHERE f.name = 'Aguacate'
ON CONFLICT DO NOTHING;

-- Body Assessment: 10/08/2026
INSERT INTO nutridia.body_assessments (
  user_id, date, device, weight_kg, bmi, body_fat_pct, fat_mass_kg, lean_mass_kg,
  visceral_fat, water_pct, water_mass_kg, muscle_mass_kg, bone_mass_kg,
  heart_rate_bpm, bmr_kcal, metabolic_age, smi, subcutaneous_fat_pct,
  measures, skinfolds
)
VALUES (
  '3eabf498-b131-4943-971a-c020ba5df374',
  '2026-08-10',
  'BC-1500 plus',
  68.5, 26.4, 39, 26.7, 41.8,
  8, 45.8, 31.4, 39.7, 2.1,
  75, 1281, 61, 6.71, 18.9,
  '{"abdomen_cm": 78, "brazo_cm": 33, "brazo_flexionado_cm": 32, "cuello_cm": 35}',
  '{"triceps": 29, "subescapular": 39, "suprailiaco": 38, "axilar": 30, "abdomen": 34, "pectoral": 26, "muslo": 45, "porcentaje_reportado": 40.2}'
)
ON CONFLICT DO NOTHING;

-- Weight History
INSERT INTO nutridia.weight_history (user_id, weight_kg, date)
VALUES ('3eabf498-b131-4943-971a-c020ba5df374', 68.5, '2026-08-10')
ON CONFLICT DO NOTHING;

SELECT 'All Yajaira data linked to UUID 3eabf498-b131-4943-971a-c020ba5df374' AS status;
