import { DayPlan, ShoppingCategory, Profile } from "./types";
import { set1 } from "./sets/set1";
import { set2 } from "./sets/set2";
import { set3 } from "./sets/set3";
import { set4 } from "./sets/set4";
import { set5 } from "./sets/set5";
import { set6 } from "./sets/set6";
import { set7 } from "./sets/set7";

export const PROFILES: Profile[] = [
  {
    id: "vitalii",
    name: "Віталій",
    goal: "Схуднення (дефіцит)",
    kcal: 1700,
    macros: { protein: 145, fat: 55, carbs: 155 },
  },
  {
    id: "olesia",
    name: "Олеся",
    goal: "Набір ваги 53 → 60 кг",
    kcal: 1950,
    macros: { protein: 100, fat: 65, carbs: 240 },
  },
];

export const SUMMER_SET_PLAN: DayPlan[] = [set1, set2, set3, set4, set5, set6, set7];

export const SHOPPING_LIST: ShoppingCategory[] = [
  {
    id: "meat",
    title: "М'ясо та риба",
    items: [
      {
        id: "meat-0",
        food: "chickenMarinated",
        computedQty: {
          food: "chickenMarinated",
          sets: [
            { set: "set1" },
            { set: "set4" },
            { set: "set5" },
            { set: "set6" },
            { set: "set2" },
            { set: "set7" },
          ],
          wastePercent: 5,
        },
        note: "Сет1 428г + Сет4 430г + Сет5+Сет6 886г + Сет2/Сет6 начинка для булочок + Сет7 кальцоне (+5% відходи)",
        price: 600,
        buyDay: "sun",
      },
      {
        id: "meat-1",
        food: "chickenHearts",
        computedQty: { food: "chickenHearts", sets: [{ set: "set2" }], wastePercent: 15 },
        note: "Сет2 (збільшено замість протеїну, +15% відходи при очищенні)",
        price: 86,
        buyDay: "sun",
      },
      {
        id: "meat-2",
        food: "porkTenderloin",
        computedQty: { food: "porkTenderloin", sets: [{ set: "set7" }], wastePercent: 5 },
        note: "Сет 7 (свиняча вирізка кубиками, +5% відходи)",
        price: 220,
        buyDay: "sun",
      },
      {
        id: "meat-3",
        food: "mackerel",
        // свіжа, не заморожена — готується й заморожується сама в мілпрепі Нд;
        // якщо купити вже заморожену, вийде другий цикл заморозки сирої риби.
        qualifier: "свіжа",
        qty: "1 шт (~800 г)",
        note: "Сет3 — готується в мілпрепі. Потрібно ~390 г філе, що відповідає одній рибині ~800 г",
        price: 150,
        buyDay: "sun",
      },
      {
        id: "meat-shrimp",
        food: "shrimp",
        computedQty: { food: "shrimp", sets: [{ set: "set6" }], wastePercent: 40 },
        note: "Сет 6 (креветки для тосканської пасти, вага з урахуванням 40% відходів/глазурі)",
        price: 400,
        buyDay: "wed",
      },
    ],
  },
  {
    id: "canned",
    title: "Консерви",
    items: [
      {
        id: "canned-0",
        food: "tunaCanned",
        qualifier: "у власному соку",
        qty: "3 банки (по 180 г)",
        note: "Сет3, день 2 — сет тепер на 2 дні, тунця більше",
        price: 300,
        buyDay: "sun",
      },
      {
        id: "canned-1",
        food: "cornCanned",
        computedQty: { food: "cornCanned", sets: [{ set: "set3" }, { set: "set7" }] },
        note: "Сет3 + Сет7",
        price: 90,
        buyDay: "sun",
      },
      {
        id: "canned-corn-wed",
        food: "cornCanned",
        computedQty: { food: "cornCanned", sets: [{ set: "set4" }] },
        note: "Сет 4 (для кукурудзяного салату)",
        price: 45,
        buyDay: "wed",
      },
      {
        id: "canned-2",
        food: "tomatoPaste",
        qty: "20 г",
        note: "Сет2",
        price: 5,
        buyDay: "sun",
      },
    ],
  },
  {
    id: "dairy",
    title: "Яйця та молочні продукти",
    items: [
      {
        id: "dairy-0-sun",
        food: "eggs",
        // +120г (2 яйця) — сирники (1 яйце) і тісто для булочок (1 яйце) у мілпрепі
        // використовують яйце як інгредієнт рецепту, яке ніколи не стає власним
        // macroItem (обидва зважуються одним ключем — "syrniki"/"kipBroodje").
        // Сет3 теж тут — з'їдається в сеті3 (день 2, тунець), отже купується заздалегідь у неділю.
        // Сет7 більше не тут — сніданок замінено на курячий кальцоне (без яєць).
        computedQty: {
          food: "eggs",
          sets: [{ set: "set1" }, { set: "set3" }],
          grams: 120,
          unit: "piece",
        },
        note: "Сет1 + Сет3 день2 (тунець, збільшено замість протеїну) + 2 яйця для сирників і тіста булочок",
        price: 55,
        buyDay: "sun",
      },
      {
        id: "dairy-0-wed",
        food: "eggs",
        computedQty: { food: "eggs", sets: [{ set: "set4" }, { set: "set5" }], unit: "piece" },
        note: "Сет4 + Сет5",
        price: 55,
        buyDay: "wed",
      },
      {
        id: "dairy-1-sun",
        food: "yogurtGreek",
        computedQty: {
          food: "yogurtGreek",
          sets: [{ set: "set7" }, { set: "set1" }, { set: "set2" }, { set: "set3" }],
        },
        note: "Сет7 + Сет1 + Сет2 + Сет3 (збільшено замість протеїну; Сет3 тепер на 2 дні)",
        price: 300,
        buyDay: "sun",
      },
      {
        id: "dairy-1-wed",
        food: "yogurtGreek",
        computedQty: { food: "yogurtGreek", sets: [{ set: "set4" }, { set: "set5" }] },
        note: "Сет4 322г + Сет5 385г (збільшено замість протеїну)",
        price: 92,
        buyDay: "wed",
      },
      {
        id: "dairy-2-sun",
        food: "cottageCheese",
        qualifier: "5–9%",
        computedQty: { food: "cottageCheese", sets: [], grams: 500 },
        note: "Нд (для сирників)",
        price: 90,
        buyDay: "sun",
      },
      {
        id: "dairy-2-wed",
        food: "cottageCheese",
        qualifier: "5–9%",
        computedQty: {
          food: "cottageCheese",
          sets: [{ set: "set3" }, { set: "set7" }, { set: "set5" }],
        },
        note: "Сет3 + Сет7 + Сет5",
        price: 175,
        buyDay: "wed",
      },
      {
        id: "dairy-3",
        food: "milk",
        qty: "1 л",
        note: "Сет1 120мл + 270мл тісто для булочок (Сет2+Сет6)",
        price: 46,
        buyDay: "sun",
      },
      {
        id: "dairy-5",
        food: "butter",
        computedQty: {
          food: "butter",
          sets: [{ set: "set3" }, { set: "set4" }, { set: "set5" }],
        },
        note: "Сет3 15г + Сет4 10г + Сет5 15г (картопляне пюре/запікання)",
        price: 43,
        buyDay: "sun",
      },
      {
        id: "dairy-6",
        food: "mozzarella",
        computedQty: { food: "mozzarella", sets: [{ set: "set1" }, { set: "set3" }] },
        note: "Сет1 60г + Сет3 40г",
        price: 46,
        buyDay: "sun",
      },

      {
        id: "dairy-cream-wed",
        food: "cream",
        qualifier: "10%",
        computedQty: { food: "cream", sets: [{ set: "set6" }], unit: "ml" },
        note: "Сет 6 (вершки для пасти)",
        price: 35,
        buyDay: "wed",
      },
      {
        id: "dairy-8",
        food: "hardCheese",
        // +40г — скоринка булочок (Сет2+Сет6) використовує сир як інгредієнт рецепту,
        // який не стає власним macroItem (булочка зважується одним ключем "kipBroodje").
        computedQty: {
          food: "hardCheese",
          sets: [
            { set: "set1" },
            { set: "set2" },
            { set: "set6" },
            { set: "set7" },
            { set: "set4" },
          ],
          grams: 40,
        },
        note: "Сет1 + Сет2 + Сет6 + Сет7 + Сет4 + 40г скоринка булочок",
        price: 215,
        buyDay: "sun",
      },
    ],
  },
  {
    id: "grains",
    title: "Крупи, борошно та хліб",
    items: [
      {
        id: "grains-1",
        food: "buckwheat",
        computedQty: { food: "buckwheat", sets: [{ set: "set2" }] },
        note: "Сет2",
        price: 17,
        buyDay: "sun",
      },
      {
        id: "grains-2",
        food: "rice",
        computedQty: { food: "rice", sets: [{ set: "set4" }, { set: "set7" }] },
        note: "Сет4 + Сет7",
        price: 19,
        buyDay: "sun",
      },
      {
        id: "grains-breadcrumbs",
        food: "breadcrumbs",
        computedQty: { food: "breadcrumbs", sets: [{ set: "set5" }] },
        note: "Сет 5 (для панірування курки)",
        price: 35,
        buyDay: "wed",
      },
      {
        id: "grains-pasta-wed",
        food: "pasta",
        computedQty: { food: "pasta", sets: [{ set: "set6" }] },
        note: "Сет 6 (макарони для тосканської пасти)",
        price: 45,
        buyDay: "wed",
      },
      {
        id: "grains-3",
        food: "flour",
        qty: "650 г",
        note: "Нд (150г сирники + 500г тісто для булочок)",
        price: 20,
        buyDay: "sun",
      },
      {
        id: "grains-yeast",
        food: "yeast",
        qty: "7 г (1 пакетик)",
        note: "Тісто для булочок (Сет2+Сет6)",
        price: 15,
        buyDay: "sun",
      },
      {
        id: "grains-4-sun",
        food: "bread",
        computedQty: {
          food: "bread",
          sets: [{ set: "set7" }, { set: "set1" }, { set: "set3" }],
        },
        note: "Сет7 + Сет1 + Сет3 (тепер на 2 дні, хліба більше)",
        price: 60,
        buyDay: "sun",
      },
      {
        id: "grains-4-wed",
        food: "bread",
        computedQty: { food: "bread", sets: [{ set: "set4" }, { set: "set5" }, { set: "set6" }] },
        note: "Сет4 + Сет5 + Сет6",
        price: 27,
        buyDay: "wed",
      },
      {
        id: "grains-5",
        food: "vanillaSugar",
        qty: "1 пакетик",
        note: "Нд",
        price: 8,
        buyDay: "sun",
      },
      {
        id: "grains-6",
        food: "sugar",
        qty: "50 г",
        note: "Нд 3 ст.л. + Пт 1 ст.л.",
        price: 2,
        buyDay: "sun",
      },
    ],
  },
  {
    id: "vegetables",
    title: "Овочі",
    items: [
      {
        id: "vegetables-potato",
        food: "potato",
        computedQty: { food: "potato", sets: [{ set: "set1" }, { set: "set3" }, { set: "set5" }] },
        note: "Сет1 + Сет3 + Сет5 (Сет5 збільшено до нормальної порції гарніру на 2 прийоми; Сет3 тепер на 2 дні, картоплі значно більше)",
        price: 120,
        buyDay: "sun",
      },
      {
        id: "vegetables-0-sun",
        food: "tomato",
        computedQty: {
          food: "tomato",
          sets: [{ set: "set1" }, { set: "set2" }, { set: "set3" }, { set: "set7" }],
        },
        note: "Сет1 + Сет2 + Сет3 + Сет7",
        price: 209,
        buyDay: "sun",
      },
      {
        id: "vegetables-0-wed",
        food: "tomato",
        computedQty: { food: "tomato", sets: [{ set: "set4" }, { set: "set5" }, { set: "set6" }] },
        note: "Сет4 + Сет5 + Сет6",
        price: 86,
        buyDay: "wed",
      },
      {
        id: "vegetables-1-sun",
        food: "cucumber",
        computedQty: {
          food: "cucumber",
          sets: [{ set: "set1" }, { set: "set3" }],
        },
        note: "Сет1 + Сет3",
        price: 46,
        buyDay: "sun",
      },
      {
        id: "vegetables-1-wed",
        food: "cucumber",
        computedQty: { food: "cucumber", sets: [{ set: "set4" }, { set: "set5" }], grams: 50 },
        note: "Сет4 + Сет5",
        price: 6,
        buyDay: "wed",
      },
      {
        id: "vegetables-2-sun",
        food: "pepper",
        computedQty: { food: "pepper", sets: [{ set: "set1" }] },
        note: "Сет1",
        price: 12,
        buyDay: "sun",
      },
      {
        id: "vegetables-pepper-wed",
        food: "pepper",
        computedQty: { food: "pepper", sets: [{ set: "set4" }] },
        note: "Сет 4 (болгарський перець для салату)",
        price: 15,
        buyDay: "wed",
      },
      {
        id: "vegetables-3",
        food: "onion",
        qualifier: "червона",
        qty: "~225 г",
        note: "Сет1 + начинка булочок (Сет2+Сет6, свіжа, не заморожується)",
        price: 6,
        buyDay: "sun",
      },

      {
        id: "vegetables-6",
        food: "garlic",
        qty: "~80 г",
        note: "Сет7 + Сет5 + Сет6",
        price: 16,
        buyDay: "sun",
      },
      {
        id: "vegetables-7",
        food: "arugula",
        computedQty: { food: "arugula", sets: [{ set: "set2" }] },
        note: "Сет2",
        price: 45,
        buyDay: "sun",
      },
      {
        id: "vegetables-8",
        food: "icebergLettuce",
        computedQty: { food: "icebergLettuce", sets: [{ set: "set6" }, { set: "set2" }] },
        note: "Сет6 (булочки 40г) + Сет2 (булочки 40г)",
        price: 60,
        buyDay: "wed",
      },
      {
        id: "vegetables-9",
        food: "lemon",
        qty: "3 шт (~360 г)",
        note: "Сет7 + Сет3 + Сет6",
        price: 54,
        buyDay: "sun",
      },
      {
        id: "vegetables-broccoli-sun",
        food: "broccoli",
        computedQty: { food: "broccoli", sets: [{ set: "set1" }, { set: "set3" }] },
        note: "Сет1 300г + Сет3 150г",
        price: 28,
        buyDay: "sun",
      },
      {
        id: "vegetables-broccoli-wed",
        food: "broccoli",
        computedQty: { food: "broccoli", sets: [{ set: "set5" }] },
        note: "Сет5 150г",
        price: 28,
        buyDay: "wed",
      },
      {
        id: "vegetables-cauliflower",
        food: "cauliflower",
        computedQty: { food: "cauliflower", sets: [{ set: "set3" }] },
        note: "Сет3 150г",
        price: 45,
        buyDay: "sun",
      },
      {
        id: "vegetables-spinach",
        food: "spinachFrozen",
        computedQty: {
          food: "spinachFrozen",
          sets: [{ set: "set1" }, { set: "set4" }, { set: "set5" }, { set: "set6" }],
        },
        note: "Сет1 + Сет4 + Сет5 + Сет6",
        price: 65,
        buyDay: "sun",
      },
      {
        id: "vegetables-cabbage-wed",
        food: "cabbage",
        computedQty: { food: "cabbage", sets: [{ set: "set5" }] },
        note: "Сет 5 (капуста для салату)",
        price: 15,
        buyDay: "wed",
      },
      {
        id: "vegetables-pickled-cucumber",
        food: "pickledCucumber",
        computedQty: { food: "pickledCucumber", sets: [{ set: "set2" }, { set: "set6" }] },
        note: "Начинка булочок (Сет2+Сет6, свіжий, не заморожується)",
        price: 20,
        buyDay: "sun",
      },
    ],
  },
  {
    id: "fruits",
    title: "Фрукти та ягоди",
    items: [
      {
        id: "fruits-0",
        food: "berries",
        // Перекуси-ротація: пудинг (Сет1/4) і сирники (Сет6) на ягодах; мус (Сет2/5)
        // на какао, кульки (Сет3/7) на арахісовій пасті — жоден з цих трьох ягід не бере.
        computedQty: {
          food: "berries",
          sets: [{ set: "set1" }, { set: "set4" }, { set: "set6" }],
        },
        note: "Сет1, Сет4 (протеїновий пудинг) + Сет6 (сирники)",
        options: ["полуниця", "малина", "чорниця", "змішані заморожені"],
        price: 243,
        buyDay: "sun",
      },
      {
        id: "fruits-2-sun",
        food: "banana",
        computedQty: {
          food: "banana",
          sets: [{ set: "set1" }, { set: "set2" }, { set: "set3" }],
          unit: "piece",
        },
        note: "Сет1–Сет2–Сет3 (Сет3 тепер на 2 дні)",
        price: 70,
        buyDay: "sun",
      },
      {
        id: "fruits-apple-sun",
        food: "apple",
        computedQty: {
          food: "apple",
          sets: [{ set: "set1" }, { set: "set2" }, { set: "set3" }, { set: "set7" }],
        },
        note: "Сет1, Сет2, Сет3, Сет7 (десерт до прийомів)",
        price: 45,
        buyDay: "sun",
      },
      {
        id: "fruits-apple-wed",
        food: "apple",
        computedQty: {
          food: "apple",
          sets: [{ set: "set4" }, { set: "set5" }, { set: "set6" }],
        },
        note: "Сет4, Сет5, Сет6 (десерт до прийомів)",
        price: 45,
        buyDay: "wed",
      },
      {
        id: "fruits-lime-sun",
        food: "lime",
        qty: "2 шт",
        note: "Сет7 (лайм для боулів та соусу)",
        price: 30,
        buyDay: "sun",
      },
    ],
  },
  {
    id: "greens",
    title: "Зелень",
    items: [
      {
        id: "greens-0-sun",
        food: "dillParsley",
        qty: "1 пучок",
        note: "Сет1",
        price: 22,
        buyDay: "sun",
      },
      {
        id: "greens-0-wed",
        food: "dillParsley",
        qty: "1 пучок",
        note: "Сет3",
        price: 23,
        buyDay: "wed",
      },
      {
        id: "greens-1",
        food: "greenOnion",
        qty: "1 пучок",
        note: "Сет3",
        price: 22,
        buyDay: "wed",
      },
      {
        id: "greens-2",
        food: "basil",
        qualifier: "свіжий",
        qty: "1 пучок",
        note: "Сет4",
        price: 30,
        buyDay: "wed",
      },
    ],
  },
  {
    id: "oils",
    title: "Олії та оцет",
    items: [
      {
        id: "oils-0",
        food: "oil",
        qualifier: "оливкова",
        qty: "185 мл",
        note: "Сет1 + Сет2 + Сет4 + Сет5 + Сет6 + Сет7",
        price: 65,
        buyDay: "sun",
      },
      {
        id: "oils-1",
        food: "oil",
        qualifier: "рослинна",
        qty: "150 мл",
        note: "Сет1 + Сет2 + Сет4 + Сет5 + Сет6 + Сет7 + 50мл тісто/начинка для булочок",
        price: 15,
        buyDay: "sun",
      },
      {
        id: "oils-2",
        food: "appleVinegar",
        qualifier: "9%",
        qty: "50 мл",
        note: "Сет1 + Сет2 + Сет4 + Сет5 + Сет7",
        price: 4,
        buyDay: "sun",
      },
    ],
  },
  {
    id: "sauces",
    title: "Соуси та приправи",
    items: [
      {
        id: "sauces-0",
        food: "soySauce",
        qty: "200 мл",
        note: "Нд (для маринування на Сет2 і Сет4)",
        price: 32,
        buyDay: "sun",
      },
      {
        id: "sauces-1",
        food: "honey",
        // +15г — тісто для булочок (Сет2+Сет6) використовує мед як інгредієнт рецепту,
        // який не стає власним macroItem (булочка зважується одним ключем "kipBroodje").
        computedQty: {
          food: "honey",
          sets: [
            { set: "set1" },
            { set: "set2" },
            { set: "set3" },
            { set: "set4" },
            { set: "set5" },
            { set: "set6" },
            { set: "set7" },
          ],
          grams: 15,
        },
        note: "Щодня (усі сети) + 15г тісто для булочок",
        price: 42,
        buyDay: "sun",
      },
      {
        id: "sauces-2",
        food: "mustardDijon",
        qty: "80 г",
        note: "Нд (для маринування) + Сет1 + Сет6",
        price: 24,
        buyDay: "sun",
      },
      {
        id: "sauces-3",
        food: "mayo",
        qty: "190 г",
        note: "Сет6 + Сет3 день2 (тунець, заправка замість самого лише лимонного соку) + Сет7",
        price: 30,
        buyDay: "sun",
      },
      {
        id: "sauces-4",
        food: "adjika",
        computedQty: { food: "adjika", sets: [{ set: "set2" }, { set: "set6" }] },
        note: "Начинка булочок (Сет2+Сет6) — заміна самбалу з оригінального рецепту",
        price: 45,
        buyDay: "sun",
      },
    ],
  },
  {
    id: "spices",
    title: "Спеції та трави",
    items: [
      {
        id: "spices-0",
        food: "rosemary",
        qualifier: "сушений",
        qty: "1 упаковка",
        note: "Нд",
        price: 25,
        buyDay: "sun",
      },
      {
        id: "spices-1",
        food: "thyme",
        qualifier: "сушений",
        qty: "1 упаковка",
        note: "Нд",
        price: 25,
        buyDay: "sun",
      },
      {
        id: "spices-2",
        food: "paprika",
        qty: "1 упаковка",
        note: "Нд + Сет5",
        price: 22,
        buyDay: "sun",
      },
      {
        id: "spices-3",
        food: "provencalHerbs",
        qty: "1 упаковка",
        note: "Нд",
        price: 28,
        buyDay: "sun",
      },
      {
        id: "spices-4",
        food: "oregano",
        qty: "1 упаковка",
        note: "Сет1 + Нд",
        price: 24,
        buyDay: "sun",
      },
      {
        id: "spices-4b",
        food: "fishSeasoning",
        qty: "1 упаковка",
        note: "Нд — скумбрія",
        price: 25,
        buyDay: "sun",
      },
      {
        id: "spices-5",
        food: "koreanCarrotSeasoning",
        qty: "1 упаковка",
        note: "Пт — корейська морква",
        price: 28,
        buyDay: "sun",
      },
      {
        id: "spices-6",
        food: "nutmeg",
        qty: "1 упаковка",
        note: "Нд",
        price: 30,
        buyDay: "sun",
      },
      {
        id: "spices-7",
        food: "salt",
        qty: "1 упаковка",
        note: "Щодня",
        price: 15,
        buyDay: "sun",
      },
      {
        id: "spices-8",
        food: "blackPepper",
        qualifier: "мелений",
        qty: "1 упаковка",
        note: "Щодня",
        price: 25,
        buyDay: "sun",
      },
    ],
  },
];

