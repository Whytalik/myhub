export interface GoalCard {
  who: string;
  label: string;
  kcal: number;
  macros: {
    p: number;
    f: number;
    c: number;
    fiber: number;
  };
  tags: string[];
}

export interface Ingredient {
  name: string;
  kbzv?: string;
  you: string;
  her: string;
  isPrep?: boolean;
  isCook?: boolean;
  dishId?: string;
}

export interface DishIngredient {
  name: string;
  amount?: string;
}

export interface Dish {
  id: string;
  name: string;
  emoji: string;
  ingredients: DishIngredient[];
  method?: string;
}

export interface MealSlot {
  type: string;
  ingredients: Ingredient[];
  kcalYou: number;
  kcalHer: number;
  isLocked?: boolean;
}

export interface DayPlan {
  day: string;
  meals: MealSlot[];
}

export const VISUAL_PLAN_GOALS: GoalCard[] = [
  {
    who: "Ви",
    label: "Схуднення 90 → 75 кг",
    kcal: 1700,
    macros: { p: 185, f: 58, c: 110, fiber: 38 },
    tags: ["2× зал", "1.5г ходьба", "Суворий дефіцит", "Білки — пріоритет"],
  },
  {
    who: "Дівчина",
    label: "Набір 52 → 60 кг",
    kcal: 2300,
    macros: { p: 80, f: 67, c: 345, fiber: 25 },
    tags: ["3.5 км пішки", "Біг", "Профіцит", "Баланс нутрієнтів"],
  },
];

