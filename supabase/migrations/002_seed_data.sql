-- ============================================================
-- SEED DATA - NUTRI DIA
-- ============================================================
-- USAGE: Set YAJAIRA_AUTH_USER_ID before running this migration.
--
-- Option A: Run BEFORE this script:
--   SET app.yajaira_user_id = '00000000-0000-0000-0000-000000000001';
--
-- Option B: Replace the default placeholder value below with
--   the real auth.users UUID for Yajaira.
-- ============================================================

SET search_path TO nutridia;

DO $$
BEGIN
  IF current_setting('app.yajaira_user_id', true) IS NULL
     OR current_setting('app.yajaira_user_id', true) = '' THEN
    PERFORM set_config('app.yajaira_user_id', '00000000-0000-0000-0000-000000000001', false);
  END IF;
END $$;

-- ============================================================
-- 1. MEAL TYPES
-- ============================================================
INSERT INTO nutridia.meal_types (id, name, display_name, sort_order, icon_name) VALUES
  ('11111111-1111-1111-1111-111111111101', 'breakfast', 'Desayuno', 1, 'sunrise'),
  ('11111111-1111-1111-1111-111111111102', 'lunch',     'Almuerzo',  2, 'sun'),
  ('11111111-1111-1111-1111-111111111103', 'snack',     'Merienda',  3, 'coffee'),
  ('11111111-1111-1111-1111-111111111104', 'dinner',    'Cena',      4, 'moon')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. FOOD CATEGORIES
-- ============================================================
INSERT INTO nutridia.food_categories (id, name, display_name, icon_name) VALUES
  ('22222222-2222-2222-2222-222222222201', 'protein',    'Proteina',    'drumstick'),
  ('22222222-2222-2222-2222-222222222202', 'carb',       'Carbohidrato','wheat'),
  ('22222222-2222-2222-2222-222222222203', 'fruit',      'Fruta',       'apple'),
  ('22222222-2222-2222-2222-222222222204', 'fat',        'Grasa',       'droplet'),
  ('22222222-2222-2222-2222-222222222205', 'vegetable',  'Verdura',     'carrot'),
  ('22222222-2222-2222-2222-222222222206', 'salad',      'Ensalada',    'salad'),
  ('22222222-2222-2222-2222-222222222207', 'dairy',      'Lacteo',      'milk')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. FOODS CATALOG
-- ============================================================

-- PROTEINS (all 30g = 1 serving except huevo = 1 unidad)
INSERT INTO nutridia.foods (id, name, category_id, default_unit, notes) VALUES
  ('33333333-3333-3333-3333-333333333301', 'Res',            '22222222-2222-2222-2222-222222222201', 'g',   NULL),
  ('33333333-3333-3333-3333-333333333302', 'Chuleta de cerdo','22222222-2222-2222-2222-222222222201', 'g',   NULL),
  ('33333333-3333-3333-3333-333333333303', 'Chuleta ahumada','22222222-2222-2222-2222-222222222201', 'g',   NULL),
  ('33333333-3333-3333-3333-333333333304', 'Pato',           '22222222-2222-2222-2222-222222222201', 'g',   NULL),
  ('33333333-3333-3333-3333-333333333305', 'Pavo',           '22222222-2222-2222-2222-222222222201', 'g',   NULL),
  ('33333333-3333-3333-3333-333333333306', 'Pollo',          '22222222-2222-2222-2222-222222222201', 'g',   NULL),
  ('33333333-3333-3333-3333-333333333307', 'Atun',           '22222222-2222-2222-2222-222222222201', 'g',   NULL),
  ('33333333-3333-3333-3333-333333333308', 'Merluza',        '22222222-2222-2222-2222-222222222201', 'g',   NULL),
  ('33333333-3333-3333-3333-333333333309', 'Salmon',         '22222222-2222-2222-2222-222222222201', 'g',   NULL),
  ('33333333-3333-3333-3333-333333333310', 'Camaron',        '22222222-2222-2222-2222-222222222201', 'g',   NULL),
  ('33333333-3333-3333-3333-333333333311', 'Pulpo',          '22222222-2222-2222-2222-222222222201', 'g',   NULL),
  ('33333333-3333-3333-3333-333333333312', 'Jamon',          '22222222-2222-2222-2222-222222222201', 'g',   NULL),
  ('33333333-3333-3333-3333-333333333313', 'Jamon de pollo', '22222222-2222-2222-2222-222222222201', 'g',   NULL),
  ('33333333-3333-3333-3333-333333333314', 'Jamon de pavo',  '22222222-2222-2222-2222-222222222201', 'g',   NULL),
  ('33333333-3333-3333-3333-333333333315', 'Huevo entero',   '22222222-2222-2222-2222-222222222201', 'unidad', '1 unidad = 1 porcion')