// 1. Зимовий план (WINTER_SET_PLAN): Заміна свіжих томатів/огірків на капусту/солоні огірки
export const WINTER_SET_PLAN: DayPlan[] = JSON.parse(JSON.stringify(SUMMER_SET_PLAN));

const monLunchW = WINTER_SET_PLAN[0].meals.find((m) => m.type === "lunch");
if (monLunchW && monLunchW.macroItems) {
  monLunchW.ingredients[6] =
    "Для салату: капуста 500 г, морква 100 г, олія 6 г (Олеся), яблучний оцет, зелень";
  monLunchW.macroItems = monLunchW.macroItems.filter(
    (item) =>
      item.food !== "tomato" &&
      item.food !== "cucumber" &&
      item.food !== "pepper" &&
      item.food !== "mozzarella",
  );
  monLunchW.macroItems.push(
    { food: "cabbage", vitalii: 250, olesia: 250, component: "Салат з капусти" },
    { food: "carrot", vitalii: 50, olesia: 50, component: "Салат з капусти" },
  );
}

const tueLunchW = WINTER_SET_PLAN[1].meals.find((m) => m.type === "lunch");
if (tueLunchW && tueLunchW.macroItems) {
  tueLunchW.ingredients[2] =
    "Для салату: капуста 300 г, олія (Віталій 2 г, Олеся 16 г), яблучний оцет";
  tueLunchW.macroItems = tueLunchW.macroItems.filter(
    (item) => item.food !== "tomato" && item.food !== "arugula" && item.food !== "hardCheese",
  );
  tueLunchW.macroItems.push({
    food: "cabbage",
    vitalii: 150,
    olesia: 150,
    component: "Салат з капусти",
  });
}