export const VISUAL_PLAN_SCHEDULE: DayPlan[] = [
  {
    day: "Пн",
    meals: [
      {
        type: "⚡ Передтрен. 6:00",
        isLocked: true,
        kcalYou: 120,
        kcalHer: 222,
        ingredients: [
          { name: "Яблуко", you: "½ шт", her: "½ шт" },
          { name: "Рисові хлібці", kbzv: "380–400 · 7–8 · 2–3 · 80–82", you: "1 шт", her: "2 шт" },
          { name: "Мед", kbzv: "304–328 · 0.3–0.8 · 0 · 75–82", you: "1 ч.л.", her: "2 ч.л." },
          { name: "Теплий чай", kbzv: "0–2 · 0 · 0 · 0–0.5", you: "1 чашка", her: "1 чашка" },
        ],
      },
      {
        type: "🍳 Сніданок 8:30",
        isLocked: true,
        kcalYou: 425,
        kcalHer: 670,
        ingredients: [
          { name: "Перець болгарський", you: "150г", her: "100г", isPrep: true },
          { name: "Яйця (С1)", kbzv: "155–160 · 12–13 · 10–11 · 0.7–1.1", you: "1 шт", her: "3 шт" },
          { name: "Білки яєчні", kbzv: "44–52 · 10–11 · 0 · 0.7–1", you: "160г", her: "—" },
          { name: "Куряче філе", kbzv: "110–165 · 23–31 · 1–3 · 0", you: "130г", her: "80г", isCook: true },
          { name: "Насіння льону мелені", you: "1 ст.л.", her: "1 ст.л." },
          { name: "Олія соняшникова (смаження)", you: "1 ч.л.", her: "1 ч.л." },
          { name: "🧂 Соєво-часниковий", you: "—", her: "—" },
        ],
      },
      {
        type: "🥣 Обід — Боул",
        kcalYou: 573,
        kcalHer: 945,
        ingredients: [
          { name: "Гречаний боул з куркою", dishId: "bowl-chicken-buckwheat", you: "1 пор.", her: "1 пор." },
          { name: "Морква тертa (сира)", you: "80г", her: "—" },
        ],
      },
      {
        type: "🍫 Перекус",
        kcalYou: 160,
        kcalHer: 209,
        ingredients: [
          { name: "Кава", you: "1 чашка", her: "—" },
          { name: "Чай", you: "—", her: "1 чашка" },
          { name: "Яблуко", you: "½ шт", her: "—" },
          { name: "Чорний шоколад", you: "20г", her: "—" },
          { name: "Арахісова паста", you: "—", her: "20г" },
          { name: "Банан стиглий", you: "—", her: "1 шт" },
        ],
      },
      {
        type: "🌙 Вечеря",
        kcalYou: 450,
        kcalHer: 305,
        ingredients: [
          { name: "Тунець нісуаз", dishId: "tuna-nicoise", you: "1 пор.", her: "—" },
          { name: "Рисовий боул з грецьким салатом", dishId: "bowl-rice-greek", you: "—", her: "1 пор." },
        ],
      },
    ],
  },
  {
    day: "Вт",
    meals: [
      {
        type: "⚡ Передтрен. 6:00",
        kcalYou: 110,
        kcalHer: 200,
        ingredients: [
          { name: "Банан стиглий", you: "1 шт", her: "1 шт" },
          { name: "Теплий чай", you: "1 скл.", her: "1 скл." },
        ],
      },
      {
        type: "📦 Сніданок 8:30",
        kcalYou: 215,
        kcalHer: 435,
        ingredients: [
          { name: "Йогурт грецький", you: "250г", her: "250г" },
          { name: "Ягоди (полуниця / чорниця / малина)", you: "80г", her: "80г" },
        ],
      },
      {
        type: "🍝 Обід — Болоньєзе",
        kcalYou: 605,
        kcalHer: 845,
        ingredients: [
          { name: "Паста болоньєзе", dishId: "pasta-bolognese", you: "1 пор.", her: "1 пор." },
          { name: "Свіжий салат", dishId: "salad-fresh", you: "1 пор.", her: "1 пор." },
        ],
      },
      {
        type: "🍫 Перекус",
        kcalYou: 175,
        kcalHer: 120,
        ingredients: [
          { name: "Кава", you: "1 чашка", her: "—" },
          { name: "Чай", you: "—", her: "1 чашка" },
          { name: "Чорний шоколад", you: "30г", her: "—" },
          { name: "Арахісова паста", you: "—", her: "20г" },
        ],
      },
      {
        type: "🔄 Вечеря — Ротація",
        kcalYou: 420,
        kcalHer: 470,
        ingredients: [
          { name: "Тижд. 1 — Курячий бургер", dishId: "chicken-burger", you: "1 пор.", her: "1 пор." },
          { name: "Тижд. 2 — Яловичий бургер", dishId: "beef-burger", you: "1 пор.", her: "1 пор." },
          { name: "Тижд. 3 — Кебаб-шаурма", dishId: "kebab-shawarma", you: "1 пор.", her: "1 пор." },
        ],
      },
    ],
  },
  {
    day: "Ср",
    meals: [
      {
        type: "⚡ Передтрен. 6:00",
        kcalYou: 110,
        kcalHer: 220,
        ingredients: [
            { name: "Солона соломка", you: "30г", her: "60г" },
            { name: "Теплий чай", you: "1 чашка", her: "1 чашка" },
        ]
      },
      {
        type: "📦 Сніданок 8:30",
        kcalYou: 260,
        kcalHer: 490,
        ingredients: [
          { name: "Тунець (банка)", you: "½ б.", her: "½ б." },
          { name: "Хліб цільнозерн.", you: "1 скиб.", her: "2 скиб." },
          { name: "Яйце (варене)", you: "1 шт", her: "2 шт" },
          { name: "Цибуля зелена", you: "10г", her: "15г" },
          { name: "Йогурт грецький", you: "1 ст.л.", her: "1 ст.л." },
        ],
      },
      {
        type: "🥗 Обід — Суп",
        kcalYou: 560,
        kcalHer: 935,
        ingredients: [
          { name: "Суп сочевичний", dishId: "soup-lentil", you: "1 тарілка", her: "1 тарілка" },
        ],
      },
      {
        type: "🍫 Перекус",
        kcalYou: 175,
        kcalHer: 120,
        ingredients: [
          { name: "Кава", you: "1 чашка", her: "—" },
          { name: "Чай", you: "—", her: "1 чашка" },
          { name: "Чорний шоколад", you: "30г", her: "—" },
          { name: "Арахісова паста", you: "—", her: "20г" },
        ],
      },
      {
        type: "🌙 Вечеря — Рагу",
        kcalYou: 325,
        kcalHer: 405,
        ingredients: [
          { name: "Рагу з куркою", dishId: "stew-chicken", you: "1 пор.", her: "1 пор." },
        ],
      },
    ],
  },
  {
    day: "Чт",
    meals: [
        {
            type: "⚡ Передтрен. 6:00",
            kcalYou: 135,
            kcalHer: 270,
            ingredients: [
              { name: "Батон", you: "1 скиб.", her: "2 скиб." },
              { name: "Мед", you: "1 ч.л.", her: "2 ч.л." },
              { name: "Теплий чай", you: "1 чашка", her: "1 чашка" },
            ],
        },
        {
            type: "🌾 Сніданок — Гречаники",
            kcalYou: 310,
            kcalHer: 380,
            ingredients: [
              { name: "Гречаники", dishId: "hrechaniky", you: "3–4 шт", her: "4–5 шт" },
            ],
        },
        {
            type: "🥗 Обід",
            kcalYou: 405,
            kcalHer: 675,
            ingredients: [
              { name: "Картопля печена", you: "200г", her: "400г", isPrep: true },
              { name: "Хек або тилапія (філе)", you: "150г", her: "100г", isCook: true },
              { name: "🧂 Лимонно-трав'яний", you: "—", her: "—" },
              { name: "Морква по-корейськи", dishId: "salad-korean-carrot", you: "1 пор.", her: "1 пор." },
            ],
        },
        {
            type: "🍫 Перекус",
            kcalYou: 175,
            kcalHer: 120,
            ingredients: [
              { name: "Кава", you: "1 чашка", her: "—" },
              { name: "Чай", you: "—", her: "1 чашка" },
              { name: "Чорний шоколад", you: "30г", her: "—" },
              { name: "Арахісова паста", you: "—", her: "20г" },
            ],
        },
        {
            type: "🌙 Вечеря",
            kcalYou: 190,
            kcalHer: 485,
            ingredients: [
              { name: "Сир кисломолочний", you: "200г", her: "200г" },
              { name: "Ягоди (полуниця / чорниця / малина)", you: "80г", her: "100г" },
            ],
        }
    ]
  },
  {
    day: "Пт",
    meals: [
        {
            type: "⚡ Передтрен. 6:00",
            kcalYou: 125,
            kcalHer: 220,
            ingredients: [
              { name: "Рисові хлібці", you: "2 шт", her: "3 шт" },
              { name: "Мед", you: "1 ч.л.", her: "2 ч.л." },
              { name: "Теплий чай", you: "1 чашка", her: "1 чашка" },
            ],
        },
        {
            type: "🍳 Сніданок 8:30",
            kcalYou: 370,
            kcalHer: 620,
            ingredients: [
              { name: "Помідори", you: "200г", her: "150г", isPrep: true },
              { name: "Яйця (С1)", you: "1 шт", her: "3 шт" },
              { name: "Білки яєчні", you: "120г", her: "—" },
              { name: "Куряче філе", you: "100г", her: "80г", isCook: true },
              { name: "🧂 Соєво-часниковий", you: "—", her: "—" },
            ],
        },
        {
            type: "🥣 Обід — Боул",
            kcalYou: 555,
            kcalHer: 945,
            ingredients: [
              { name: "Рисовий боул з куркою", dishId: "bowl-chicken-rice", you: "1 пор.", her: "1 пор." },
            ],
        },
        {
            type: "🍫 Перекус",
            kcalYou: 175,
            kcalHer: 120,
            ingredients: [
              { name: "Кава", you: "1 чашка", her: "—" },
              { name: "Чай", you: "—", her: "1 чашка" },
              { name: "Чорний шоколад", you: "30г", her: "—" },
              { name: "Арахісова паста", you: "—", her: "20г" },
            ],
        },
        {
            type: "🌙 Вечеря",
            kcalYou: 297,
            kcalHer: 352,
            ingredients: [
              { name: "Курка", you: "150г", her: "100г", isCook: true },
              { name: "🧂 Гірчично-медовий", you: "—", her: "—" },
              { name: "Грецький салат", dishId: "salad-greek", you: "1 пор.", her: "1 пор." },
            ],
        }
    ]
  },
  {
    day: "Сб",
    meals: [
        {
            type: "⚡ Передтрен. 6:00",
            kcalYou: 110,
            kcalHer: 200,
            ingredients: [
              { name: "Банан стиглий", you: "1 шт", her: "1 шт" },
              { name: "Теплий чай", you: "1 скл.", her: "1 скл." },
            ],
        },
        {
            type: "📦 Сніданок 8:30",
            kcalYou: 300,
            kcalHer: 525,
            ingredients: [
              { name: "Йогурт грецький", you: "250г", her: "250г" },
              { name: "Ягоди (полуниця / чорниця / малина)", you: "80г", her: "80г" },
            ],
        },
        {
            type: "🍝 Обід — Болоньєзе",
            kcalYou: 605,
            kcalHer: 845,
            ingredients: [
              { name: "Паста болоньєзе", dishId: "pasta-bolognese", you: "1 пор.", her: "1 пор." },
              { name: "Свіжий салат", dishId: "salad-fresh", you: "1 пор.", her: "1 пор." },
            ],
        },
        {
            type: "🍫 Перекус",
            kcalYou: 175,
            kcalHer: 120,
            ingredients: [
              { name: "Кава", you: "1 чашка", her: "—" },
              { name: "Чай", you: "—", her: "1 чашка" },
              { name: "Чорний шоколад", you: "30г", her: "—" },
              { name: "Арахісова паста", you: "—", her: "20г" },
            ],
        },
        {
            type: "🔄 Вечеря — Ротація",
            kcalYou: 420,
            kcalHer: 470,
            ingredients: [
              { name: "Тижд. 1 — Курячий бургер", dishId: "chicken-burger", you: "1 пор.", her: "1 пор." },
              { name: "Тижд. 2 — Яловичий бургер", dishId: "beef-burger", you: "1 пор.", her: "1 пор." },
              { name: "Тижд. 3 — Кебаб-шаурма", dishId: "kebab-shawarma", you: "1 пор.", her: "1 пор." },
            ],
        }
    ]
  },
  {
    day: "Нд",
    meals: [
        {
            type: "⚡ Передтрен. 6:00",
            kcalYou: 110,
            kcalHer: 220,
            ingredients: [
              { name: "Солона соломка", you: "30г", her: "60г" },
              { name: "Теплий чай", you: "1 чашка", her: "1 чашка" },
            ],
        },
        {
            type: "📦 Сніданок 8:30",
            kcalYou: 260,
            kcalHer: 490,
            ingredients: [
              { name: "Тунець (банка)", you: "½ б.", her: "½ б." },
              { name: "Хліб цільнозерн.", you: "1 скиб.", her: "2 скиб." },
              { name: "Яйце (варене)", you: "1 шт", her: "2 шт" },
              { name: "Цибуля зелена", you: "10г", her: "15г" },
              { name: "Йогурт грецький", you: "1 ст.л.", her: "1 ст.л." },
            ],
        },
        {
            type: "🥗 Обід — Суп",
            kcalYou: 560,
            kcalHer: 935,
            ingredients: [
              { name: "Суп сочевичний", dishId: "soup-lentil", you: "1 тарілка", her: "1 тарілка" },
            ],
        },
        {
            type: "🍫 Перекус",
            kcalYou: 175,
            kcalHer: 120,
            ingredients: [
              { name: "Кава", you: "1 чашка", her: "—" },
              { name: "Чай", you: "—", her: "1 чашка" },
              { name: "Чорний шоколад", you: "30г", her: "—" },
              { name: "Арахісова паста", you: "—", her: "20г" },
            ],
        },
        {
            type: "🌙 Вечеря — Рагу",
            kcalYou: 325,
            kcalHer: 405,
            ingredients: [
              { name: "Рагу з куркою", dishId: "stew-chicken", you: "1 пор.", her: "1 пор." },
            ],
        }
    ]
  }
];