ON CONFLICT (id) DO NOTHING;

-- CARBOHIDRATOS
INSERT INTO nutridia.foods (id, name, category_id, default_unit, notes) VALUES
  ('33333333-3333-3333-3333-333333333316', 'Corn flakes sin azucar','22222222-2222-2222-2222-222222222202', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333317', 'Galleta de arroz',      '22222222-2222-2222-2222-222222222202', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333318', 'Pan pita integral',     '22222222-2222-2222-2222-222222222202', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333319', 'Pan integral',          '22222222-2222-2222-2222-222222222202', 'unidad', NULL),
  ('33333333-3333-3333-3333-333333333320', 'Cachapa',               '22222222-2222-2222-2222-222222222202', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333321', 'Cotufa sin grasa',      '22222222-2222-2222-2222-222222222202', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333322', 'Galleta de soda',       '22222222-2222-2222-2222-222222222202', 'unidades', NULL),
  ('33333333-3333-3333-3333-333333333323', 'Mazorca',               '22222222-2222-2222-2222-222222222202', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333324', 'Pan arabe',             '22222222-2222-2222-2222-222222222202', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333325', 'Pan blanco',            '22222222-2222-2222-2222-222222222202', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333326', 'Pan campesino',         '22222222-2222-2222-2222-222222222202', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333327', 'Yuca',                  '22222222-2222-2222-2222-222222222202', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333328', 'Papa',                  '22222222-2222-2222-2222-222222222202', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333329', 'Ocumo',                 '22222222-2222-2222-2222-222222222202', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333330', 'Batata',                '22222222-2222-2222-2222-222222222202', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333331', 'Platano',               '22222222-2222-2222-2222-222222222202', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333332', 'Pasta',                 '22222222-2222-2222-2222-222222222202', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333333', 'Arroz',                 '22222222-2222-2222-2222-222222222202', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333334', 'Avena',                 '22222222-2222-2222-2222-222222222202', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333335', 'Caraota',               '22222222-2222-2222-2222-222222222202', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333336', 'Lenteja',               '22222222-2222-2222-2222-222222222202', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333337', 'Arvejas',               '22222222-2222-2222-2222-222222222202', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333338', 'Garbanzo',              '22222222-2222-2222-2222-222222222202', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333339', 'Casabe',                '22222222-2222-2222-2222-222222222202', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333340', 'Harina de trigo',       '22222222-2222-2222-2222-222222222202', 'g',  NULL)
ON CONFLICT (id) DO NOTHING;

-- FRUTAS
INSERT INTO nutridia.foods (id, name, category_id, default_unit, notes) VALUES
  ('33333333-3333-3333-3333-333333333341', 'Fresa',            '22222222-2222-2222-2222-222222222203', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333342', 'Mora',             '22222222-2222-2222-2222-222222222203', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333343', 'Mandarina',        '22222222-2222-2222-2222-222222222203', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333344', 'Pera',             '22222222-2222-2222-2222-222222222203', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333345', 'Melocoton',        '22222222-2222-2222-2222-222222222203', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333346', 'Manzana',          '22222222-2222-2222-2222-222222222203', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333347', 'Naranja',          '22222222-2222-2222-2222-222222222203', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333348', 'Durazno',          '22222222-2222-2222-2222-222222222203', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333349', 'Parchita',         '22222222-2222-2222-2222-222222222203', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333350', 'Guanabana',        '22222222-2222-2222-2222-222222222203', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333351', 'Pina',             '22222222-2222-2222-2222-222222222203', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333352', 'Cambur manzano',   '22222222-2222-2222-2222-222222222203', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333353', 'Cambur guineo',    '22222222-2222-2222-2222-222222222203', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333354', 'Melon',            '22222222-2222-2222-2222-222222222203', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333355', 'Patilla',          '22222222-2222-2222-2222-222222222203', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333356', 'Lechosa',          '22222222-2222-2222-2222-222222222203', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333357', 'Uvas',             '22222222-2222-2222-2222-222222222203', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333358', 'Mango',            '22222222-2222-2222-2222-222222222203', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333359', 'Guayaba',          '22222222-2222-2222-2222-222222222203', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333360', 'Agua de coco',     '22222222-2222-2222-2222-222222222203', 'ml', NULL)
ON CONFLICT (id) DO NOTHING;

-- VERDURAS
INSERT INTO nutridia.foods (id, name, category_id, default_unit, notes) VALUES
  ('33333333-3333-3333-3333-333333333361', 'Berenjena',    '22222222-2222-2222-2222-222222222205', 'g', NULL),
  ('33333333-3333-3333-3333-333333333362', 'Zanahoria',    '22222222-2222-2222-2222-222222222205', 'g', NULL),
  ('33333333-3333-3333-3333-333333333363', 'Brocoli',      '22222222-2222-2222-2222-222222222205', 'g', NULL),
  ('33333333-3333-3333-3333-333333333364', 'Calabacin',    '22222222-2222-2222-2222-222222222205', 'g', NULL),
  ('33333333-3333-3333-3333-333333333365', 'Champinon',    '22222222-2222-2222-2222-222222222205', 'g', NULL),
  ('33333333-3333-3333-3333-333333333366', 'Esparragos',   '22222222-2222-2222-2222-222222222205', 'g', NULL),
  ('33333333-3333-3333-3333-333333333367', 'Remolacha',    '22222222-2222-2222-2222-222222222205', 'g', NULL),
  ('33333333-3333-3333-3333-333333333368', 'Repollo',      '22222222-2222-2222-2222-222222222205', 'g', NULL),
  ('33333333-3333-3333-3333-333333333369', 'Coliflor',     '22222222-2222-2222-2222-222222222205', 'g', NULL),
  ('33333333-3333-3333-3333-333333333370', 'Lechuga',      '22222222-2222-2222-2222-222222222205', 'g', NULL),
  ('33333333-3333-3333-3333-333333333371', 'Tomate',       '22222222-2222-2222-2222-222222222205', 'g', NULL),
  ('33333333-3333-3333-3333-333333333372', 'Cebolla',      '22222222-2222-2222-2222-222222222205', 'g', NULL)
ON CONFLICT (id) DO NOTHING;

-- GRASAS
INSERT INTO nutridia.foods (id, name, category_id, default_unit, notes) VALUES
  ('33333333-3333-3333-3333-333333333373', 'Aguacate',      '22222222-2222-2222-2222-222222222204', 'g',      'Cantidad por confirmar'),
  ('33333333-3333-3333-3333-333333333374', 'Aceite de oliva','22222222-2222-2222-2222-222222222204', 'ml',     'Cantidad limite permitida')
ON CONFLICT (id) DO NOTHING;

-- LACTEOS
INSERT INTO nutridia.foods (id, name, category_id, default_unit, notes) VALUES
  ('33333333-3333-3333-3333-333333333375', 'Leche',      '22222222-2222-2222-2222-222222222207', 'ml', NULL),
  ('33333333-3333-3333-3333-333333333376', 'Queso',      '22222222-2222-2222-2222-222222222207', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333377', 'Yogur',      '22222222-2222-2222-2222-222222222207', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333378', 'Ricota',     '22222222-2222-2222-2222-222222222207', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333379', 'Requeson',   '22222222-2222-2222-2222-222222222207', 'g',  NULL),
  ('33333333-3333-3333-3333-333333333380', 'Mantequilla','22222222-2222-2222-2222-222222222207', 'g',  NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. YAJAIRA'S PROFILE
-- ============================================================
INSERT INTO nutridia.profiles (id, user_id, name, date_of_birth, gender, height_cm, current_weight_kg, timezone, has_completed_onboarding) VALUES
  ('44444444-4444-4444-4444-000000000001',
   current_setting('app.yajaira_user_id')::uuid,
   'Yajaira Barreto',
   '1990-01-01',
   'F',
   161,
   68.5,
   'America/Caracas',
   true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. YAJAIRA'S NUTRITION PLAN
-- ============================================================
INSERT INTO nutridia.nutrition_plans (id, user_id, name, status, start_date, daily_calorie_target, daily_water_target_ml, source) VALUES
  ('55555555-5555-5555-5555-000000000001',
   current_setting('app.yajaira_user_id')::uuid,
   'Plan Yajaira',
   'active',
   '2026-08-10',
   1327,
   4000,
   'manual')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 6. YAJAIRA'S MEAL RULES
-- ============================================================
-- Each row = one meal_type + one category with required servings.
-- Desayuno: 3 protein, 1 fruit, 1 carb
INSERT INTO nutridia.meal_rules (id, plan_id, meal_type_id, category, required_servings, notes) VALUES
  ('66666666-6666-6666-6666-000000000001', '55555555-5555-5555-5555-000000000001', '11111111-1111-1111-1111-111111111101', 'protein', 3, NULL),
  ('66666666-6666-6666-6666-000000000002', '55555555-5555-5555-5555-000000000001', '11111111-1111-1111-1111-111111111101', 'fruit',   1, NULL),
  ('66666666-6666-6666-6666-000000000003', '55555555-5555-5555-5555-000000000001', '11111111-1111-1111-1111-111111111101', 'carb',    1, NULL)
ON CONFLICT (id) DO NOTHING;

-- Almuerzo: 4 protein, 1 carb, 1 fat (aguacate)
INSERT INTO nutridia.meal_rules (id, plan_id, meal_type_id, category, required_servings, notes) VALUES
  ('66666666-6666-6666-6666-000000000004', '55555555-5555-5555-5555-000000000001', '11111111-1111-1111-1111-111111111102', 'protein', 4, NULL),
  ('66666666-6666-6666-6666-000000000005', '55555555-5555-5555-5555-000000000001', '11111111-1111-1111-1111-111111111102', 'carb',    1, NULL),
  ('66666666-6666-6666-6666-000000000006', '55555555-5555-5555-5555-000000000001', '11111111-1111-1111-1111-111111111102', 'fat',     1, NULL)
ON CONFLICT (id) DO NOTHING;

-- Merienda: 2 protein
INSERT INTO nutridia.meal_rules (id, plan_id, meal_type_id, category, required_servings, notes) VALUES
  ('66666666-6666-6666-6666-000000000007', '55555555-5555-5555-5555-000000000001', '11111111-1111-1111-1111-111111111103', 'protein', 2, NULL)
ON CONFLICT (id) DO NOTHING;

-- Cena: 4 protein, 1 salad
INSERT INTO nutridia.meal_rules (id, plan_id, meal_type_id, category, required_servings, notes) VALUES
  ('66666666-6666-6666-6666-000000000008', '55555555-5555-5555-5555-000000000001', '11111111-1111-1111-1111-111111111104', 'protein', 4, NULL),
  ('66666666-6666-6666-6666-000000000009', '55555555-5555-5555-5555-000000000001', '11111111-1111-1111-1111-111111111104', 'salad',   1, NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 7. YAJAIRA'S FOOD RULES
-- ============================================================

-- All proteins ALLOWED for all meal rules
INSERT INTO nutridia.user_food_rules (id, user_id, food_id, plan_id, status, hard_block, notes)
SELECT
  gen_random_uuid(),
  current_setting('app.yajaira_user_id')::uuid,
  f.id,
  '55555555-5555-5555-5555-000000000001',
  'allowed',
  false,
  NULL
FROM nutridia.foods f
WHERE f.category_id = '22222222-2222-2222-2222-222222222201'
ON CONFLICT DO NOTHING;

-- Huevo special rule: 1 unit = 1 serving (override the generic protein rule)
INSERT INTO nutridia.user_food_rules (id, user_id, food_id, plan_id, status, hard_block, max_amount, notes)
VALUES (
  gen_random_uuid(),
  current_setting('app.yajaira_user_id')::uuid,
  '33333333-3333-3333-3333-333333333315',
  '55555555-5555-5555-5555-000000000001',
  'allowed',
  false,
  1,
  '1 unidad = 1 porcion'
)
ON CONFLICT DO NOTHING;

-- All dairy PROHIBITED with hard_block
INSERT INTO nutridia.user_food_rules (id, user_id, food_id, plan_id, status, hard_block, max_amount, notes)
SELECT
  gen_random_uuid(),
  current_setting('app.yajaira_user_id')::uuid,
  f.id,
  '55555555-5555-5555-5555-000000000001',
  'prohibited',
  true,
  0,
  'Lacteo prohibido para Yajaira'
FROM nutridia.foods f
WHERE f.category_id = '22222222-2222-2222-2222-222222222207'
ON CONFLICT DO NOTHING;

-- Aceite de oliva: allowed_limited
INSERT INTO nutridia.user_food_rules (id, user_id, food_id, plan_id, status, hard_block, notes)
SELECT
  gen_random_uuid(),
  current_setting('app.yajaira_user_id')::uuid,
  f.id,
  '55555555-5555-5555-5555-000000000001',
  'allowed_limited',
  false,
  'Cantidad limite permitida'
FROM nutridia.foods f
WHERE f.name = 'Aceite de oliva'
ON CONFLICT DO NOTHING;

-- Aguacate: allowed, needs_confirmation
INSERT INTO nutridia.user_food_rules (id, user_id, food_id, plan_id, status, hard_block, notes)
SELECT
  gen_random_uuid(),
  current_setting('app.yajaira_user_id')::uuid,
  f.id,
  '55555555-5555-5555-5555-000000000001',
  'allowed',
  false,
  'Cantidad por confirmar'
FROM nutridia.foods f
WHERE f.name = 'Aguacate'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. YAJAIRA'S FOOD PORTIONS
-- ============================================================

-- Proteins: 30g each (except huevo = 1 unit)
INSERT INTO nutridia.food_portions (id, user_id, food_id, plan_id, amount, unit, servings, needs_confirmation)
SELECT
  gen_random_uuid(),
  current_setting('app.yajaira_user_id')::uuid,
  f.id,
  '55555555-5555-5555-5555-000000000001',
  CASE WHEN f.name = 'Huevo entero' THEN 1 ELSE 30 END,
  CASE WHEN f.name = 'Huevo entero' THEN 'unidad' ELSE 'g' END,
  1,
  false
FROM nutridia.foods f
WHERE f.category_id = '22222222-2222-2222-2222-222222222201'
ON CONFLICT DO NOTHING;

-- Carbs: exact grams from spec
INSERT INTO nutridia.food_portions (id, user_id, food_id, plan_id, amount, unit, servings, needs_confirmation)
SELECT
  gen_random_uuid(),
  current_setting('app.yajaira_user_id')::uuid,
  f.id,
  '55555555-5555-5555-5555-000000000001',
  CASE f.name
    WHEN 'Corn flakes sin azucar' THEN 20
    WHEN 'Galleta de arroz'       THEN 19
    WHEN 'Pan pita integral'      THEN 25
    WHEN 'Pan integral'           THEN 1
    WHEN 'Cachapa'                THEN 50
    WHEN 'Cotufa sin grasa'       THEN 13
    WHEN 'Galleta de soda'        THEN 3
    WHEN 'Mazorca'                THEN 80
    WHEN 'Pan arabe'              THEN 25
    WHEN 'Pan blanco'             THEN 25
    WHEN 'Pan campesino'          THEN 25
    WHEN 'Yuca'                   THEN 45
    WHEN 'Papa'                   THEN 80
    WHEN 'Ocumo'                  THEN 50
    WHEN 'Batata'                 THEN 80
    WHEN 'Platano'                THEN 65
    WHEN 'Pasta'                  THEN 50
    WHEN 'Arroz'                  THEN 60
    WHEN 'Avena'                  THEN 20
    WHEN 'Caraota'                THEN 55
    WHEN 'Lenteja'                THEN 60
    WHEN 'Arvejas'                THEN 90
    WHEN 'Garbanzo'               THEN 45
    WHEN 'Casabe'                 THEN 30
    WHEN 'Harina de trigo'        THEN 20
  END,
  f.default_unit,
  1,
  false
FROM nutridia.foods f
WHERE f.category_id = '22222222-2222-2222-2222-222222222202'
ON CONFLICT DO NOTHING;

-- Fruits: exact grams from spec
INSERT INTO nutridia.food_portions (id, user_id, food_id, plan_id, amount, unit, servings, needs_confirmation)
SELECT
  gen_random_uuid(),
  current_setting('app.yajaira_user_id')::uuid,
  f.id,
  '55555555-5555-5555-5555-000000000001',
  CASE f.name
    WHEN 'Fresa'           THEN 230
    WHEN 'Mora'            THEN 170
    WHEN 'Mandarina'       THEN 140
    WHEN 'Pera'            THEN 130
    WHEN 'Melocoton'       THEN 180
    WHEN 'Manzana'         THEN 240
    WHEN 'Naranja'         THEN 150
    WHEN 'Durazno'         THEN 180
    WHEN 'Parchita'        THEN 75
    WHEN 'Guanabana'       THEN 110
    WHEN 'Pina'            THEN 150
    WHEN 'Cambur manzano'  THEN 80
    WHEN 'Cambur guineo'   THEN 80
    WHEN 'Melon'           THEN 220
    WHEN 'Patilla'         THEN 250
    WHEN 'Lechosa'         THEN 170
    WHEN 'Uvas'            THEN 105
    WHEN 'Mango'           THEN 125
    WHEN 'Guayaba'         THEN 110
    WHEN 'Agua de coco'    THEN 390
  END,
  f.default_unit,
  1,
  false
FROM nutridia.foods f
WHERE f.category_id = '22222222-2222-2222-2222-222222222203'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 9. YAJAIRA'S BODY ASSESSMENT (10/08/2026)
-- ============================================================
INSERT INTO nutridia.body_assessments (
  id, user_id, date, device,
  weight_kg, bmi, body_fat_pct, fat_mass_kg, lean_mass_kg,
  visceral_fat, water_pct, water_mass_kg,
  muscle_mass_kg, bone_mass_kg, heart_rate_bpm,
  bmr_kcal, metabolic_age, smi, subcutaneous_fat_pct
) VALUES (
  '99999999-9999-9999-9999-000000000001',
  current_setting('app.yajaira_user_id')::uuid,
  '2026-08-10',
  'BC-1500 plus',
  68.5,
  26.3,
  32.5,
  22.3,
  46.2,
  7,
  52.8,
  36.2,
  30.5,
  2.3,
  NULL,
  1420,
  42,
  NULL,
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 10. YAJAIRA'S WEIGHT ENTRY
-- ============================================================
INSERT INTO nutridia.weight_history (id, user_id, weight_kg, date, notes) VALUES
  ('AAAAAAAA-AAAA-AAAA-AAAA-000000000001',
   current_setting('app.yajaira_user_id')::uuid,
   68.5,
   '2026-08-10',
   NULL)
ON CONFLICT (id) DO NOTHING;