const wedLunchW = WINTER_SET_PLAN[2].meals.find((m) => m.type === "lunch");
if (wedLunchW && wedLunchW.macroItems) {
  wedLunchW.ingredients[4] =
    "Для салату: капуста 300 г, солоні огірки 150 г, зелена цибуля, лимонний сік";
  wedLunchW.macroItems = wedLunchW.macroItems.filter(
    (item) => item.food !== "tomato" && item.food !== "cucumber",
  );
  wedLunchW.macroItems.push(
    { food: "cabbage", vitalii: 150, olesia: 150, component: "Зимовий салат" },
    { food: "pickledCucumber", vitalii: 75, olesia: 75, component: "Зимовий салат" },
  );
}

const friLunchW = WINTER_SET_PLAN[4].meals.find((m) => m.type === "lunch");
if (friLunchW && friLunchW.macroItems) {
  friLunchW.ingredients[3] = "Для салату: капуста 300 г, олія 6 г (Олеся)";
  friLunchW.macroItems = friLunchW.macroItems.filter(
    (item) => item.food !== "tomato" && item.food !== "cucumber",
  );
  friLunchW.macroItems.push({
    food: "cabbage",
    vitalii: 150,
    olesia: 150,
    component: "Салат з капусти",
  });
}

const sunLunchW = WINTER_SET_PLAN[6].meals.find((m) => m.type === "lunch");
if (sunLunchW && sunLunchW.macroItems) {
  sunLunchW.ingredients[6] = "Для салату: капуста 500 г, морква 100 г, олія 6 г (Олеся), зелень";
  sunLunchW.macroItems = sunLunchW.macroItems.filter(
    (item) =>
      item.food !== "tomato" &&
      item.food !== "cucumber" &&
      item.food !== "pepper" &&
      item.food !== "mozzarella",
  );
  sunLunchW.macroItems.push(
    { food: "cabbage", vitalii: 250, olesia: 250, component: "Салат з капусти" },
    { food: "carrot", vitalii: 50, olesia: 50, component: "Салат з капусти" },
  );
}

