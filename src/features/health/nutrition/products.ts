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
  /** Базова ціна за кг, літр, штуку або упаковку. */
  basePrice?: number;
}

function tracked(
  key: string,
  nameUk: string,
  macros: FoodMacros,
  category: ProductCategory,
  extra?: Pick<
    Product,
    "searchTerm" | "excludeAfter" | "gramsPerPiece" | "cookedMultiplier" | "basePrice"
  >,
): Product {
  return { key, nameUk, kind: "tracked", macros, category, ...extra };
}

function prepared(
  key: string,
  nameUk: string,
  macros: FoodMacros,
  category: ProductCategory,
  basePrice?: number,
): Product {
  return { key, nameUk, kind: "prepared", macros, category, basePrice };
}

function pantry(
  key: string,
  nameUk: string,
  extra?: Pick<Product, "searchTerm" | "excludeAfter" | "basePrice">,
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
  bunMalyatko: tracked(
    "bunMalyatko",
    "Булочки 'Малятко' (Київхліб)",
    { kcal: 338, protein: 8.5, fat: 7, carbs: 59 },
    "grains",
    {
      gramsPerPiece: 50,
      basePrice: 100,
      searchTerm: "малятк",
    },
  ),
  eggs: tracked("eggs", "Яйця", { kcal: 143, protein: 12.6, fat: 9.5, carbs: 0.7 }, "other", {
    gramsPerPiece: 60,
    basePrice: 80,
  }),
  bread: tracked(
    "bread",
    "Хліб гречаний",
    { kcal: 240, protein: 10, fat: 2.8, carbs: 49 },
    "grains",
    { basePrice: 150 },
  ),
  oil: tracked("oil", "Олія", { kcal: 884, protein: 0, fat: 100, carbs: 0 }, "other"),
  chickenMarinated: tracked(
    // Назва — сира/базова форма (те, що купується): цей ключ покриває і
    // маринований, і запечений варіант, обидва готуються з того самого філе.
    // "Смажена курка" (friedChicken) — окремий ключ лише тому, що смаження в
    // олії дає інший макропрофіль, не через іншу сировину.
    "chickenMarinated",
    "Куряче філе",
    { kcal: 120, protein: 22.5, fat: 2.6, carbs: 0 },
    "meat",
    { searchTerm: "куряче", cookedMultiplier: 0.75, basePrice: 218 },
  ),
  friedChicken: tracked(
    "friedChicken",
    "Смажена курка",
    { kcal: 220, protein: 26, fat: 12, carbs: 1 },
    "meat",
    { cookedMultiplier: 0.75 },
  ),
  chickenHearts: tracked(
    "chickenHearts",
    "Курячі серця",
    { kcal: 153, protein: 15.6, fat: 9.3, carbs: 0.1 },
    "meat",
    { cookedMultiplier: 0.65, basePrice: 140 },
  ),
  potato: tracked(
    "potato",
    "Картопля",
    { kcal: 87, protein: 1.9, fat: 0.1, carbs: 20 },
    "vegetables",
    { basePrice: 22 },
  ),
  milk: tracked("milk", "Молоко", { kcal: 52, protein: 2.8, fat: 2.5, carbs: 4.7 }, "dairy"),
  butter: tracked(
    "butter",
    "Вершкове масло",
    { kcal: 717, protein: 0.9, fat: 81, carbs: 0.1 },
    "dairy",
    { basePrice: 550 },
  ),
  tomato: tracked(
    "tomato",
    "Помідори",
    { kcal: 18, protein: 0.9, fat: 0.2, carbs: 3.9 },
    "vegetables",
    { basePrice: 25 },
  ),
  cucumber: tracked(
    "cucumber",
    "Огірки",
    { kcal: 15, protein: 0.7, fat: 0.1, carbs: 3.6 },
    "vegetables",
    { basePrice: 25 },
  ),
  pepper: tracked(
    "pepper",
    "Болгарський перець",
    { kcal: 20, protein: 1, fat: 0.2, carbs: 4.6 },
    "vegetables",
    { basePrice: 45 },
  ),
  onion: tracked(
    "onion",
    "Цибуля",
    { kcal: 40, protein: 1.1, fat: 0.1, carbs: 9.3 },
    "vegetables",
    { basePrice: 28 },
  ),
  mozzarella: tracked(
    "mozzarella",
    "Моцарела",
    { kcal: 250, protein: 17.9, fat: 17.9, carbs: 3.6 },
    "dairy",
    { basePrice: 400 },
  ),
  parmesan: tracked(
    "parmesan",
    "Пармезан",
    { kcal: 392, protein: 35.8, fat: 25.8, carbs: 3.2 },
    "dairy",
  ),
  feta: tracked("feta", "Фета", { kcal: 264, protein: 14.2, fat: 21.3, carbs: 4.1 }, "dairy"),
  yogurtGreek: tracked(
    "yogurtGreek",
    "Грецький йогурт",
    { kcal: 73, protein: 9, fat: 2, carbs: 4 },
    "dairy",
    { basePrice: 260 },
  ),
  berries: tracked("berries", "Ягоди", { kcal: 43, protein: 0.8, fat: 0.4, carbs: 10 }, "fruits", {
    basePrice: 310,
  }),
  banana: tracked("banana", "Банан", { kcal: 89, protein: 1.1, fat: 0.3, carbs: 23 }, "fruits", {
    gramsPerPiece: 120,
    basePrice: 62,
  }),
  // Оцінка типового укр. питного підсолодженого йогурту — звірити з етикеткою
  // конкретного продукту перед закупівлею. Альтернатива банану на "Передтрен"
  // (Сет1/3/5) — брати ПОРЦІЙНІ баночки (~100 г), не велику пляшку (270 г),
  // інакше калорійність зростає в 3-4 рази проти банана на тому ж слоті.
  yogurtSweetened: tracked(
    "yogurtSweetened",
    "Йогурт питний підсолоджений",
    { kcal: 78, protein: 2.9, fat: 1.5, carbs: 12 },
    "dairy",
    { searchTerm: "йогурт питний", basePrice: 65 },
  ),
  oats: tracked("oats", "Вівсянка", { kcal: 389, protein: 13.5, fat: 6.9, carbs: 66.3 }, "grains", {
    cookedMultiplier: 2.8,
  }),
  proteinPowder: tracked(
    "proteinPowder",
    "Протеїновий порошок",
    { kcal: 400, protein: 80, fat: 6.7, carbs: 10 },
    "other",
  ),
  chickenRollDobrov: tracked(
    "chickenRollDobrov",
    "Рулет курячий Добров (шинка)",
    { kcal: 135, protein: 20, fat: 6, carbs: 0.2 },
    "meat",
    { searchTerm: "рулет курячий", basePrice: 260 },
  ),
  cocoa: tracked(
    "cocoa",
    "Какао-порошок (несолодкий)",
    { kcal: 228, protein: 19.6, fat: 13.7, carbs: 57.9 },
    "other",
    { basePrice: 250 },
  ),
  peanutButter: tracked(
    "peanutButter",
    "Арахісова паста",
    { kcal: 588, protein: 22, fat: 50, carbs: 24 },
    "other",
    { searchTerm: "арахісов", basePrice: 220 },
  ),
  buckwheat: tracked(
    "buckwheat",
    "Гречка",
    { kcal: 343, protein: 13.3, fat: 3.4, carbs: 71.5 },
    "grains",
    { cookedMultiplier: 2.8, basePrice: 72 },
  ),
  sweetChiliSauce: tracked(
    "sweetChiliSauce",
    "Солодкий чилі-соус",
    { kcal: 148, protein: 0.6, fat: 0.1, carbs: 41.4 },
    "other",
  ),
  oysterSauce: tracked(
    "oysterSauce",
    "Устричний соус",
    { kcal: 85, protein: 1, fat: 0, carbs: 20 },
    "other",
  ),
  peasCarrots: tracked(
    "peasCarrots",
    "Горошок з морквою (заморожені)",
    { kcal: 61, protein: 3.15, fat: 0.3, carbs: 12.25 },
    "vegetables",
    { searchTerm: "горошок" },
  ),
  rice: tracked("rice", "Рис", { kcal: 365, protein: 7.1, fat: 0.7, carbs: 80 }, "grains", {
    cookedMultiplier: 2.8,
    basePrice: 56,
  }),
  breadcrumbs: tracked(
    "breadcrumbs",
    "Панірувальні сухарі",
    { kcal: 360, protein: 10, fat: 2, carbs: 75 },
    "grains",
    { basePrice: 65 },
  ),
  pasta: tracked(
    "pasta",
    "Макарони (сухі)",
    { kcal: 350, protein: 12, fat: 1.5, carbs: 71.5 },
    "grains",
    { cookedMultiplier: 2.3, basePrice: 42 },
  ),
  arugula: tracked(
    "arugula",
    "Рукола",
    { kcal: 25, protein: 2.6, fat: 0.7, carbs: 3.7 },
    "vegetables",
    { basePrice: 550 },
  ),
  icebergLettuce: tracked(
    "icebergLettuce",
    "Айсберг",
    { kcal: 14, protein: 0.9, fat: 0.1, carbs: 3 },
    "vegetables",
    { basePrice: 262 },
  ),
  zucchini: tracked(
    "zucchini",
    "Кабачки",
    { kcal: 17, protein: 1.2, fat: 0.2, carbs: 3.1 },
    "vegetables",
    { searchTerm: "кабачок кабачк", basePrice: 60 },
  ),
  broccoli: tracked(
    "broccoli",
    "Броколі",
    { kcal: 34, protein: 2.8, fat: 0.4, carbs: 7 },
    "vegetables",
    { searchTerm: "брокол", basePrice: 140 },
  ),
  cauliflower: tracked(
    "cauliflower",
    "Цвітна капуста",
    { kcal: 25, protein: 1.9, fat: 0.3, carbs: 5 },
    "vegetables",
    { searchTerm: "цвітн", basePrice: 70 },
  ),
  spinachFrozen: tracked(
    "spinachFrozen",
    "Шпинат заморожений",
    { kcal: 31, protein: 2.9, fat: 0.4, carbs: 3.6 },
    "vegetables",
    { searchTerm: "шпинат", basePrice: 65 },
  ),
  cabbage: tracked(
    "cabbage",
    "Капуста",
    { kcal: 25, protein: 1.8, fat: 0.1, carbs: 5.8 },
    "vegetables",
    { searchTerm: "капуст", basePrice: 15 },
  ),
  pickledCucumber: tracked(
    "pickledCucumber",
    "Солоні огірки",
    { kcal: 11, protein: 0.8, fat: 0.1, carbs: 1.7 },
    "vegetables",
    { searchTerm: "солон", basePrice: 140 },
  ),
  radish: tracked(
    "radish",
    "Редиска",
    { kcal: 19, protein: 1.2, fat: 0.1, carbs: 3.4 },
    "vegetables",
    { searchTerm: "редиск", basePrice: 40 },
  ),
  beetroot: tracked(
    "beetroot",
    "Буряк",
    { kcal: 43, protein: 1.6, fat: 0.1, carbs: 9.6 },
    "vegetables",
    { searchTerm: "буряк", basePrice: 20 },
  ),
  apple: tracked("apple", "Яблука", { kcal: 52, protein: 0.3, fat: 0.2, carbs: 13.8 }, "fruits", {
    searchTerm: "яблук",
    basePrice: 40,
  }),
  orange: tracked(
    "orange",
    "Апельсини",
    { kcal: 47, protein: 0.9, fat: 0.1, carbs: 11.8 },
    "fruits",
    { searchTerm: "апельсин", basePrice: 75 },
  ),
  apricot: tracked(
    "apricot",
    "Абрикоси",
    { kcal: 48, protein: 1.4, fat: 0.4, carbs: 11.1 },
    "fruits",
    { searchTerm: "абрикос", basePrice: 80 },
  ),
  peach: tracked("peach", "Персики", { kcal: 39, protein: 0.9, fat: 0.3, carbs: 9.5 }, "fruits", {
    searchTerm: "персик",
    basePrice: 48,
  }),
  plum: tracked("plum", "Сливи", { kcal: 46, protein: 0.7, fat: 0.3, carbs: 11.4 }, "fruits", {
    searchTerm: "слив",
    basePrice: 35,
  }),
  pear: tracked("pear", "Груші", { kcal: 57, protein: 0.4, fat: 0.1, carbs: 15.2 }, "fruits", {
    searchTerm: "груш",
    basePrice: 55,
  }),
  hardCheese: tracked(
    "hardCheese",
    "Твердий сир",
    { kcal: 363, protein: 24.1, fat: 29.5, carbs: 0.3 },
    "dairy",
    // "сир" є префіксом слова "сирники" (інша страва) — виключаємо цей збіг.
    { excludeAfter: ["ник"], basePrice: 470 },
  ),
  suluguni: tracked(
    "suluguni",
    "Сулугуні",
    { kcal: 282, protein: 20.5, fat: 22, carbs: 0.4 },
    "dairy",
  ),
  cottageCheese: tracked(
    "cottageCheese",
    "Творог",
    { kcal: 159, protein: 16.7, fat: 9, carbs: 3 },
    "dairy",
    { basePrice: 300 },
  ),
  soySauce: tracked(
    "soySauce",
    "Соєвий соус",
    { kcal: 60, protein: 10, fat: 0, carbs: 6 },
    "other",
    // "соус" занадто загальне слово (в тексті є й інші соуси) — беремо "соєвий".
    { searchTerm: "соєвий" },
  ),
  honey: tracked("honey", "Мед", { kcal: 308, protein: 0.8, fat: 0, carbs: 80.3 }, "other", {
    basePrice: 320,
  }),
  mackerel: tracked(
    "mackerel",
    "Скумбрія",
    { kcal: 205, protein: 18.6, fat: 13.9, carbs: 0 },
    "meat",
    { cookedMultiplier: 0.8 },
  ),
  tunaCanned: tracked(
    "tunaCanned",
    "Тунець консервований",
    { kcal: 116, protein: 25.5, fat: 0.8, carbs: 0 },
    "meat",
    // "консервований" спільне з cornCanned — беремо конкретний іменник.
    { searchTerm: "тунець" },
  ),
  cornCanned: tracked(
    "cornCanned",
    "Кукурудза консервована",
    { kcal: 76, protein: 2.9, fat: 1.2, carbs: 15.6 },
    "vegetables",
    { searchTerm: "кукурудза", basePrice: 171 },
  ),
  carrot: tracked(
    "carrot",
    "Морква",
    { kcal: 41, protein: 0.9, fat: 0.2, carbs: 10 },
    "vegetables",
    { basePrice: 30 },
  ),
  sugar: tracked("sugar", "Цукор", { kcal: 374, protein: 0, fat: 0, carbs: 99.5 }, "other"),
  mayo: tracked("mayo", "Майонез", { kcal: 680, protein: 1, fat: 75, carbs: 2.6 }, "other", {
    basePrice: 230,
  }),
  mustardDijon: tracked(
    "mustardDijon",
    "Гірчиця діжонська",
    { kcal: 150, protein: 7.7, fat: 8.4, carbs: 8.4 },
    "other",
    // текст майже завжди каже просто "гірчиця", а не "діжонська".
    // "гірчичний" (маринади) не ловиться відкиданням закінчень від "гірчиця" —
    // чергування ц→ч — тому окремий корінь.
    { searchTerm: "гірчиця гірчичн" },
  ),
  adjika: tracked("adjika", "Аджика", { kcal: 65, protein: 1.5, fat: 3, carbs: 8 }, "other", {
    basePrice: 250,
  }),
  porkChop: tracked(
    "porkChop",
    "Свиняча відбивна",
    { kcal: 180, protein: 21, fat: 9, carbs: 0 },
    "meat",
    { cookedMultiplier: 0.7 },
  ),
  porkTenderloin: tracked(
    "porkTenderloin",
    "Свиняча вирізка",
    { kcal: 109, protein: 21, fat: 2.2, carbs: 0 },
    "meat",
    { cookedMultiplier: 0.75, basePrice: 350 },
  ),
  cream: tracked("cream", "Вершки", { kcal: 118, protein: 2.8, fat: 10, carbs: 3.8 }, "dairy", {
    basePrice: 195,
  }),
  ketchup: tracked("ketchup", "Кетчуп", { kcal: 112, protein: 1.2, fat: 0.2, carbs: 27 }, "other"),

  // Готується під час міл-препу з уже врахованих tracked-продуктів — не купується окремо.
  syrniki: {
    ...prepared(
      "syrniki",
      "Сирники (заготовка)",
      { kcal: 200, protein: 12, fat: 8, carbs: 20 },
      "dairy",
    ),
    gramsPerPiece: 67,
  },
  // Здобна булочка (тісто на молоці/дріжджах + сирна скоринка), випікається й заморожується
  // партією на весь 14-денний цикл — курячу начинку до неї рахуємо окремо tracked-продуктами
  // (chickenMarinated/onion/pickledCucumber/adjika), бо вона додається свіжою при зборці,
  // не запікається в тісто.
  kipBroodje: {
    ...prepared(
      "kipBroodje",
      "Булочка (заготовка)",
      { kcal: 322, protein: 10, fat: 8, carbs: 51 },
      "grains",
    ),
    gramsPerPiece: 50,
  },
  // Курячо-яєчний маффін з капустою (заготовка) — печеться раз на весь Сет3 (12 шт
  // одразу, 6/день на 2 людей × 2 дні сету), зберігається в холодильнику (не в
  // морозилці — тримати всього 2 дні, заморозка не потрібна). Макроси прораховані
  // напряму з tracked-продуктів рецепту (eggs/chickenMarinated/cabbage/onion/milk):
  // на весь батч ~1439 ккал/158г білка/74г жиру/40г вугл. ÷ 12 = макроси нижче.
  // Докладніше — docs/recipes/chicken-egg-cabbage-muffins.md.
  chickenCabbageMuffin: {
    ...prepared(
      "chickenCabbageMuffin",
      "Курячо-яєчний маффін з капустою (заготовка)",
      { kcal: 120, protein: 13.1, fat: 6.2, carbs: 3.4 },
      "other",
    ),
    gramsPerPiece: 100,
  },
  // Buffalo Chicken Pocket (заготовка) — печеться партією (10 шт) під час великого
  // 14-денного мілпрепу, заморожується, розігрівається в мікрохвильовці з вологим
  // рушником + опційно кілька хвилин на пательні/аерогрилі для скоринки (Сет5,
  // сніданок). "Буффало-соус" з оригінального рецепту замінено на дешевий домашній
  // мікс — кетчуп + аджика (2:1) + часниковий порошок — замість імпортного
  // Frank's/Tabasco Buffalo (недоступно/дорого). Макроси прораховані напряму з
  // tracked-продуктів (борошно+йогурт для тіста; сира курка+цибуля+помідор+соус-мікс+
  // моцарела для начинки): весь батч (тісто+начинка) ~4747 ккал/422г білка/109г
  // жиру/485г вугл на 10 покетів (~250г готового покета кожен) — макроси нижче на
  // 100г. Докладніше — docs/recipes/buffalo-chicken-hot-pockets.md.
  buffaloChickenPocket: {
    ...prepared(
      "buffaloChickenPocket",
      "Buffalo Chicken Pocket (заготовка)",
      { kcal: 190, protein: 17, fat: 4.4, carbs: 19 },
      "other",
    ),
    gramsPerPiece: 250,
  },
  // Білковий буффало-дип до покетів — творог + соус-мікс (кетчуп+аджика) + молоко,
  // збивається блендером. Готується разом з покетами в тому ж блоці мілпрепу.
  buffaloDip: {
    ...prepared(
      "buffaloDip",
      "Білковий буффало-дип (заготовка)",
      { kcal: 131, protein: 11.7, fat: 6.1, carbs: 7.6 },
      "other",
    ),
  },

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
  fishSeasoning: pantry("fishSeasoning", "Приправа до риби"),
  coriander: pantry("coriander", "Коріандр"),
  koreanCarrotSeasoning: pantry("koreanCarrotSeasoning", "Приправа для моркви по-корейськи", {
    basePrice: 28,
  }),
  nutmeg: pantry("nutmeg", "Мускатний горіх"),
  salt: pantry("salt", "Сіль"),
  blackPepper: pantry("blackPepper", "Чорний перець"),
  lemon: pantry("lemon", "Лимон", { basePrice: 200 }),
  garlic: pantry("garlic", "Часник"),
  // корінь "паста" замінено на "томат" — так ловиться і "томатна", і "томатний" (маринади).
  tomatoPaste: pantry("tomatoPaste", "Томатна паста", { searchTerm: "томат" }),
  flour: pantry("flour", "Борошно"),
  yeast: pantry("yeast", "Дріжджі", { searchTerm: "дріждж" }),
  // Дефолтний корінь "цукор" збігається зі звичайним sugar — беремо прикметник,
  // інакше цей запис глушить sugar у спільній мапі коренів (highlight-products.tsx).
  vanillaSugar: pantry("vanillaSugar", "Ванільний цукор", { searchTerm: "ванільн" }),
  dillParsley: pantry("dillParsley", "Кріп/петрушка"),
  greenOnion: pantry(
    "greenOnion",
    "Зелена цибуля",
    // Дефолтний корінь дав би "цибуля", що збігається зі звичайною цибулею — беремо "зелена".
    { searchTerm: "зелена" },
  ),
  basil: pantry("basil", "Базилік"),
  appleVinegar: pantry("appleVinegar", "Яблучний оцет"),
  cumin: pantry("cumin", "Кмин"),
  lime: pantry("lime", "Лайм"),
};

export type ProductKey = keyof typeof PRODUCTS;

export function getProductName(key: string): string {
  return PRODUCTS[key]?.nameUk ?? key;
}
