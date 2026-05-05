-- Seed CookingMethod
INSERT INTO "CookingMethod" ("id", "name", "coefficient", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'Сире', 1.0, NOW(), NOW()),
  (gen_random_uuid(), 'Варіння м''ясо/риба', 0.75, NOW(), NOW()),
  (gen_random_uuid(), 'Варіння крупи/макарони', 2.5, NOW(), NOW()),
  (gen_random_uuid(), 'Смаження без олії', 0.80, NOW(), NOW()),
  (gen_random_uuid(), 'Смаження з олією', 0.85, NOW(), NOW()),
  (gen_random_uuid(), 'Запікання', 0.80, NOW(), NOW()),
  (gen_random_uuid(), 'Тушкування', 0.85, NOW(), NOW()),
  (gen_random_uuid(), 'Приготування на пару', 0.90, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Seed MealTemplateSlot
INSERT INTO "MealTemplateSlot" ("id", "name", "goal", "percentage", "order", "minProteinGrams", "maxPctOfDaily", "fiberPct") VALUES
  -- GAIN (5 slots)
  (gen_random_uuid(), 'Сніданок', 'GAIN', 25, 1, 30, NULL, 0.25),
  (gen_random_uuid(), 'Перекус 1', 'GAIN', 10, 2, NULL, NULL, 0.10),
  (gen_random_uuid(), 'Обід', 'GAIN', 35, 3, 40, NULL, 0.35),
  (gen_random_uuid(), 'Перекус 2', 'GAIN', 15, 4, 20, NULL, 0.10),
  (gen_random_uuid(), 'Вечеря', 'GAIN', 15, 5, 30, 0.20, 0.20),
  -- MAINTAIN (4 slots)
  (gen_random_uuid(), 'Сніданок', 'MAINTAIN', 25, 1, 25, NULL, 0.25),
  (gen_random_uuid(), 'Обід', 'MAINTAIN', 35, 2, 35, NULL, 0.40),
  (gen_random_uuid(), 'Перекус', 'MAINTAIN', 10, 3, NULL, NULL, 0.10),
  (gen_random_uuid(), 'Вечеря', 'MAINTAIN', 30, 4, 25, 0.30, 0.25),
  -- LOSE (4 slots)
  (gen_random_uuid(), 'Сніданок', 'LOSE', 30, 1, 30, NULL, 0.30),
  (gen_random_uuid(), 'Обід', 'LOSE', 35, 2, 35, NULL, 0.40),
  (gen_random_uuid(), 'Перекус', 'LOSE', 10, 3, NULL, NULL, 0.10),
  (gen_random_uuid(), 'Вечеря', 'LOSE', 25, 4, 25, 0.25, 0.20)
ON CONFLICT (name, goal) DO NOTHING;