// 2. Осінній план (AUTUMN_SET_PLAN): Переважають буряк, морква, капуста, яблука
export const AUTUMN_SET_PLAN: DayPlan[] = JSON.parse(JSON.stringify(SUMMER_SET_PLAN));

const monLunchA = AUTUMN_SET_PLAN[0].meals.find((m) => m.type === "lunch");
if (monLunchA && monLunchA.macroItems) {
  monLunchA.ingredients[6] = "Для салату: варений буряк 500 г, чорнослив, олія 6 г (Олеся), часник";
  monLunchA.macroItems = monLunchA.macroItems.filter(
    (item) =>
      item.food !== "tomato" &&
      item.food !== "cucumber" &&
      item.food !== "pepper" &&
      item.food !== "mozzarella",
  );
  monLunchA.macroItems.push({
    food: "beetroot",
    vitalii: 250,
    olesia: 250,
    component: "Буряковий салат",
  });
}

const wedLunchA = AUTUMN_SET_PLAN[2].meals.find((m) => m.type === "lunch");
if (wedLunchA && wedLunchA.macroItems) {
  wedLunchA.ingredients[4] = "Для салату: капуста 300 г, яблуко 150 г, зелень, лимонний сік";
  wedLunchA.macroItems = wedLunchA.macroItems.filter(
    (item) => item.food !== "tomato" && item.food !== "cucumber",
  );
  wedLunchA.macroItems.push(
    { food: "cabbage", vitalii: 150, olesia: 150, component: "Капустяний салат з яблуком" },
    { food: "apple", vitalii: 75, olesia: 75, component: "Капустяний салат з яблуком" },
  );
}

