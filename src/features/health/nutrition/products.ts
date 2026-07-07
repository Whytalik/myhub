export interface FoodMacros {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export type ProductKind = "tracked" | "pantry" | "prepared";

export type ProductCategory = "meat" | "dairy" | "vegetables" | "fruits" | "grains" | "other";

export interface Product {
  key: string;
  nameUk: string;
  kind: ProductKind;
  macros?: FoodMacros;
  /** Групування для Food Mapper — не задається для pantry (там не потрібне). */
  category?: ProductCategory;
  searchTerm?: string;
  excludeAfter?: string[];
  /** Грамів на 1 штуку — лише для продуктів, де конверсія грами→штуки стабільна
   *  й консистентна в усіх macroItems (напр. яйце, банан). Використовує
   *  `quantities.ts`'s `formatGrams` для відображення "N шт" замість грамів. */
  gramsPerPiece?: number;
  /** Коефіцієнт ваги готового продукту до сухого (напр. 2.8 для рису). */
  cookedMultiplier?: number;
}

function tracked(
  key: string,
  nameUk: string,
  macros: FoodMacros,
  category: ProductCategory,
  extra?: Pick<Product, "searchTerm" | "excludeAfter" | "gramsPerPiece" | "cookedMultiplier">,
): Product {
  return { key, nameUk, kind: "tracked", macros, category, ...extra };
}

function prepared(
  key: string,
  nameUk: string,
  macros: FoodMacros,
  category: ProductCategory,
): Product {
  return { key, nameUk, kind: "prepared", macros, category };
}

function pantry(
  key: string,
  nameUk: string,
  extra?: Pick<Product, "searchTerm" | "excludeAfter">,
): Product {
  return { key, nameUk, kind: "pantry", ...extra };
}

/**
 * Канонічний реєстр продуктів нутриційного модуля — єдине джерело істини для
 * бази макросів (`calculateDayMacros`) і для автопідсвічування згадок
 * продуктів у вільному тексті (`highlight-products.tsx`).
 *
 * - tracked — купується напряму, макроси рахуються.
 * - prepared — рахується в макросах, але готується з інших tracked-продуктів
 *   під час міл-препу (наприклад сирники з творогу).
 * - pantry — спеції й приправи: без обліку макросів.
 */
export const PRODUCTS: Record<string, Product> = {
  eggs: tracked("eggs", "Яйця", { kcal: 155, protein: 13, fat: 11, carbs: 1.1 }, "other", {
    gramsPerPiece: 60,
  }),
  bread: tracked(
    "bread",
    "Цільнозерновий хліб",
    { kcal: 250, protein: 10, fat: 3.5, carbs: 43 },
    "grains",
  ),
  oil: tracked("oil", "Олія", { kcal: 884, protein: 0, fat: 100, carbs: 0 }, "other"),
  chickenMarinated: tracked(
    // Назва — сира/базова форма (те, що купується): цей ключ покриває і
    // маринований, і запечений варіант, обидва готуються з того самого філе.
    // "Смажена курка" (friedChicken) — окремий ключ лише тому, що смаження в
    // олії дає інший макропрофіль, не через іншу сировину.
    "chickenMarinated",
    "Куряче філе",
    { kcal: 180, protein: 29, fat: 6, carbs: 2 },
    "meat",
    { searchTerm: "куряче" },
  ),
  friedChicken: tracked(
    "friedChicken",
    "Смажена курка",
    { kcal: 220, protein: 26, fat: 12, carbs: 1 },
    "meat",
  ),
  chickenHearts: tracked(
    "chickenHearts",
    "Курячі серця",
    { kcal: 185, protein: 17, fat: 11.4, carbs: 0.8 },
    "meat",
  ),
  potato: tracked(
    "potato",
    "Картопля",
    { kcal: 87, protein: 1.9, fat: 0.1, carbs: 20 },
    "vegetables",
  ),
  milk: tracked("milk", "Молоко", { kcal: 42, protein: 3.4, fat: 1, carbs: 5 }, "dairy"),
  butter: tracked(
    "butter",
    "Вершкове масло",
    { kcal: 717, protein: 0.9, fat: 81, carbs: 0.1 },
    "dairy",
  ),
  tomato: tracked(
    "tomato",
    "Помідори",
    { kcal: 18, protein: 0.9, fat: 0.2, carbs: 3.9 },
    "vegetables",
  ),
  cucumber: tracked(
    "cucumber",
    "Огірки",
    { kcal: 15, protein: 0.7, fat: 0.1, carbs: 3.6 },
    "vegetables",
  ),
  pepper: tracked(
    "pepper",
    "Болгарський перець",
    { kcal: 20, protein: 1, fat: 0.2, carbs: 4.6 },
    "vegetables",
  ),
  onion: tracked("onion", "Цибуля", { kcal: 40, protein: 1.1, fat: 0.1, carbs: 9.3 }, "vegetables"),
  brynza: tracked("brynza", "Бринза", { kcal: 260, protein: 16, fat: 21, carbs: 2 }, "dairy"),
  yogurtGreek: tracked(
    "yogurtGreek",
    "Грецький йогурт",
    { kcal: 73, protein: 9, fat: 2, carbs: 4 },
    "dairy",
  ),
  berries: tracked("berries", "Ягоди", { kcal: 43, protein: 0.8, fat: 0.4, carbs: 10 }, "fruits"),
  fruitMix: tracked(
    "fruitMix",
    "Фрукти (мікс)",
    { kcal: 60, protein: 0.5, fat: 0.3, carbs: 15 },
    "fruits",
  ),
  banana: tracked("banana", "Банан", { kcal: 89, protein: 1.1, fat: 0.3, carbs: 23 }, "fruits", {
    gramsPerPiece: 120,
  }),
  oats: tracked("oats", "Вівсянка", { kcal: 389, protein: 13.5, fat: 6.9, carbs: 66.3 }, "grains", {
    cookedMultiplier: 2.8,
  }),
  proteinPowder: tracked(
    "proteinPowder",
    "Протеїновий порошок",
    { kcal: 400, protein: 80, fat: 6.7, carbs: 10 },
    "other",
  ),
  buckwheat: tracked(
    "buckwheat",
    "Гречка",
    { kcal: 343, protein: 13.3, fat: 3.4, carbs: 71.5 },
    "grains",
    { cookedMultiplier: 2.8 },
  ),
  rice: tracked("rice", "Рис", { kcal: 365, protein: 7.1, fat: 0.7, carbs: 80 }, "grains", {
    cookedMultiplier: 2.8,
  }),
  arugula: tracked(
    "arugula",
    "Рукола",
    { kcal: 25, protein: 2.6, fat: 0.7, carbs: 3.7 },
    "vegetables",
  ),
  icebergLettuce: tracked(
    "icebergLettuce",
    "Айсберг",
    { kcal: 14, protein: 0.9, fat: 0.1, carbs: 3 },
    "vegetables",
  ),
  hardCheese: tracked(
    "hardCheese",
    "Твердий сир",
    { kcal: 380, protein: 25, fat: 30, carbs: 2 },
    "dairy",
    // "сир" є префіксом слова "сирники" (інша страва) — виключаємо цей збіг.
    { excludeAfter: ["ник"] },
  ),
  suluguni: tracked("suluguni", "Сулугуні", { kcal: 285, protein: 20, fat: 22, carbs: 0 }, "dairy"),
  cottageCheese: tracked(
    "cottageCheese",
    "Творог",
    { kcal: 159, protein: 16.7, fat: 9, carbs: 3 },
    "dairy",
  ),
  soySauce: tracked(
    "soySauce",
    "Соєвий соус",
    { kcal: 60, protein: 10, fat: 0, carbs: 6 },
    "other",
    // "соус" занадто загальне слово (в тексті є й інші соуси) — беремо "соєвий".
    { searchTerm: "соєвий" },
  ),
  honey: tracked("honey", "Мед", { kcal: 304, protein: 0.3, fat: 0, carbs: 82.4 }, "other"),
  mackerel: tracked(
    "mackerel",
    "Скумбрія",
    { kcal: 205, protein: 19, fat: 13.9, carbs: 0 },
    "meat",
  ),
  tunaCanned: tracked(
    "tunaCanned",
    "Тунець консервований",
    { kcal: 116, protein: 26, fat: 1, carbs: 0 },
    "meat",
    // "консервований" спільне з cornCanned — беремо конкретний іменник.
    { searchTerm: "тунець" },
  ),
  cornCanned: tracked(
    "cornCanned",
    "Кукурудза консервована",
    { kcal: 76, protein: 2.9, fat: 1.2, carbs: 15.6 },
    "vegetables",
    { searchTerm: "кукурудза" },
  ),
  carrot: tracked(
    "carrot",
    "Морква",
    { kcal: 41, protein: 0.9, fat: 0.2, carbs: 10 },
    "vegetables",
  ),
  sugar: tracked("sugar", "Цукор", { kcal: 387, protein: 0, fat: 0, carbs: 100 }, "other"),
  mayo: tracked("mayo", "Майонез", { kcal: 680, protein: 1, fat: 75, carbs: 2.6 }, "other"),
  mustardDijon: tracked(
    "mustardDijon",
    "Гірчиця діжонська",
    { kcal: 183.5, protein: 8.8, fat: 6.9, carbs: 23 },
    "other",
    // текст майже завжди каже просто "гірчиця", а не "діжонська".
    { searchTerm: "гірчиця" },
  ),
  porkChop: tracked(
    "porkChop",
    "Свиняча відбивна",
    { kcal: 250, protein: 26, fat: 16, carbs: 0 },
    "meat",
  ),
  cream: tracked("cream", "Вершки", { kcal: 145, protein: 2.8, fat: 12.5, carbs: 4 }, "dairy"),

  // Готується під час міл-препу з уже врахованих tracked-продуктів — не купується окремо.
  syrniki: prepared(
    "syrniki",
    "Сирники (заготовка)",
    { kcal: 200, protein: 12, fat: 8, carbs: 20 },
    "dairy",
  ),

  // Спеції, приправи та інші pantry-продукти — купуються, але без обліку макросів.
  rosemary: pantry("rosemary", "Розмарин"),
  thyme: pantry("thyme", "Чебрець"),
  paprika: pantry("paprika", "Паприка"),
  provencalHerbs: pantry(
    "provencalHerbs",
    "Прованські трави",
    // "трави" збігається з генеричним "трав'яна база" (сухий маринад) — беремо "прованські".
    { searchTerm: "прованські" },
  ),
  oregano: pantry("oregano", "Орегано"),
  coriander: pantry("coriander", "Коріандр"),
  nutmeg: pantry("nutmeg", "Мускатний горіх"),
  salt: pantry("salt", "Сіль"),
  blackPepper: pantry("blackPepper", "Чорний перець"),
  lemon: pantry("lemon", "Лимон"),
  garlic: pantry("garlic", "Часник"),
  tomatoPaste: pantry("tomatoPaste", "Томатна паста"),
  flour: pantry("flour", "Борошно"),
  vanillaSugar: pantry("vanillaSugar", "Ванільний цукор"),
  dillParsley: pantry("dillParsley", "Кріп/петрушка"),
  greenOnion: pantry(
    "greenOnion",
    "Зелена цибуля",
    // Дефолтний корінь дав би "цибуля", що збігається зі звичайною цибулею — беремо "зелена".
    { searchTerm: "зелена" },
  ),
  basil: pantry("basil", "Базилік"),
  appleVinegar: pantry("appleVinegar", "Яблучний оцет"),
};

export type ProductKey = keyof typeof PRODUCTS;

export function getProductName(key: string): string {
  return PRODUCTS[key]?.nameUk ?? key;
}
