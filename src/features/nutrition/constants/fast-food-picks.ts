export type FfCategory = "fruits" | "bread" | "meat" | "dairy" | "veggies" | "grains" | "spices" | "drinks";

export type FfItem = {
  name: string;
  category: FfCategory;
  isBase?: boolean;
};

export type FastFoodPick = {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  place: string;
  baseName?: string;
  items: FfItem[];
};

export const FAST_FOOD_PICKS: FastFoodPick[] = [
  {
    id: "sushi",
    name: "Суші / Роли",
    shortName: "Суші",
    icon: "🍣",
    place: "Домашні",
    items: [
      { name: "Лосось / Форель", category: "meat" },
      { name: "Норі",            category: "spices" },
      { name: "Рис суші",        category: "grains" },
      { name: "Плавлений сир",   category: "dairy" },
      { name: "Огірок",          category: "veggies" },
    ],
  },
  {
    id: "crispy-chicken",
    name: "Крізпі Чікен Делюкс",
    shortName: "Чікен",
    icon: "🍗",
    place: "McDonald's / Дома",
    baseName: "Булочка + панірування",
    items: [
      { name: "Куряче філе",         category: "meat" },
      { name: "Айсберг",             category: "veggies" },
      { name: "Помідор",             category: "veggies" },
      { name: "Маринований огірок",  category: "veggies" },
      { name: "Майонез",             category: "spices" },
      { name: "Гірчиця діжонська",   category: "spices" },
      // панірування + булочка (base)
      { name: "ЦЗ Борошно",          category: "grains",  isBase: true },
      { name: "Звичайне борошно",    category: "grains",  isBase: true },
      { name: "Кукурудзяний крохмаль", category: "grains", isBase: true },
      { name: "Яйце",                category: "dairy",   isBase: true },
      { name: "Кефір",               category: "dairy",   isBase: true },
      { name: "Часник",              category: "spices",  isBase: true },
      { name: "Паприка",             category: "spices",  isBase: true },
      { name: "Олія оливкова",       category: "spices",  isBase: true },
      { name: "Кунжут",              category: "spices",  isBase: true },
    ],
  },
  {
    id: "cheeseburger",
    name: "Чізбургер",
    shortName: "Чіз",
    icon: "🍔",
    place: "McDonald's / Дома",
    baseName: "Булочки",
    items: [
      { name: "Яловичий фарш",       category: "meat" },
      { name: "Чеддер",              category: "dairy" },
      { name: "Маринований огірок",  category: "veggies" },
      { name: "Цибуля",              category: "veggies" },
      { name: "Гірчиця",             category: "spices" },
      { name: "Кетчуп",              category: "spices" },
      { name: "ЦЗ Борошно",          category: "grains",  isBase: true },
      { name: "Звичайне борошно",    category: "grains",  isBase: true },
      { name: "Молоко",              category: "dairy",   isBase: true },
      { name: "Яйце",                category: "dairy",   isBase: true },
      { name: "Цукор",               category: "spices",  isBase: true },
      { name: "Дріжджі сухі",        category: "spices",  isBase: true },
      { name: "Олія оливкова",       category: "spices",  isBase: true },
      { name: "Кунжут",              category: "spices",  isBase: true },
    ],
  },
  {
    id: "bigmac",
    name: "Біг Мак",
    shortName: "Біг Мак",
    icon: "🍔",
    place: "McDonald's / Дома",
    baseName: "Булочки",
    items: [
      { name: "Яловичий фарш ×2",    category: "meat" },
      { name: "Чеддер",              category: "dairy" },
      { name: "Айсберг",             category: "veggies" },
      { name: "Цибуля",              category: "veggies" },
      { name: "Маринований огірок",  category: "veggies" },
      { name: "ЦЗ Борошно",          category: "grains",  isBase: true },
      { name: "Звичайне борошно",    category: "grains",  isBase: true },
      { name: "Молоко",              category: "dairy",   isBase: true },
      { name: "Яйце",                category: "dairy",   isBase: true },
      { name: "Цукор",               category: "spices",  isBase: true },
      { name: "Дріжджі сухі",        category: "spices",  isBase: true },
      { name: "Олія оливкова",       category: "spices",  isBase: true },
      { name: "Кунжут",              category: "spices",  isBase: true },
    ],
  },
  {
    id: "kebab-classic",
    name: "Кебаб Класичний",
    shortName: "Класик",
    icon: "🌯",
    place: "I Love Kebab / Дома",
    baseName: "Лаваш",
    items: [
      { name: "Куряче філе",         category: "meat" },
      { name: "Томат",               category: "veggies" },
      { name: "Айсберг",             category: "veggies" },
      { name: "Цибуля",              category: "veggies" },
      { name: "Напівгострий соус",   category: "spices" },
      { name: "ЦЗ Борошно",          category: "grains",  isBase: true },
      { name: "Звичайне борошно",    category: "grains",  isBase: true },
      { name: "Олія оливкова",       category: "spices",  isBase: true },
      { name: "Насіння льону",       category: "spices",  isBase: true },
    ],
  },
  {
    id: "kebab-bw",
    name: "Black & White",
    shortName: "B&W",
    icon: "🌯",
    place: "I Love Kebab / Дома",
    baseName: "Лаваш",
    items: [
      { name: "Куряче філе",   category: "meat" },
      { name: "Твердий сир",   category: "dairy" },
      { name: "Печериці",      category: "veggies" },
      { name: "Томат",         category: "veggies" },
      { name: "Айсберг",       category: "veggies" },
      { name: "ЦЗ Борошно",    category: "grains",  isBase: true },
      { name: "Звичайне борошно", category: "grains", isBase: true },
      { name: "Олія оливкова", category: "spices",  isBase: true },
      { name: "Насіння льону", category: "spices",  isBase: true },
    ],
  },
  {
    id: "pizza-villa",
    name: "Вілла д'Есте",
    shortName: "Вілла",
    icon: "🍕",
    place: "Маріо / Дома",
    baseName: "Тісто для піци",
    items: [
      { name: "Куряче філе",   category: "meat" },
      { name: "Бекон",         category: "meat" },
      { name: "Моцарела",      category: "dairy" },
      { name: "Бешамель",      category: "dairy" },
      { name: "Печериці",      category: "veggies" },
      { name: "Томатний соус", category: "spices" },
      { name: "Соус Песто",    category: "spices" },
      { name: "Борошно 00",    category: "grains",  isBase: true },
      { name: "ЦЗ Борошно",    category: "grains",  isBase: true },
      { name: "Дріжджі сухі",  category: "spices",  isBase: true },
      { name: "Олія оливкова", category: "spices",  isBase: true },
    ],
  },
  {
    id: "pizza-simona",
    name: "Сімона",
    shortName: "Сімона",
    icon: "🍕",
    place: "Маріо / Дома",
    baseName: "Тісто для піци",
    items: [
      { name: "Куряче філе",   category: "meat" },
      { name: "Бекон",         category: "meat" },
      { name: "Моцарела",      category: "dairy" },
      { name: "Чеддер",        category: "dairy" },
      { name: "Бешамель",      category: "dairy" },
      { name: "Ананас",        category: "fruits" },
      { name: "Борошно 00",    category: "grains",  isBase: true },
      { name: "ЦЗ Борошно",    category: "grains",  isBase: true },
      { name: "Дріжджі сухі",  category: "spices",  isBase: true },
      { name: "Олія оливкова", category: "spices",  isBase: true },
    ],
  },
];

export const FF_STORAGE_KEY = "visual-plan-ff";
export const FF_EVENT = "visual-plan-ff-changed";