const sunLunchA = AUTUMN_SET_PLAN[6].meals.find((m) => m.type === "lunch");
if (sunLunchA && sunLunchA.macroItems) {
  sunLunchA.ingredients[6] =
    "Для салату: варений буряк 500 г, олія 6 г (Олеся), солоний огірок 100 г";
  sunLunchA.macroItems = sunLunchA.macroItems.filter(
    (item) =>
      item.food !== "tomato" &&
      item.food !== "cucumber" &&
      item.food !== "pepper" &&
      item.food !== "mozzarella",
  );
  sunLunchA.macroItems.push(
    { food: "beetroot", vitalii: 250, olesia: 250, component: "Буряковий салат" },
    { food: "pickledCucumber", vitalii: 50, olesia: 50, component: "Буряковий салат" },
  );
}

// 3. Весняний план (SPRING_SET_PLAN): Переважають редиска, зелена цибуля, огірки
export const SPRING_SET_PLAN: DayPlan[] = JSON.parse(JSON.stringify(SUMMER_SET_PLAN));

const monBreakfastS = SPRING_SET_PLAN[0].meals.find((m) => m.type === "breakfast");
if (monBreakfastS && monBreakfastS.macroItems) {
  monBreakfastS.ingredients[2] = "Редиска та огірки — 150 г (по 75 г кожному)";
  monBreakfastS.macroItems = monBreakfastS.macroItems.map((item) => {
    if (item.food === "tomato") return { ...item, food: "radish" };
    return item;
  });
}