export const VISUAL_PLAN_PREP = [
  { icon: "🍗", name: "Куряче філе", detail: "2.5 кг → нарізати, розкласти → 🧊 морозилка", use: "↳ Маринади: Соєво-часниковий / Лимонно-трав'яний / Гірчично-медовий / Пряний томатний" },
  { icon: "🥩", name: "Яловичина", detail: "1 кг → порції на Вт/Сб → 🧊 морозилка", use: "↳ Маринади: Пряний томатний (обід) / Гірчично-медовий (вечеря)" },
  { icon: "🐟", name: "Хек або тилапія (філе)", detail: "500г → порція на Чт → 🧊 морозилка", use: "↳ Маринад: Лимонно-трав'яний" },
  { icon: "🥗", name: "Овочі", detail: "2кг мікс: 800г помідорів чері, 600г огірок, 300г перець болгарський, 300г зелень (петрушка, кріп) · 3 дні в контейнері", use: "↳ Пн–Ср — сніданки/вечері" },
];

export const VISUAL_PLAN_SAUCES = [
  { name: "Лимонно-часниковий", comp: "сік 1/2 лимона + 2 зубці часнику + 1 ч.л. олії", tip: "Класика. Підсилює будь-який білок." },
  { name: "Тахіні-лимонний", comp: "1 ч.л. тахіні + сік 1/4 лимона + 1 ст.л. води", tip: "Ближньосхідний. Кремовий, ситний (+45 ккал)." },
  { name: "Чімічурі", comp: "петрушка + часник + олія + оцет + чилі", tip: "Аргентинський. Яскравий трав''яний." },
  { name: "Цацікі", comp: "3 ст.л. йогурту + 1/2 огірка + 1 зубець часнику + кріп", tip: "Грецький. Освіжає, топ до м''яса." },
];

