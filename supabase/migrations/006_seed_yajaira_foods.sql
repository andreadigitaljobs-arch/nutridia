-- Migration 006: Seed Yajaira's complete food plan
-- All foods from the nutrition plan with correct portions per 100g

-- PROTEINAS (1 racion = 30g)

-- Carnes rojas
INSERT INTO nutridia.foods (name, category_id, default_unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g) VALUES
('Res', (SELECT id FROM nutridia.food_categories WHERE name='protein'), 'g', 250, 26, 0, 15),
('Chuleta de cerdo', (SELECT id FROM nutridia.food_categories WHERE name='protein'), 'g', 242, 27, 0, 14),
('Chuleta ahumada', (SELECT id FROM nutridia.food_categories WHERE name='protein'), 'g', 230, 25, 0, 13);

-- Aves
INSERT INTO nutridia.foods (name, category_id, default_unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g) VALUES
('Pavo', (SELECT id FROM nutridia.food_categories WHERE name='protein'), 'g', 135, 30, 0, 1),
('Pollo', (SELECT id FROM nutridia.food_categories WHERE name='protein'), 'g', 165, 31, 0, 3.6);

-- Pescados y mariscos
INSERT INTO nutridia.foods (name, category_id, default_unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g) VALUES
('Atun', (SELECT id FROM nutridia.food_categories WHERE name='protein'), 'g', 130, 29, 0, 1),
('Merluza', (SELECT id FROM nutridia.food_categories WHERE name='protein'), 'g', 86, 18, 0, 1),
('Salmon', (SELECT id FROM nutridia.food_categories WHERE name='protein'), 'g', 208, 20, 0, 13),
('Camarón', (SELECT id FROM nutridia.food_categories WHERE name='protein'), 'g', 99, 24, 0, 0.3),
('Pulpo', (SELECT id FROM nutridia.food_categories WHERE name='protein'), 'g', 82, 15, 0, 1);

-- Huevos
INSERT INTO nutridia.foods (name, category_id, default_unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g) VALUES
('Huevo entero', (SELECT id FROM nutridia.food_categories WHERE name='protein'), 'und', 155, 13, 1.1, 11);

-- Jamones y embutidos
INSERT INTO nutridia.foods (name, category_id, default_unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g) VALUES
('Jamon de pollo', (SELECT id FROM nutridia.food_categories WHERE name='protein'), 'g', 100, 20, 1, 1),
('Jamon de pavo', (SELECT id FROM nutridia.food_categories WHERE name='protein'), 'g', 95, 19, 1, 1);

-- Quesos (1 porcion = 30g)
INSERT INTO nutridia.foods (name, category_id, default_unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g) VALUES
('Palmita', (SELECT id FROM nutridia.food_categories WHERE name='protein'), 'g', 300, 12, 2, 27),
('Requeson', (SELECT id FROM nutridia.food_categories WHERE name='protein'), 'g', 140, 11, 3, 9),
('Ricota', (SELECT id FROM nutridia.food_categories WHERE name='protein'), 'g', 174, 11, 3, 13),
('Bufula', (SELECT id FROM nutridia.food_categories WHERE name='protein'), 'g', 180, 12, 3, 13),
('Queso cabra', (SELECT id FROM nutridia.food_categories WHERE name='protein'), 'g', 364, 22, 0, 29);

