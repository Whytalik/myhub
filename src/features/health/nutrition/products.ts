export interface FoodMacros {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export type ProductKind = "tracked" | "pantry" | "prepared";

export interface Product {
  key: string;
  nameUk: string;
  kind: ProductKind;
  macros?: FoodMacros;
  /**
   * Слово, з якого автоматично виводиться корінь для підсвічування згадок
   * у вільному тексті (`highlight-products.tsx`). За замовчуванням береться
   * останнє слово `nameUk` (зазвичай іменник в укр. порядку "прикметник
   * іменник"). Задається вручну лише коли це замовчування дає хибний або
   * заскоро загальний корінь (перевірено на реальних текстах плану).
   */
  searchTerm?: string;
  /** Підрядки одразу після кореня, які виключають збіг (напр. "сир" без "ник"). */
  excludeAfter?: string[];
}

function tracked(
  key: string,
  nameUk: string,
  macros: FoodMacros,
  extra?: Pick<Product, "searchTerm" | "excludeAfter">,
): Product {
  return { key, nameUk, kind: "tracked", macros, ...extra };
}

function prepared(key: string, nameUk: string, macros: FoodMacros): Product {
  return { key, nameUk, kind: "prepared", macros };
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
  eggs: tracked("eggs", "Яйця", { kcal: 155, protein: 13, fat: 11, carbs: 1.1 }),
  bread: tracked("bread", "Цільнозерновий хліб", { kcal: 250, protein: 10, fat: 3.5, carbs: 43 }),
  freshVeg: tracked("freshVeg", "Свіжі овочі", { kcal: 20, protein: 1, fat: 0.2, carbs: 4 }),
  oil: tracked("oil", "Олія", { kcal: 884, protein: 0, fat: 100, carbs: 0 }),
  chickenMarinated: tracked(
    "chickenMarinated",
    "Куряче стегно/філе (мариноване)",
    { kcal: 180, protein: 29, fat: 6, carbs: 2 },
    // "стегно/філе" — дві альтернативні відрубини; спільне для обох — прикметник "куряче".
    { searchTerm: "куряче" },
  ),
  friedChicken: tracked("friedChicken", "Смажена курка", {
    kcal: 220,
    protein: 26,
    fat: 12,
    carbs: 1,
  }),
  chickenHearts: tracked("chickenHearts", "Курячі серця", {
    kcal: 185,
    protein: 17,
    fat: 11.4,
    carbs: 0.8,
  }),
  potato: tracked("potato", "Картопля", { kcal: 87, protein: 1.9, fat: 0.1, carbs: 20 }),
  milk: tracked("milk", "Молоко", { kcal: 42, protein: 3.4, fat: 1, carbs: 5 }),
  butter: tracked("butter", "Вершкове масло", { kcal: 717, protein: 0.9, fat: 81, carbs: 0.1 }),
  tomato: tracked("tomato", "Помідори", { kcal: 18, protein: 0.9, fat: 0.2, carbs: 3.9 }),
  cucumber: tracked("cucumber", "Огірки", { kcal: 15, protein: 0.7, fat: 0.1, carbs: 3.6 }),
  pepper: tracked("pepper", "Болгарський перець", { kcal: 20, protein: 1, fat: 0.2, carbs: 4.6 }),
  onion: tracked("onion", "Цибуля", { kcal: 40, protein: 1.1, fat: 0.1, carbs: 9.3 }),
  brynza: tracked("brynza", "Бринза", { kcal: 260, protein: 16, fat: 21, carbs: 2 }),
  yogurtGreek: tracked("yogurtGreek", "Грецький йогурт", {
    kcal: 73,
    protein: 9,
    fat: 2,
    carbs: 4,
  }),
  berries: tracked("berries", "Ягоди", { kcal: 43, protein: 0.8, fat: 0.4, carbs: 10 }),
  fruitMix: tracked("fruitMix", "Фрукти (мікс)", { kcal: 60, protein: 0.5, fat: 0.3, carbs: 15 }),
  banana: tracked("banana", "Банан", { kcal: 89, protein: 1.1, fat: 0.3, carbs: 23 }),
  oats: tracked("oats", "Вівсянка", { kcal: 389, protein: 13.5, fat: 6.9, carbs: 66.3 }),
  proteinPowder: tracked("proteinPowder", "Протеїновий порошок", {
    kcal: 400,
    protein: 80,
    fat: 6.7,
    carbs: 10,
  }),
  buckwheat: tracked("buckwheat", "Гречка", { kcal: 343, protein: 13.3, fat: 3.4, carbs: 71.5 }),
  rice: tracked("rice", "Рис", { kcal: 365, protein: 7.1, fat: 0.7, carbs: 80 }),
  arugula: tracked("arugula", "Рукола", { kcal: 25, protein: 2.6, fat: 0.7, carbs: 3.7 }),
  icebergLettuce: tracked("icebergLettuce", "Айсберг", {
    kcal: 14,
    protein: 0.9,
    fat: 0.1,
    carbs: 3,
  }),
  hardCheese: tracked(
    "hardCheese",
    "Твердий сир",
    { kcal: 380, protein: 25, fat: 30, carbs: 2 },
    // "сир" є префіксом слова "сирники" (інша страва) — виключаємо цей збіг.
    { excludeAfter: ["ник"] },
  ),
  suluguni: tracked("suluguni", "Сулугуні", { kcal: 285, protein: 20, fat: 22, carbs: 0 }),
  cottageCheese: tracked("cottageCheese", "Творог", { kcal: 159, protein: 16.7, fat: 9, carbs: 3 }),
  soySauce: tracked(
    "soySauce",
    "Соєвий соус",
    { kcal: 60, protein: 10, fat: 0, carbs: 6 },
    // "соус" занадто загальне слово (в тексті є й інші соуси) — беремо "соєвий".
    { searchTerm: "соєвий" },
  ),
  honey: tracked("honey", "Мед", { kcal: 304, protein: 0.3, fat: 0, carbs: 82.4 }),
  mackerel: tracked("mackerel", "Скумбрія", { kcal: 205, protein: 19, fat: 13.9, carbs: 0 }),
  tunaCanned: tracked(
    "tunaCanned",
    "Тунець консервований",
    { kcal: 116, protein: 26, fat: 1, carbs: 0 },
    // "консервований" спільне з cornCanned — беремо конкретний іменник.
    { searchTerm: "тунець" },
  ),
  cornCanned: tracked(
    "cornCanned",
    "Кукурудза консервована",
    { kcal: 76, protein: 2.9, fat: 1.2, carbs: 15.6 },
    { searchTerm: "кукурудза" },
  ),
  carrot: tracked("carrot", "Морква", { kcal: 41, protein: 0.9, fat: 0.2, carbs: 10 }),
  sugar: tracked("sugar", "Цукор", { kcal: 387, protein: 0, fat: 0, carbs: 100 }),
  mayo: tracked("mayo", "Майонез", { kcal: 680, protein: 1, fat: 75, carbs: 2.6 }),
  mustardDijon: tracked(
    "mustardDijon",
    "Гірчиця діжонська",
    { kcal: 150, protein: 4, fat: 11, carbs: 5 },
    // текст майже завжди каже просто "гірчиця", а не "діжонська".
    { searchTerm: "гірчиця" },
  ),
  porkChop: tracked("porkChop", "Свиняча відбивна", { kcal: 250, protein: 26, fat: 16, carbs: 0 }),
  cream: tracked("cream", "Вершки", { kcal: 145, protein: 2.8, fat: 12.5, carbs: 4 }),

  // Готується під час міл-препу з уже врахованих tracked-продуктів — не купується окремо.
  syrniki: prepared("syrniki", "Сирники (заготовка)", {
    kcal: 200,
    protein: 12,
    fat: 8,
    carbs: 20,
  }),

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
};

export type ProductKey = keyof typeof PRODUCTS;

export function getProductName(key: string): string {
  return PRODUCTS[key]?.nameUk ?? key;
}
