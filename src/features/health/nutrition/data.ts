import { DayPlan, ShoppingCategory, Profile } from "./types";
import { monday } from "./days/monday";
import { tuesday } from "./days/tuesday";
import { wednesday } from "./days/wednesday";
import { thursday } from "./days/thursday";
import { friday } from "./days/friday";
import { saturday } from "./days/saturday";
import { sunday } from "./days/sunday";

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

export const SUMMER_WEEK_PLAN: DayPlan[] = [
  monday,
  tuesday,
  wednesday,
  thursday,
  friday,
  saturday,
  sunday,
];

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
          weekdays: ["mon", "thu", "fri", "sat"],
        },
        note: "Пн 428г + Чт 430г + Пт+Сб 886г (збільшено замість протеїну та щоб довести до цілі)",
        price: 433,
        buyDay: "sun",
      },
      {
        id: "meat-1",
        food: "chickenHearts",
        computedQty: { food: "chickenHearts", weekdays: ["tue"] },
        note: "Вт (збільшено замість протеїну)",
        price: 86,
        buyDay: "sun",
      },
      {
        id: "meat-2",
        food: "porkChop",
        computedQty: { food: "porkChop", weekdays: ["sun"] },
        note: "Нд, ~5 шт (збільшено замість протеїну)",
        price: 161,
        buyDay: "sun",
      },
      {
        id: "meat-3",
        food: "mackerel",
        // свіжа, не заморожена — готується й заморожується сама в мілпрепі Нд;
        // якщо купити вже заморожену, вийде другий цикл заморозки сирої риби.
        qualifier: "свіжа",
        qty: "2 шт (~590 г)",
        note: "Ср — готується в мілпрепі Нд",
        price: 77,
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
        qty: "2 банки (по 180 г)",
        note: "Ср",
        price: 200,
        buyDay: "sun",
      },
      {
        id: "canned-1",
        food: "cornCanned",
        qty: "1 банка",
        note: "Ср, ~150 г",
        price: 35,
        buyDay: "sun",
      },
      {
        id: "canned-2",
        food: "tomatoPaste",
        qty: "20 г",
        note: "Вт",
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
        // +60г (1 яйце) — сирники в мілпрепі використовують яйце як інгредієнт рецепту,
        // яке ніколи не стає власним macroItem (сирники зважуються одним ключем "syrniki").
        // Ср теж тут — з'їдається в середу, отже купується заздалегідь у неділю, а не в середу.
        computedQty: { food: "eggs", weekdays: ["mon", "sun", "wed"], grams: 60, unit: "piece" },
        note: "Нд 6шт + Пн 4шт + Ср 2шт (Нд і Ср збільшено замість протеїну)",
        price: 55,
        buyDay: "sun",
      },
      {
        id: "dairy-0-wed",
        food: "eggs",
        computedQty: { food: "eggs", weekdays: ["thu", "fri"], unit: "piece" },
        note: "Чт 4шт + Пт 4шт",
        price: 55,
        buyDay: "wed",
      },
      {
        id: "dairy-1-sun",
        food: "yogurtGreek",
        qty: "1781 г",
        note: "Нд 386г + Пн 471г + Вт 602г + Ср 322г (збільшено замість протеїну)",
        price: 232,
        buyDay: "sun",
      },
      {
        id: "dairy-1-wed",
        food: "yogurtGreek",
        computedQty: { food: "yogurtGreek", weekdays: ["thu", "fri"] },
        note: "Чт 322г + Пт 385г (збільшено замість протеїну)",
        price: 92,
        buyDay: "wed",
      },
      {
        id: "dairy-2-sun",
        food: "cottageCheese",
        qualifier: "5–9%",
        qty: "500 г",
        note: "Нд",
        price: 90,
        buyDay: "sun",
      },
      {
        id: "dairy-2-sun-2",
        food: "cottageCheese",
        qualifier: "5–9%",
        qty: "500 г",
        note: "Ср",
        price: 90,
        buyDay: "wed",
      },
      {
        id: "dairy-3",
        food: "milk",
        qty: "1 л",
        note: "Пн 120мл + Вт 210мл + Нд 60мл + Сб 300мл",
        price: 46,
        buyDay: "sun",
      },
      {
        id: "dairy-4",
        food: "cream",
        qualifier: "10–15%",
        computedQty: { food: "cream", weekdays: ["sun"], unit: "ml" },
        note: "Нд",
        price: 44,
        buyDay: "sun",
      },
      {
        id: "dairy-5",
        food: "butter",
        qty: "77 г",
        note: "Пн 35г + Ср 27г + Пт 15г (Пн збільшено, щоб довести день до цілі; Пт зменшено під більшу картоплю)",
        price: 43,
        buyDay: "sun",
      },
      {
        id: "dairy-6",
        food: "brynza",
        computedQty: { food: "brynza", weekdays: ["mon", "sun"] },
        note: "Пн 135г + Нд 150г",
        price: 71,
        buyDay: "sun",
      },
      {
        id: "dairy-7",
        food: "suluguni",
        qty: "200 г",
        note: "Чт + Пт",
        price: 80,
        buyDay: "sun",
      },
      {
        id: "dairy-8",
        food: "hardCheese",
        computedQty: { food: "hardCheese", weekdays: ["tue", "sat"] },
        note: "Вт 105г + Сб 152г (Сб збільшено замість протеїну)",
        price: 154,
        buyDay: "sun",
      },
    ],
  },
  {
    id: "grains",
    title: "Крупи, борошно та хліб",
    items: [
      {
        id: "grains-0",
        food: "oats",
        qty: "170 г",
        note: "Вт",
        price: 17,
        buyDay: "sun",
      },
      {
        id: "grains-1",
        food: "buckwheat",
        computedQty: { food: "buckwheat", weekdays: ["tue"] },
        note: "Вт",
        price: 17,
        buyDay: "sun",
      },
      {
        id: "grains-2",
        food: "rice",
        computedQty: { food: "rice", weekdays: ["thu", "sun", "sat"] },
        note: "Чт 160г + Нд 80г + Сб 80г",
        price: 19,
        buyDay: "sun",
      },
      {
        id: "grains-3",
        food: "flour",
        qty: "150 г",
        note: "Нд",
        price: 5,
        buyDay: "sun",
      },
      {
        id: "grains-4-sun",
        food: "bread",
        qty: "~380 г",
        note: "Нд + Пн + Ср",
        price: 33,
        buyDay: "sun",
      },
      {
        id: "grains-4-wed",
        food: "bread",
        qty: "~290 г",
        note: "Чт + Пт + Сб",
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
        qty: "1.89 кг",
        note: "Пн 990г + Ср 435г + Пт 460г (Пт збільшено до нормальної порції гарніру на 2 прийоми)",
        price: 47,
        buyDay: "sun",
      },
      {
        id: "vegetables-0-sun",
        food: "tomato",
        qty: "~1.95 кг (14 шт)",
        note: "Пн + Вт + Ср + Нд",
        price: 209,
        buyDay: "sun",
      },
      {
        id: "vegetables-0-wed",
        food: "tomato",
        qty: "~830 г (6 шт)",
        note: "Чт + Пт",
        price: 86,
        buyDay: "wed",
      },
      {
        id: "vegetables-1-sun",
        food: "cucumber",
        qty: "~1.3 кг",
        note: "Пн + Ср + Нд",
        price: 46,
        buyDay: "sun",
      },
      {
        id: "vegetables-1-wed",
        food: "cucumber",
        qty: "~1 шт (~150 г)",
        note: "Чт + Пт",
        price: 6,
        buyDay: "wed",
      },
      {
        id: "vegetables-2-sun",
        food: "pepper",
        qty: "~220 г",
        note: "Пн + Нд",
        price: 12,
        buyDay: "sun",
      },
      {
        id: "vegetables-3",
        food: "onion",
        qualifier: "червона",
        qty: "~150 г",
        note: "Пн + Нд",
        price: 4,
        buyDay: "sun",
      },
      {
        id: "vegetables-4",
        food: "onion",
        qualifier: "звичайна",
        qty: "~400 г",
        note: "Нд",
        price: 10,
        buyDay: "sun",
      },
      {
        id: "vegetables-5",
        food: "carrot",
        computedQty: { food: "carrot", weekdays: ["fri"] },
        note: "Пт",
        price: 8,
        buyDay: "sun",
      },
      {
        id: "vegetables-6",
        food: "garlic",
        qty: "~80 г",
        note: "Нд + Пт + Сб",
        price: 16,
        buyDay: "sun",
      },
      {
        id: "vegetables-7",
        food: "arugula",
        computedQty: { food: "arugula", weekdays: ["tue"] },
        note: "Вт",
        price: 45,
        buyDay: "sun",
      },
      {
        id: "vegetables-8",
        food: "icebergLettuce",
        qty: "250 г",
        note: "Сб",
        price: 50,
        buyDay: "wed",
      },
      {
        id: "vegetables-9",
        food: "lemon",
        qty: "3 шт (~360 г)",
        note: "Нд + Ср + Сб",
        price: 54,
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
        qty: "~750 г",
        note: "Щодня + Вт 100г",
        options: ["полуниця", "малина", "чорниця", "змішані заморожені"],
        price: 135,
        buyDay: "sun",
      },
      {
        id: "fruits-1",
        food: "fruitMix",
        qty: "~250 г",
        note: "Ср",
        options: ["банани", "яблука", "груші", "апельсини"],
        price: 16,
        buyDay: "sun",
      },
      {
        id: "fruits-2-sun",
        food: "banana",
        computedQty: { food: "banana", weekdays: ["sun", "mon", "tue", "wed"], unit: "piece" },
        note: "Нд–Ср",
        price: 57,
        buyDay: "sun",
      },
      {
        id: "fruits-2-wed",
        food: "banana",
        computedQty: { food: "banana", weekdays: ["thu", "fri", "sat"], unit: "piece" },
        note: "Чт–Сб",
        price: 47,
        buyDay: "wed",
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
        note: "Пн",
        price: 22,
        buyDay: "sun",
      },
      {
        id: "greens-0-sun-2",
        food: "dillParsley",
        qty: "1 пучок",
        note: "Ср",
        price: 23,
        buyDay: "sun",
      },
      {
        id: "greens-1",
        food: "greenOnion",
        qty: "1 пучок",
        note: "Ср",
        price: 22,
        buyDay: "sun",
      },
      {
        id: "greens-2",
        food: "basil",
        qualifier: "свіжий",
        qty: "1 пучок",
        note: "Чт",
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
        note: "Пн + Вт + Чт + Пт + Сб + Нд",
        price: 65,
        buyDay: "sun",
      },
      {
        id: "oils-1",
        food: "oil",
        qualifier: "рослинна",
        qty: "100 (для смаження + морква)",
        note: "Пн + Вт + Чт + Пт + Сб + Нд",
        price: 10,
        buyDay: "sun",
      },
      {
        id: "oils-2",
        food: "appleVinegar",
        qualifier: "9%",
        qty: "50 мл",
        note: "Пн + Вт + Чт + Пт + Нд",
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
        note: "Нд + Вт",
        price: 32,
        buyDay: "sun",
      },
      {
        id: "sauces-1",
        food: "honey",
        qty: "100 г",
        note: "Щодня",
        price: 20,
        buyDay: "sun",
      },
      {
        id: "sauces-2",
        food: "mustardDijon",
        qty: "80 г",
        note: "Нд + Пн + Сб",
        price: 24,
        buyDay: "sun",
      },
      {
        id: "sauces-3",
        food: "mayo",
        qty: "110 г",
        note: "Сб",
        price: 17,
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
        note: "Нд + Пт",
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
        note: "Пн + Нд",
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

// 1. Зимовий план (WINTER_WEEK_PLAN): Заміна свіжих томатів/огірків на капусту/солоні огірки
export const WINTER_WEEK_PLAN: DayPlan[] = JSON.parse(JSON.stringify(SUMMER_WEEK_PLAN));

const monLunchW = WINTER_WEEK_PLAN[0].meals.find((m) => m.type === "lunch");
if (monLunchW && monLunchW.macroItems) {
  monLunchW.ingredients[6] =
    "Для салату: капуста 500 г, морква 100 г, олія 6 г (Олеся), яблучний оцет, зелень";
  monLunchW.macroItems = monLunchW.macroItems.filter(
    (item) =>
      item.food !== "tomato" &&
      item.food !== "cucumber" &&
      item.food !== "pepper" &&
      item.food !== "brynza",
  );
  monLunchW.macroItems.push(
    { food: "cabbage", vitalii: 250, olesia: 250, component: "Салат з капусти" },
    { food: "carrot", vitalii: 50, olesia: 50, component: "Салат з капусти" },
  );
}

const tueLunchW = WINTER_WEEK_PLAN[1].meals.find((m) => m.type === "lunch");
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

const wedLunchW = WINTER_WEEK_PLAN[2].meals.find((m) => m.type === "lunch");
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

const friLunchW = WINTER_WEEK_PLAN[4].meals.find((m) => m.type === "lunch");
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

const sunLunchW = WINTER_WEEK_PLAN[6].meals.find((m) => m.type === "lunch");
if (sunLunchW && sunLunchW.macroItems) {
  sunLunchW.ingredients[6] = "Для салату: капуста 500 г, морква 100 г, олія 6 г (Олеся), зелень";
  sunLunchW.macroItems = sunLunchW.macroItems.filter(
    (item) =>
      item.food !== "tomato" &&
      item.food !== "cucumber" &&
      item.food !== "pepper" &&
      item.food !== "brynza",
  );
  sunLunchW.macroItems.push(
    { food: "cabbage", vitalii: 250, olesia: 250, component: "Салат з капусти" },
    { food: "carrot", vitalii: 50, olesia: 50, component: "Салат з капусти" },
  );
}

// 2. Осінній план (AUTUMN_WEEK_PLAN): Переважають буряк, морква, капуста, яблука
export const AUTUMN_WEEK_PLAN: DayPlan[] = JSON.parse(JSON.stringify(SUMMER_WEEK_PLAN));

const monLunchA = AUTUMN_WEEK_PLAN[0].meals.find((m) => m.type === "lunch");
if (monLunchA && monLunchA.macroItems) {
  monLunchA.ingredients[6] = "Для салату: варений буряк 500 г, чорнослив, олія 6 г (Олеся), часник";
  monLunchA.macroItems = monLunchA.macroItems.filter(
    (item) =>
      item.food !== "tomato" &&
      item.food !== "cucumber" &&
      item.food !== "pepper" &&
      item.food !== "brynza",
  );
  monLunchA.macroItems.push({
    food: "beetroot",
    vitalii: 250,
    olesia: 250,
    component: "Буряковий салат",
  });
}

const wedLunchA = AUTUMN_WEEK_PLAN[2].meals.find((m) => m.type === "lunch");
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

const sunLunchA = AUTUMN_WEEK_PLAN[6].meals.find((m) => m.type === "lunch");
if (sunLunchA && sunLunchA.macroItems) {
  sunLunchA.ingredients[6] =
    "Для салату: варений буряк 500 г, олія 6 г (Олеся), солоний огірок 100 г";
  sunLunchA.macroItems = sunLunchA.macroItems.filter(
    (item) =>
      item.food !== "tomato" &&
      item.food !== "cucumber" &&
      item.food !== "pepper" &&
      item.food !== "brynza",
  );
  sunLunchA.macroItems.push(
    { food: "beetroot", vitalii: 250, olesia: 250, component: "Буряковий салат" },
    { food: "pickledCucumber", vitalii: 50, olesia: 50, component: "Буряковий салат" },
  );
}

// 3. Весняний план (SPRING_WEEK_PLAN): Переважають редиска, зелена цибуля, огірки
export const SPRING_WEEK_PLAN: DayPlan[] = JSON.parse(JSON.stringify(SUMMER_WEEK_PLAN));

const monBreakfastS = SPRING_WEEK_PLAN[0].meals.find((m) => m.type === "breakfast");
if (monBreakfastS && monBreakfastS.macroItems) {
  monBreakfastS.ingredients[2] = "Редиска та огірки — 150 г (по 75 г кожному)";
  monBreakfastS.macroItems = monBreakfastS.macroItems.map((item) => {
    if (item.food === "tomato") return { ...item, food: "radish" };
    return item;
  });
}

const monLunchS = SPRING_WEEK_PLAN[0].meals.find((m) => m.type === "lunch");
if (monLunchS && monLunchS.macroItems) {
  monLunchS.ingredients[6] =
    "Для салату: капуста молода 350 г, редиска 150 г, огірок 100 г, олія 6 г (Олеся)";
  monLunchS.macroItems = monLunchS.macroItems.filter(
    (item) => item.food !== "tomato" && item.food !== "pepper" && item.food !== "brynza",
  );
  monLunchS.macroItems.push(
    { food: "cabbage", vitalii: 175, olesia: 175, component: "Весняний салат" },
    { food: "radish", vitalii: 75, olesia: 75, component: "Весняний салат" },
  );
}

const sunLunchS = SPRING_WEEK_PLAN[6].meals.find((m) => m.type === "lunch");
if (sunLunchS && sunLunchS.macroItems) {
  sunLunchS.ingredients[6] =
    "Для салату: капуста молода 350 г, редиска 150 г, огірок 100 г, олія 6 г (Олеся)";
  sunLunchS.macroItems = sunLunchS.macroItems.filter(
    (item) => item.food !== "tomato" && item.food !== "pepper" && item.food !== "brynza",
  );
  sunLunchS.macroItems.push(
    { food: "cabbage", vitalii: 175, olesia: 175, component: "Весняний салат" },
    { food: "radish", vitalii: 75, olesia: 75, component: "Весняний салат" },
  );
}

export const DEFAULT_WEEK_PLAN = WINTER_WEEK_PLAN;
export const WEEK_PLAN = DEFAULT_WEEK_PLAN;