export const VISUAL_PLAN_DISHES: Dish[] = [
  {
    id: "salad-greek",
    name: "Грецький салат",
    emoji: "🫒",
    ingredients: [
      { name: "Помідори чері", amount: "100г (Я) / 150г (Вона)" },
      { name: "Огірок", amount: "80г / 100г" },
      { name: "Маслини", amount: "4 / 6 шт" },
      { name: "Фета (Я: 15г, Вона: 25г)", amount: "— дефіцит, менше жиру" },
      { name: "Цибуля червона", amount: "20г / 25г" },
      { name: "Олія оливкова (Я: ½ ч.л.)", amount: "½ / 1 ч.л." },
      { name: "Орегано, сіль", amount: "за смаком" },
    ],
    method: "Нарізати помідори і огірок крупно, тонко нарізати цибулю, маслини цілком. Фету покришити зверху. Полити олією, посипати орегано і сіллю — НЕ перемішувати.",
  },
  {
    id: "salad-korean-carrot",
    name: "Морква по-корейськи",
    emoji: "🥕",
    ingredients: [
      { name: "Морква", amount: "100г (Я) / 150г (Вона)" },
      { name: "Часник", amount: "1 / 2 зубці" },
      { name: "Олія соняшникова (Я: ½ ч.л.)", amount: "½ / 1 ч.л." },
      { name: "Оцет 9%", amount: "1 ч.л." },
      { name: "Паприка мелена", amount: "¼ ч.л." },
      { name: "Чілі (за бажанням)", amount: "щіпка" },
      { name: "Сіль, цукор", amount: "за смаком" },
    ],
    method: "Натерти моркву соломкою. Роздавити часник, додати спеції та оцет. Розігріти олію до шипіння і залити моркву — перемішати. Настоятися 30+ хв (краще з вечора).",
  },
  {
    id: "salad-fresh",
    name: "Свіжий салат",
    emoji: "🥒",
    ingredients: [
      { name: "Помідори", amount: "150г (Я) / 200г (Вона)" },
      { name: "Огірок", amount: "150г / 200г" },
      { name: "Зелень (петрушка, кріп)", amount: "за смаком" },
      { name: "Олія ½ ч.л.", amount: "тільки для Я" },
      { name: "Лимонний сік або оцет", amount: "½ ч.л." },
      { name: "Сіль", amount: "за смаком" },
    ],
    method: "Нарізати кубиками або скибочками. Посолити, 5 хв постояти — злити сік. Заправити олією та лимонним соком. Подавати одразу.",
  },
  {
    id: "bowl-chicken-buckwheat",
    name: "Гречаний боул з куркою",
    emoji: "🥣",
    ingredients: [
      { name: "Куряче філе (маринад: лимонно-трав'яний)", amount: "200г (Я) / 100г (Вона)" },
      { name: "Гречка варена (prep)", amount: "150г (Я) / 250г (Вона)" },
      { name: "Грецький салат", amount: "1 пор." },
      { name: "Соус: олія ½ ч.л. + сік ¼ лимона + сіль", amount: "полити зверху" },
    ],
    method: "Викласти гречку в основу миски. Нарізати смужками обсмажену курку, покласти зверху. Збоку — грецький салат. Полити лимонно-оливковим соусом перед подачею.",
  },
  {
    id: "bowl-chicken-rice",
    name: "Рисовий боул з куркою",
    emoji: "🥣",
    ingredients: [
      { name: "Куряче філе (маринад: лимонно-трав'яний)", amount: "150г (Я) / 100г (Вона)" },
      { name: "Рис варений (prep)", amount: "100г (Я) / 250г (Вона)" },
      { name: "Грецький салат", amount: "1 пор." },
      { name: "Соус: олія ½ ч.л. + сік ¼ лимона + сіль", amount: "полити зверху" },
    ],
    method: "Викласти рис в основу миски. Нарізати смужками обсмажену курку, покласти зверху. Збоку — грецький салат. Полити лимонно-оливковим соусом перед подачею.",
  },
  {
    id: "chicken-burger",
    name: "Курячий бургер",
    emoji: "🍗",
    ingredients: [
      { name: "Куряче філе (відбити ~1.5 см)", amount: "150г (Я) / 100г (Вона)" },
      { name: "Булочка бургерна", amount: "1 шт" },
      { name: "Борошно", amount: "2 ст.л." },
      { name: "Яйце", amount: "1 шт" },
      { name: "Панірувальні сухарі", amount: "3 ст.л." },
      { name: "Паприка, часниковий порошок, сіль", amount: "за смаком" },
      { name: "Айсберг, цибуля", amount: "за смаком" },
      { name: "Він — соус: майо+йогурт+гірчиця + сир плавлений", amount: "1 ст.л. соусу / 1 скиб. сиру" },
      { name: "Вона (McChicken) — кисло-солодкий соус: абрикосовий джем + соєвий соус + оцет", amount: "1 ст.л." },
    ],
    method: "Філе відбити до рівної товщини. Обваляти: борошно → яйце → сухарі зі спеціями. Аерогриль 190°C 18 хв (перевернути раз) або духовка 220°C 20 хв. Зібрати бургер: булочка → соус → філе → айсберг → цибуля → соус зверху.",
  },
  {
    id: "beef-burger",
    name: "Яловичий бургер (Чізбургер / Біг Мак)",
    emoji: "🍔",
    ingredients: [
      { name: "Фарш яловичий 80/20", amount: "150г Я (2 патті) / 100г Вона (1 патті)" },
      { name: "Булочка сесамова", amount: "1 шт" },
      { name: "Сир чедер або плавлений", amount: "1 скибочка" },
      { name: "Листя салату, помідор, цибуля", amount: "за смаком" },
      { name: "Мариновані огірки", amount: "2–3 шт" },
      { name: "Big Mac sauce: 2 ст.л. майо + 1 ч.л. кетчупу + 1 ч.л. гірчиці + огірки дрібно + цибулевий порошок", amount: "~2 ст.л." },
      { name: "Сіль, чорний перець", amount: "за смаком" },
    ],
    method: "Сформувати тонкі кульки фаршу. Розпалити суху пательню до максимуму. Покласти кульку, притиснути лопаткою (smash) — тримати 10 сек. Смажити 2–3 хв, перевернути, покласти сир — ще 1 хв. Зібрати: булочка → соус → патті → огірки → цибуля → салат → соус → верхня булочка.",
  },
  {
    id: "kebab-shawarma",
    name: "Кебаб-шаурма (I Love Kebab style)",
    emoji: "🌯",
    ingredients: [
      { name: "Куряче філе (смужки)", amount: "150г (Я) / 100г (Вона)" },
      { name: "Лаваш тонкий", amount: "1 шт" },
      { name: "Помідори чері", amount: "100г" },
      { name: "Айсберг", amount: "2–3 листи" },
      { name: "Цибуля", amount: "½ шт" },
      { name: "Соус базовий: йогурт грецький + часник + кріп", amount: "3 ст.л." },
      { name: "Фрі кебаб: + картопля фрі", amount: "80г (Я) / 120г (Вона)" },
      { name: "B&W (для неї): + сир твердий + печериці смажені", amount: "20г сиру / 50г печериць" },
    ],
    method: "Нарізати філе смужками, обсмажити на пательні з паприкою і часниковим порошком 5–7 хв. Змішати соус. Лаваш прогріти. Викласти м'ясо + овочі + соус, щільно загорнути. Припекти шов на сухій пательні 1–2 хв.",
  },
  {
    id: "pasta-bolognese",
    name: "Паста болоньєзе",
    emoji: "🍝",
    ingredients: [
      { name: "Фарш яловичий", amount: "150г (Я) / 100г (Вона)" },
      { name: "Макарони тв.сорт (prep)", amount: "150г (Я) / 300г (Вона)" },
      { name: "Томатна паста", amount: "2 ст.л." },
      { name: "Цибуля", amount: "½ шт" },
      { name: "Морква", amount: "½ шт" },
      { name: "Часник", amount: "2 зубці" },
      { name: "Паприка, чілі, орегано, сіль", amount: "за смаком" },
    ],
    method: "Дрібно нарізати цибулю і моркву, обсмажити 5 хв. Додати фарш — розбити лопаткою, смажити 7–8 хв. Додати часник, томатну пасту, ½ склянки води і спеції. Тушкувати під кришкою 10 хв. Змішати з відвареними макаронами або полити соусом зверху.",
  },
  {
    id: "soup-lentil",
    name: "Суп сочевичний",
    emoji: "🍲",
    ingredients: [
      { name: "Сочевиця", amount: "50г / 80г" },
      { name: "Картопля", amount: "100г" },
      { name: "Морква", amount: "50г" },
      { name: "Куряче філе", amount: "100г / 50г" },
      { name: "Цибуля", amount: "½ шт" },
      { name: "Сіль, перець, лавровий лист", amount: "за смаком" },
    ],
    method: "Відварити курку (20 хв), дістати та нарізати. Додати сочевицю, картоплю кубиками, моркву, цибулю. Варити ще 20 хв.",
  },
  {
    id: "stew-chicken",
    name: "Рагу з куркою",
    emoji: "🍛",
    ingredients: [
      { name: "Куряче філе (маринад: пряний томатний)", amount: "150г / 100г" },
      { name: "Кабачок", amount: "120г / 60г" },
      { name: "Перець болгарський", amount: "100г / 60г" },
      { name: "Морква", amount: "80г / 30г" },
      { name: "Квасоля варена", amount: "50г / 100г" },
      { name: "Томатна паста", amount: "1 ст.л." },
      { name: "Часник", amount: "2 зубці" },
    ],
    method: "Замаринувати курку 30+ хв. Обсмажити на сковорідці 5 хв. Додати овочі та квасолю, тушкувати під кришкою 15–20 хв.",
  },
  {
    id: "tuna-nicoise",
    name: "Тунець нісуаз",
    emoji: "🐟",
    ingredients: [
      { name: "Тунець (конс., у воді)", amount: "150г" },
      { name: "Яйця варені", amount: "2 шт" },
      { name: "Морква сира (соломкою)", amount: "80г" },
      { name: "Огірок (скибочками)", amount: "100г" },
      { name: "Хліб цільнозерн.", amount: "1 скибочка" },
      { name: "Гірчиця", amount: "½ ч.л." },
      { name: "Лимонний сік", amount: "1 ч.л." },
      { name: "Сіль, чорний перець", amount: "за смаком" },
    ],
    method: "Нарізати яйця чвертями, моркву та огірок — соломкою або скибочками. Розкласти на тарілці: хліб збоку, зверху — тунець, яйця та овочі. Змішати гірчицю з лимонним соком — полити перед подачею.",
  },
  {
    id: "bowl-rice-greek",
    name: "Рисовий боул з грецьким салатом",
    emoji: "🥙",
    ingredients: [
      { name: "Рис варений (prep)", amount: "80г" },
      { name: "Помідори чері", amount: "100г" },
      { name: "Огірок", amount: "80г" },
      { name: "Маслини", amount: "4 шт" },
      { name: "Фета", amount: "25г" },
      { name: "Цибуля червона", amount: "20г" },
      { name: "Олія оливкова", amount: "1 ч.л." },
      { name: "Яблуко", amount: "½ шт" },
      { name: "Орегано, сіль", amount: "за смаком" },
    ],
    method: "Рис викласти в основу миски. Поряд — грецький салат (чері, огірок, маслини, цибуля, фета, олія, орегано). Яблуко — скибочками збоку або на десерт після.",
  },
  {
    id: "hrechaniky",
    name: "Гречаники",
    emoji: "🌾",
    ingredients: [
      { name: "Гречка варена (prep)", amount: "200г / 250г" },
      { name: "Яйце ціле", amount: "1 шт" },
      { name: "Цибуля", amount: "½ шт" },
      { name: "Панірувальні сухарі", amount: "2 ст.л." },
      { name: "Олія соняшникова", amount: "1 ст.л." },
    ],
    method: "Цибулю дрібно нарізати. Змішати гречку, яйце, цибулю — посолити. Сформувати 3–4 котлетки, обваляти в сухарях. Смажити на олії 3–4 хв з кожного боку до рум'яної скоринки.",
  },
];