-- ============================================================
-- CARBOHIDRATOS
-- ============================================================
INSERT INTO nutridia.foods (name, category_id, default_unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g) VALUES
('Corn flakes sin azucar', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 357, 7, 84, 0.4),
('Galleta de arroz', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 378, 8, 80, 3),
('Pan pita integral', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 246, 10, 44, 4),
('Pan integral', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 247, 13, 41, 4),
('Cachapas', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 186, 4, 39, 1),
('Cotufa sin grasa', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 387, 11, 74, 1),
('Galleta de soda', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 375, 8, 74, 7),
('Kraker bran', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 350, 10, 72, 5),
('Mazorca', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 86, 3, 19, 1.2),
('Pan arabe', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 275, 9, 50, 4),
('Pan frances', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 290, 10, 52, 5),
('Pan blanco', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 265, 9, 49, 3),
('Pan campesino', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 260, 8, 48, 4),
('Pan perro/hamburguesa', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 250, 9, 45, 4),
('Yuca', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 160, 1.5, 38, 0.2),
('Papa', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 77, 2, 17, 0.1),
('Ocumo', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 128, 1.5, 30, 0.2),
('Batata', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 86, 1.6, 20, 0.1),
('Platano', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 89, 1.1, 23, 0.3),
('Pasta', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 131, 5, 25, 1.1),
('Arroz', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 130, 2.7, 28, 0.3),
('Avena', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 389, 17, 66, 7),
('Caraota', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 127, 9, 23, 0.5),
('Lenteja', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 116, 9, 20, 0.4),
('Arvejas', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 81, 5.4, 14, 0.4),
('Garbanzo', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 164, 8.9, 27, 2.6),
('Casabe', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 330, 2, 80, 0.5),
('Harina de trigo', (SELECT id FROM nutridia.food_categories WHERE name='carb'), 'g', 364, 10, 76, 1);

-- ============================================================
-- FRUTAS
-- ============================================================
INSERT INTO nutridia.foods (name, category_id, default_unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g) VALUES
('Fresa', (SELECT id FROM nutridia.food_categories WHERE name='fruit'), 'g', 32, 0.7, 8, 0.3),
('Mora', (SELECT id FROM nutridia.food_categories WHERE name='fruit'), 'g', 43, 1.4, 10, 0.5),
('Mandarina', (SELECT id FROM nutridia.food_categories WHERE name='fruit'), 'g', 53, 0.8, 13, 0.3),
('Pera', (SELECT id FROM nutridia.food_categories WHERE name='fruit'), 'g', 57, 0.4, 15, 0.1),
('Melocoton', (SELECT id FROM nutridia.food_categories WHERE name='fruit'), 'g', 39, 0.9, 10, 0.3),
('Manzana', (SELECT id FROM nutridia.food_categories WHERE name='fruit'), 'g', 52, 0.3, 14, 0.2),
('Naranja', (SELECT id FROM nutridia.food_categories WHERE name='fruit'), 'g', 47, 0.9, 12, 0.1),
('Durazno', (SELECT id FROM nutridia.food_categories WHERE name='fruit'), 'g', 39, 0.9, 10, 0.3),
('Parchita', (SELECT id FROM nutridia.food_categories WHERE name='fruit'), 'g', 97, 2.2, 23, 0.7),
('Guanabana', (SELECT id FROM nutridia.food_categories WHERE name='fruit'), 'g', 66, 1, 16, 0.3),
('Pina', (SELECT id FROM nutridia.food_categories WHERE name='fruit'), 'g', 50, 0.5, 13, 0.1),
('Cambur manzano', (SELECT id FROM nutridia.food_categories WHERE name='fruit'), 'g', 89, 1.1, 23, 0.3),
('Cambur guineo', (SELECT id FROM nutridia.food_categories WHERE name='fruit'), 'g', 89, 1.1, 23, 0.3),
('Melon', (SELECT id FROM nutridia.food_categories WHERE name='fruit'), 'g', 34, 0.8, 8, 0.2),
('Patilla', (SELECT id FROM nutridia.food_categories WHERE name='fruit'), 'g', 30, 0.6, 8, 0.2),
('Lechosa', (SELECT id FROM nutridia.food_categories WHERE name='fruit'), 'g', 43, 0.4, 11, 0.4),
('Uvas', (SELECT id FROM nutridia.food_categories WHERE name='fruit'), 'g', 69, 0.7, 18, 0.2),
('Mango', (SELECT id FROM nutridia.food_categories WHERE name='fruit'), 'g', 60, 0.8, 15, 0.4),
('Guayaba', (SELECT id FROM nutridia.food_categories WHERE name='fruit'), 'g', 68, 2.6, 14, 0.9);