const monLunchS = SPRING_SET_PLAN[0].meals.find((m) => m.type === "lunch");
if (monLunchS && monLunchS.macroItems) {
  monLunchS.ingredients[6] =
    "Для салату: капуста молода 350 г, редиска 150 г, огірок 100 г, олія 6 г (Олеся)";
  monLunchS.macroItems = monLunchS.macroItems.filter(
    (item) => item.food !== "tomato" && item.food !== "pepper" && item.food !== "mozzarella",
  );
  monLunchS.macroItems.push(
    { food: "cabbage", vitalii: 175, olesia: 175, component: "Весняний салат" },
    { food: "radish", vitalii: 75, olesia: 75, component: "Весняний салат" },
  );
}

const sunLunchS = SPRING_SET_PLAN[6].meals.find((m) => m.type === "lunch");
if (sunLunchS && sunLunchS.macroItems) {
  sunLunchS.ingredients[6] =
    "Для салату: капуста молода 350 г, редиска 150 г, огірок 100 г, олія 6 г (Олеся)";
  sunLunchS.macroItems = sunLunchS.macroItems.filter(
    (item) => item.food !== "tomato" && item.food !== "pepper" && item.food !== "mozzarella",
  );
  sunLunchS.macroItems.push(
    { food: "cabbage", vitalii: 175, olesia: 175, component: "Весняний салат" },
    { food: "radish", vitalii: 75, olesia: 75, component: "Весняний салат" },
  );
}

export const DEFAULT_SET_PLAN = WINTER_SET_PLAN;
export const SET_PLAN = DEFAULT_SET_PLAN;