export interface DayCriterion {
  id: string;
  label: string;
  description: string;
  thresholdYou: string;
  thresholdHer: string;
  priority: "critical" | "important" | "nice";
}

export const DAY_CRITERIA: DayCriterion[] = [
  {
    id: "calories",
    label: "Калорії",
    description: "Сума прийомів у межах цілі",
    thresholdYou: "1700 ±50 ккал",
    thresholdHer: "2300 ±75 ккал",
    priority: "critical",
  },
  {
    id: "protein",
    label: "Білок",
    description: "Мінімальне споживання для збереження м'язів (IOM: ≥1.6г/кг)",
    thresholdYou: "≥175г",
    thresholdHer: "≥75г",
    priority: "critical",
  },
  {
    id: "fat",
    label: "Жири",
    description: "AMDR: 20–35% від добових ккал",
    thresholdYou: "45–65г",
    thresholdHer: "55–80г",
    priority: "important",
  },
  {
    id: "fiber",
    label: "Клітковина",
    description: "IOM добова норма для травлення та насичення",
    thresholdYou: "≥30г (ціль 38г)",
    thresholdHer: "≥20г (ціль 25г)",
    priority: "important",
  },
  {
    id: "prep",
    label: "Prep-ready",
    description: "Частка прийомів, готових зранку або з вечора",
    thresholdYou: "≥75% прийомів",
    thresholdHer: "≥75% прийомів",
    priority: "important",
  },
  {
    id: "variety",
    label: "Різноманітність білка",
    description: "Не повторювати одне джерело більше двох разів на день",
    thresholdYou: "≤2 прийоми з одним білком",
    thresholdHer: "≤2 прийоми з одним білком",
    priority: "nice",
  },
  {
    id: "carb-timing",
    label: "Вуглеводи до 15:00",
    description: "Основна маса вуглеводів зранку та в обід для енергії",
    thresholdYou: "≥60% до 15:00",
    thresholdHer: "≥50% до 15:00",
    priority: "nice",
  },
  {
    id: "fiber-per-meal",
    label: "Клітковина в прийомах",
    description: "Сніданок, обід, перекус і вечеря мають містити клітковину. Передтрен — виняток: там потрібні швидкі вуглеводи без клітковини",
    thresholdYou: "≥2г у 4 прийомах (не рахуючи передтрен)",
    thresholdHer: "≥2г у 4 прийомах (не рахуючи передтрен)",
    priority: "important",
  },
];

export const VISUAL_PLAN_SHOPPING = [
    { category: "🥩 М''ясо / Риба", items: [
        { name: "Куряче філе", qty: "2.5 кг", price: 450 },
        { name: "Яловичина", qty: "1.5 кг", price: 420 },
        { name: "Тунець (185г)", qty: "3 банки", price: 150 },
    ]},
    { category: "🥦 Овочі / Фрукти", items: [
        { name: "Помідори", qty: "2.5 кг", price: 450 },
        { name: "Банани", qty: "3 кг", price: 220 },
        { name: "Картопля", qty: "4 кг", price: 80 },
        { name: "Авокадо", qty: "4 шт", price: 160 },
    ]},
    { category: "🫙 Бакалія / Солодке", items: [
        { name: "Чорний шоколад 85%", qty: "2 шт", price: 100 },
        { name: "Арахісова паста", qty: "1 банка", price: 140 },
        { name: "Борошно (ЦЗ + Вищий гат.)", qty: "2 кг", price: 60 },
        { name: "Лаваш тонкий", qty: "1 уп.", price: 35 },
    ]}
];