-- ============================================================
-- VEGETALES (1 racion = 50g, combinando 4 vegetales)
-- ============================================================
INSERT INTO nutridia.foods (name, category_id, default_unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g) VALUES
('Berenjena', (SELECT id FROM nutridia.food_categories WHERE name='vegetable'), 'g', 25, 1, 6, 0.2),
('Zanahoria', (SELECT id FROM nutridia.food_categories WHERE name='vegetable'), 'g', 41, 0.9, 10, 0.2),
('Brocoli', (SELECT id FROM nutridia.food_categories WHERE name='vegetable'), 'g', 34, 2.8, 7, 0.4),
('Calabacin', (SELECT id FROM nutridia.food_categories WHERE name='vegetable'), 'g', 17, 1.2, 3, 0.3),
('Champiñón', (SELECT id FROM nutridia.food_categories WHERE name='vegetable'), 'g', 22, 3.1, 3, 0.3),
('Esparragos', (SELECT id FROM nutridia.food_categories WHERE name='vegetable'), 'g', 20, 2.2, 4, 0.1),
('Remolacha', (SELECT id FROM nutridia.food_categories WHERE name='vegetable'), 'g', 43, 1.6, 10, 0.2),
('Repolla', (SELECT id FROM nutridia.food_categories WHERE name='vegetable'), 'g', 25, 1.3, 6, 0.1),
('Coliflor', (SELECT id FROM nutridia.food_categories WHERE name='vegetable'), 'g', 25, 1.9, 5, 0.3);

-- ============================================================
-- ENSALADA (mix)
-- ============================================================
INSERT INTO nutridia.foods (name, category_id, default_unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g) VALUES
('Lechuga', (SELECT id FROM nutridia.food_categories WHERE name='salad'), 'g', 15, 1.4, 2, 0.2),
('Tomate', (SELECT id FROM nutridia.food_categories WHERE name='salad'), 'g', 18, 0.9, 3.9, 0.2),
('Cebolla', (SELECT id FROM nutridia.food_categories WHERE name='salad'), 'g', 40, 1.1, 9, 0.1),
('Pepino', (SELECT id FROM nutridia.food_categories WHERE name='salad'), 'g', 15, 0.7, 3.6, 0.1),
('Aguacate', (SELECT id FROM nutridia.food_categories WHERE name='fat'), 'g', 160, 2, 9, 15);

-- ============================================================
-- GRASAS SALUDABLES
-- ============================================================
INSERT INTO nutridia.foods (name, category_id, default_unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g) VALUES
('Aceite de oliva', (SELECT id FROM nutridia.food_categories WHERE name='fat'), 'ml', 884, 0, 0, 100),
('Aceite de coco', (SELECT id FROM nutridia.food_categories WHERE name='fat'), 'ml', 862, 0, 0, 100),
('Almendra', (SELECT id FROM nutridia.food_categories WHERE name='fat'), 'g', 579, 21, 22, 50),
('Mani', (SELECT id FROM nutridia.food_categories WHERE name='fat'), 'g', 567, 26, 16, 49),
('Nuez', (SELECT id FROM nutridia.food_categories WHERE name='fat'), 'g', 654, 15, 14, 65),
('Pistacho', (SELECT id FROM nutridia.food_categories WHERE name='fat'), 'g', 560, 20, 28, 45);

-- ============================================================
-- LACTEOS / BEBIDAS
-- ============================================================
INSERT INTO nutridia.foods (name, category_id, default_unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g) VALUES
('Leche descremada', (SELECT id FROM nutridia.food_categories WHERE name='protein'), 'ml', 34, 3.4, 5, 0.1),
('Leche deslactosada', (SELECT id FROM nutridia.food_categories WHERE name='protein'), 'ml', 42, 3.2, 6, 1),
('Leche de almendra', (SELECT id FROM nutridia.food_categories WHERE name='fat'), 'ml', 15, 0.6, 0.6, 1.2),
('Agua de coco', (SELECT id FROM nutridia.food_categories WHERE name='fruit'), 'ml', 19, 0.7, 3.7, 0.2),
('Jugo de naranja', (SELECT id FROM nutridia.food_categories WHERE name='fruit'), 'ml', 45, 0.7, 10, 0.2);
