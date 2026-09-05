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

// Нотатки нижче навмисно мінімальні: для товарів з `computedQty` це чиста косметика
// (розподіл по закупівлях іде з масиву `sets`), тому їх прибрано повністю. Для товарів
// з "плоским" `qty` (без `computedQty`) нотатка з "Сет N" — вхідні дані для
// `parseNoteTrips` у ShoppingList.tsx (визначає, на яку із 4 закупівель winести товар),
// тому там лишено мінімальний перелік сетів без пояснень. "Щодня" — теж зчитуваний
// код (показує товар на всіх 4 закупівлях), чіпати не можна.
export const SHOPPING_LIST: ShoppingCategory[] = [
  {
    id: "meat",
    title: "М'ясо та риба",
    items: [
      {
        id: "meat-0",
        food: "chickenMarinated",
        // +300г — сире філе для курячо-яєчних маффінів (Сет3), яке в macroItems
        // ховається за одним комбінованим ключем "chickenCabbageMuffin" і тому
        // ніколи не підсумовується через `sets` нижче.
        computedQty: {
          food: "chickenMarinated",
          sets: [
            { set: "set1" },
            { set: "set4" },
            { set: "set5" },
            { set: "set6" },
            { set: "set2" },
          ],
          grams: 300,
          wastePercent: 5,
        },
        price: 700,
        buyDay: "sun",
      },
      {
        id: "meat-1",
        food: "chickenHearts",
        computedQty: { food: "chickenHearts", sets: [{ set: "set2" }], wastePercent: 15 },
        price: 86,
        buyDay: "sun",
      },
      {
        id: "meat-2",
        food: "porkTenderloin",
        computedQty: { food: "porkTenderloin", sets: [{ set: "set7" }], wastePercent: 5 },
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
        price: 240,
        buyDay: "sun",
      },
      {
        id: "meat-4",
        food: "chickenRollDobrov",
        computedQty: {
          food: "chickenRollDobrov",
          sets: [
            { set: "set1" },
            { set: "set2" },
            { set: "set3" },
            { set: "set4" },
            { set: "set5" },
            { set: "set6" },
            { set: "set7" },
          ],
        },
        price: 130,
        buyDay: "sun",
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
        note: "Сет3, день 2",
        price: 255,
        buyDay: "sun",
      },
      {
        id: "canned-1",
        food: "cornCanned",
        computedQty: { food: "cornCanned", sets: [{ set: "set3" }, { set: "set7" }] },
        price: 90,
        buyDay: "sun",
      },
      {
        id: "canned-corn-wed",
        food: "cornCanned",
        computedQty: { food: "cornCanned", sets: [{ set: "set4" }] },
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
        // +60г (1 яйце) — сирники у мілпрепі використовують яйце як інгредієнт рецепту,
        // яке ніколи не стає власним macroItem (зважується ключем "syrniki").
        // +480г (8 яєць) — курячо-яєчні маффіни (Сет3), той самий випадок: яйця
        // ховаються за комбінованим ключем "chickenCabbageMuffin", не підсумовуються.
        computedQty: {
          food: "eggs",
          sets: [{ set: "set1" }, { set: "set3" }, { set: "set7" }],
          grams: 540,
          unit: "piece",
        },
        price: 55,
        buyDay: "sun",
      },
      {
        id: "dairy-0-wed",
        food: "eggs",
        computedQty: { food: "eggs", sets: [{ set: "set4" }, { set: "set5" }], unit: "piece" },
        price: 55,
        buyDay: "wed",
      },
      {
        id: "dairy-1-sun",
        food: "yogurtGreek",
        computedQty: {
          food: "yogurtGreek",
          sets: [{ set: "set7" }, { set: "set1" }],
        },
        price: 300,
        buyDay: "sun",
      },
      {
        id: "dairy-1-wed",
        food: "yogurtGreek",
        computedQty: { food: "yogurtGreek", sets: [{ set: "set4" }, { set: "set5" }] },
        price: 92,
        buyDay: "wed",
      },
      {
        id: "dairy-2-sun",
        food: "cottageCheese",
        qualifier: "5–9%",
        computedQty: { food: "cottageCheese", sets: [], grams: 500 },
        price: 90,
        buyDay: "sun",
      },
      {
        id: "dairy-2-wed",
        food: "cottageCheese",
        qualifier: "5–9%",
        computedQty: {
          food: "cottageCheese",
          sets: [{ set: "set2" }, { set: "set5" }],
        },
        price: 175,
        buyDay: "wed",
      },
      {
        id: "dairy-yogurt-sweetened-sun",
        food: "yogurtSweetened",
        computedQty: {
          food: "yogurtSweetened",
          sets: [{ set: "set1" }, { set: "set3" }],
        },
        price: 78,
        buyDay: "sun",
      },
      {
        id: "dairy-yogurt-sweetened-wed",
        food: "yogurtSweetened",
        computedQty: {
          food: "yogurtSweetened",
          sets: [{ set: "set5" }],
        },
        price: 78,
        buyDay: "wed",
      },
      {
        id: "dairy-3",
        food: "milk",
        qty: "1 л",
        note: "Сет2 + Сет3 + Сет5",
        price: 32,
        buyDay: "sun",
      },
      {
        id: "dairy-5",
        food: "butter",
        computedQty: {
          food: "butter",
          sets: [{ set: "set3" }],
        },
        price: 43,
        buyDay: "sun",
      },
      {
        id: "dairy-6",
        food: "mozzarella",
        computedQty: { food: "mozzarella", sets: [{ set: "set1" }, { set: "set3" }] },
        price: 46,
        buyDay: "sun",
      },
      {
        id: "dairy-cream-wed",
        food: "cream",
        qualifier: "10%",
        computedQty: { food: "cream", sets: [{ set: "set6" }], unit: "ml" },
        price: 35,
        buyDay: "wed",
      },
      {
        id: "dairy-8",
        food: "hardCheese",
        computedQty: {
          food: "hardCheese",
          sets: [
            { set: "set1" },
            { set: "set2" },
            { set: "set3" },
            { set: "set4" },
            { set: "set5" },
            { set: "set6" },
            { set: "set7" },
          ],
        },
        price: 215,
        buyDay: "sun",
      },
      {
        id: "dairy-9",
        food: "proteinPowder",
        computedQty: {
          food: "proteinPowder",
          sets: [{ set: "set1" }, { set: "set3" }, { set: "set4" }, { set: "set7" }],
        },
        price: 350,
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
        price: 17,
        buyDay: "sun",
      },
      {
        id: "grains-2",
        food: "rice",
        computedQty: { food: "rice", sets: [{ set: "set4" }, { set: "set7" }] },
        price: 19,
        buyDay: "sun",
      },
      {
        id: "grains-breadcrumbs",
        food: "breadcrumbs",
        computedQty: { food: "breadcrumbs", sets: [{ set: "set5" }] },
        price: 35,
        buyDay: "wed",
      },
      {
        id: "grains-pasta-wed",
        food: "pasta",
        computedQty: { food: "pasta", sets: [{ set: "set6" }] },
        price: 45,
        buyDay: "wed",
      },
      {
        id: "grains-3",
        food: "flour",
        qty: "200 г",
        price: 25,
        buyDay: "sun",
      },
      {
        id: "grains-flour-wed",
        food: "flour",
        qty: "25 г",
        note: "Сет5",
        price: 5,
        buyDay: "wed",
      },
      {
        id: "dairy-cottage-lowfat-wed",
        food: "cottageCheeseLowFat",
        qty: "150 г",
        note: "Сет5",
        price: 65,
        buyDay: "wed",
      },
      {
        id: "grains-4-sun",
        food: "bread",
        computedQty: {
          food: "bread",
          sets: [{ set: "set7" }, { set: "set1" }, { set: "set3" }, { set: "set2" }],
        },
        price: 60,
        buyDay: "sun",
      },
      {
        id: "grains-4-wed",
        food: "bread",
        computedQty: { food: "bread", sets: [{ set: "set4" }, { set: "set5" }, { set: "set6" }] },
        price: 45,
        buyDay: "wed",
      },
      {
        id: "grains-5",
        food: "vanillaSugar",
        qty: "1 пакетик",
        price: 7,
        buyDay: "sun",
      },
      {
        id: "grains-6",
        food: "sugar",
        qty: "50 г",
        price: 2,
        buyDay: "sun",
      },
      {
        id: "grains-tortilla",
        food: "tortilla",
        computedQty: { food: "tortilla", sets: [{ set: "set2" }, { set: "set6" }] },
        price: 35,
        buyDay: "sun",
      },
      {
        id: "grains-7",
        food: "cocoa",
        computedQty: { food: "cocoa", sets: [{ set: "set2" }, { set: "set5" }] },
        price: 45,
        buyDay: "sun",
      },
      {
        id: "grains-8",
        food: "oats",
        computedQty: { food: "oats", sets: [{ set: "set3" }, { set: "set7" }] },
        price: 25,
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
        price: 209,
        buyDay: "sun",
      },
      {
        id: "vegetables-0-wed",
        food: "tomato",
        computedQty: { food: "tomato", sets: [{ set: "set4" }, { set: "set5" }, { set: "set6" }] },
        price: 86,
        buyDay: "wed",
      },
      {
        id: "vegetables-1-sun",
        food: "cucumber",
        computedQty: {
          food: "cucumber",
          sets: [{ set: "set1" }, { set: "set3" }, { set: "set2" }, { set: "set7" }],
        },
        price: 46,
        buyDay: "sun",
      },
      {
        id: "vegetables-1-wed",
        food: "cucumber",
        computedQty: { food: "cucumber", sets: [{ set: "set4" }], grams: 50 },
        price: 6,
        buyDay: "wed",
      },
      {
        id: "vegetables-1-wed2",
        food: "cucumber",
        computedQty: { food: "cucumber", sets: [{ set: "set5" }, { set: "set6" }] },
        price: 12,
        buyDay: "wed",
      },
      {
        id: "vegetables-2-sun",
        food: "pepper",
        computedQty: { food: "pepper", sets: [{ set: "set1" }] },
        price: 12,
        buyDay: "sun",
      },
      {
        id: "vegetables-pepper-wed",
        food: "pepper",
        computedQty: { food: "pepper", sets: [{ set: "set4" }] },
        price: 15,
        buyDay: "wed",
      },
      {
        id: "vegetables-3",
        food: "onion",
        qualifier: "червона",
        // +50г — курячо-яєчні маффіни (Сет3), цибуля ховається за комбінованим
        // ключем "chickenCabbageMuffin", не підсумовується через `sets`.
        computedQty: {
          food: "onion",
          sets: [{ set: "set1" }, { set: "set2" }, { set: "set4" }, { set: "set6" }],
          grams: 50,
        },
        price: 6,
        buyDay: "sun",
      },
      {
        id: "vegetables-6",
        food: "garlic",
        qty: "~80 г",
        note: "Сет5 + Сет6 + Сет7",
        price: 10,
        buyDay: "sun",
      },
      {
        id: "vegetables-7",
        food: "arugula",
        computedQty: { food: "arugula", sets: [{ set: "set2" }] },
        price: 45,
        buyDay: "sun",
      },
      {
        id: "vegetables-8",
        food: "icebergLettuce",
        computedQty: { food: "icebergLettuce", sets: [{ set: "set6" }, { set: "set2" }] },
        price: 60,
        buyDay: "wed",
      },
      {
        id: "vegetables-9",
        food: "lemon",
        qty: "4 шт (~480 г)",
        note: "Сет1 + Сет2 + Сет3 + Сет5",
        price: 54,
        buyDay: "sun",
      },
      {
        id: "vegetables-broccoli-sun",
        food: "broccoli",
        computedQty: { food: "broccoli", sets: [{ set: "set1" }, { set: "set3" }] },
        price: 28,
        buyDay: "sun",
      },
      {
        id: "vegetables-broccoli-wed",
        food: "broccoli",
        computedQty: { food: "broccoli", sets: [{ set: "set5" }] },
        price: 28,
        buyDay: "wed",
      },
      {
        id: "vegetables-cauliflower",
        food: "cauliflower",
        computedQty: { food: "cauliflower", sets: [{ set: "set3" }] },
        price: 45,
        buyDay: "sun",
      },
      {
        id: "vegetables-spinach",
        food: "spinachFrozen",
        computedQty: {
          food: "spinachFrozen",
          sets: [{ set: "set1" }, { set: "set4" }, { set: "set6" }, { set: "set7" }],
        },
        price: 65,
        buyDay: "sun",
      },
      {
        id: "vegetables-cabbage-wed",
        food: "cabbage",
        computedQty: { food: "cabbage", sets: [{ set: "set5" }] },
        price: 15,
        buyDay: "wed",
      },
      {
        id: "vegetables-pickled-cucumber",
        food: "pickledCucumber",
        computedQty: { food: "pickledCucumber", sets: [{ set: "set2" }, { set: "set6" }] },
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
        // Сет1/3/5 тепер додатково беруть ягоди на Передтрен (йогурт замість банана).
        computedQty: {
          food: "berries",
          sets: [
            { set: "set1" },
            { set: "set3" },
            { set: "set4" },
            { set: "set5" },
            { set: "set6" },
          ],
        },
        options: ["полуниця", "малина", "чорниця", "змішані заморожені"],
        price: 243,
        buyDay: "sun",
      },
      {
        id: "fruits-apple-sun",
        food: "apple",
        computedQty: { food: "apple", sets: [{ set: "set7" }] },
        price: 45,
        buyDay: "sun",
      },
      {
        id: "fruits-apple-wed",
        food: "apple",
        computedQty: { food: "apple", sets: [{ set: "set5" }] },
        price: 45,
        buyDay: "wed",
      },
      {
        id: "fruits-orange-wed",
        food: "orange",
        computedQty: { food: "orange", sets: [{ set: "set6" }] },
        price: 45,
        buyDay: "wed",
      },
      {
        id: "fruits-apricot-sun",
        food: "apricot",
        computedQty: { food: "apricot", sets: [{ set: "set3" }] },
        price: 90,
        buyDay: "sun",
      },
      {
        id: "fruits-pear-wed",
        food: "pear",
        computedQty: { food: "pear", sets: [{ set: "set4" }] },
        price: 40,
        buyDay: "wed",
      },
      {
        id: "fruits-peach-sun",
        food: "peach",
        computedQty: { food: "peach", sets: [{ set: "set1" }] },
        price: 85,
        buyDay: "sun",
      },
      {
        id: "fruits-plum-sun",
        food: "plum",
        computedQty: { food: "plum", sets: [{ set: "set2" }] },
        price: 60,
        buyDay: "sun",
      },
      {
        id: "fruits-lime-sun",
        food: "lime",
        qty: "3 шт",
        note: "Сет4 + Сет7",
        price: 72,
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
        price: 28,
        buyDay: "sun",
      },
      {
        id: "greens-0-wed",
        food: "dillParsley",
        qty: "1 пучок",
        note: "Сет3",
        price: 28,
        buyDay: "wed",
      },
      {
        id: "greens-1",
        food: "greenOnion",
        qty: "1 пучок",
        note: "Сет3",
        price: 28,
        buyDay: "wed",
      },
      {
        id: "greens-2",
        food: "basil",
        qualifier: "свіжий",
        qty: "1 пучок",
        note: "Сет4",
        price: 35,
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
        price: 102,
        buyDay: "sun",
      },
      {
        id: "oils-1",
        food: "oil",
        qualifier: "рослинна",
        qty: "150 мл",
        note: "Сет1 + Сет2 + Сет4 + Сет5 + Сет6 + Сет7",
        price: 9,
        buyDay: "sun",
      },
      {
        id: "oils-2",
        food: "appleVinegar",
        qualifier: "9%",
        qty: "50 мл",
        note: "Сет1 + Сет2 + Сет4 + Сет5 + Сет7",
        price: 6,
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
        note: "Сет2",
        price: 70,
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
        price: 42,
        buyDay: "sun",
      },
      {
        id: "sauces-2",
        food: "mustardDijon",
        qty: "80 г",
        note: "Сет1 + Сет6",
        price: 44,
        buyDay: "sun",
      },
      {
        id: "sauces-3",
        food: "mayo",
        computedQty: {
          food: "mayo",
          sets: [{ set: "set3" }, { set: "set4" }, { set: "set7" }],
        },
        price: 30,
        buyDay: "sun",
      },
      {
        id: "sauces-4",
        food: "adjika",
        computedQty: { food: "adjika", sets: [{ set: "set2" }, { set: "set6" }] },
        price: 45,
        buyDay: "sun",
      },
      {
        id: "sauces-5",
        food: "peanutButter",
        computedQty: { food: "peanutButter", sets: [{ set: "set3" }, { set: "set7" }] },
        price: 120,
        buyDay: "sun",
      },
      {
        id: "sauces-6",
        food: "ketchup",
        computedQty: { food: "ketchup", sets: [{ set: "set2" }, { set: "set6" }] },
        price: 55,
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
        price: 28,
        buyDay: "sun",
      },
      {
        id: "spices-1",
        food: "thyme",
        qualifier: "сушений",
        qty: "1 упаковка",
        price: 28,
        buyDay: "sun",
      },
      {
        id: "spices-2",
        food: "paprika",
        qty: "1 упаковка",
        note: "Сет4 + Сет7",
        price: 28,
        buyDay: "sun",
      },
      {
        id: "spices-3",
        food: "provencalHerbs",
        qty: "1 упаковка",
        note: "Сет5 + Сет6",
        price: 28,
        buyDay: "sun",
      },
      {
        id: "spices-4",
        food: "oregano",
        qty: "1 упаковка",
        note: "Сет1",
        price: 28,
        buyDay: "sun",
      },
      {
        id: "spices-4b",
        food: "fishSeasoning",
        qty: "1 упаковка",
        price: 28,
        buyDay: "sun",
      },
      {
        id: "spices-7",
        food: "salt",
        qty: "1 упаковка",
        note: "Щодня",
        price: 28,
        buyDay: "sun",
      },
      {
        id: "spices-8",
        food: "blackPepper",
        qualifier: "мелений",
        qty: "1 упаковка",
        note: "Щодня",
        price: 28,
        buyDay: "sun",
      },
    ],
  },
];

// Сезонність (зима/осінь/весна — заміна свіжих овочів у салатах) прибрана,
// лишилась одна поточна менюшка. Якщо повертати сезонність — дивись git-історію
// цього файлу на цьому місці.
export const DEFAULT_SET_PLAN = SUMMER_SET_PLAN;
export const SET_PLAN = DEFAULT_SET_PLAN;
