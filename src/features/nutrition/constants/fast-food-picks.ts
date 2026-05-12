export type FfCategory = "fruits" | "bread" | "meat" | "dairy" | "veggies" | "grains" | "spices" | "drinks";

export type FfItem = {
  name: string;
  category: FfCategory;
  isBase?: boolean;
  youGrams: number;
  herGrams: number;
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
      { name: "Лосось / Форель", category: "meat",   youGrams: 60,  herGrams: 80 },
      { name: "Норі",            category: "spices", youGrams: 5,   herGrams: 5  },
      { name: "Рис суші",        category: "grains", youGrams: 100, herGrams: 150 },
      { name: "Плавлений сир",   category: "dairy",  youGrams: 20,  herGrams: 30 },
      { name: "Огірок",          category: "veggies", youGrams: 30,  herGrams: 40 },
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
      { name: "Куряче філе",         category: "meat",    youGrams: 120, herGrams: 120 },
      { name: "Айсберг",             category: "veggies", youGrams: 30,  herGrams: 30  },
      { name: "Помідор",             category: "veggies", youGrams: 30,  herGrams: 30  },
      { name: "Маринований огірок",  category: "veggies", youGrams: 20,  herGrams: 20  },
      { name: "Майонез",             category: "spices",  youGrams: 10,  herGrams: 15  },
      { name: "Гірчиця діжонська",   category: "spices",  youGrams: 5,   herGrams: 5   },
      // панірування + булочка (base)
      { name: "ЦЗ Борошно",          category: "grains",  isBase: true, youGrams: 30, herGrams: 40 },
      { name: "Звичайне борошно",    category: "grains",  isBase: true, youGrams: 20, herGrams: 30 },
      { name: "Кукурудзяний крохмаль", category: "grains", isBase: true, youGrams: 5,  herGrams: 5  },
      { name: "Яйце",                category: "dairy",   isBase: true, youGrams: 10, herGrams: 15 },
      { name: "Кефір",               category: "dairy",   isBase: true, youGrams: 20, herGrams: 30 },
      { name: "Часник",              category: "spices",  isBase: true, youGrams: 2,  herGrams: 2  },
      { name: "Паприка",             category: "spices",  isBase: true, youGrams: 2,  herGrams: 2  },
      { name: "Олія оливкова",       category: "spices",  isBase: true, youGrams: 5,  herGrams: 5  },
      { name: "Кунжут",              category: "spices",  isBase: true, youGrams: 2,  herGrams: 2  },
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
      { name: "Яловичий фарш",       category: "meat",    youGrams: 100, herGrams: 100 },
      { name: "Чеддер",              category: "dairy",   youGrams: 20,  herGrams: 30  },
      { name: "Маринований огірок",  category: "veggies", youGrams: 15,  herGrams: 15  },
      { name: "Цибуля",              category: "veggies", youGrams: 10,  herGrams: 10  },
      { name: "Гірчиця",             category: "spices",  youGrams: 5,   herGrams: 5   },
      { name: "Кетчуп",              category: "spices",  youGrams: 10,  herGrams: 10  },
      { name: "ЦЗ Борошно",          category: "grains",  isBase: true, youGrams: 25, herGrams: 35 },
      { name: "Звичайне борошно",    category: "grains",  isBase: true, youGrams: 25, herGrams: 35 },
      { name: "Молоко",              category: "dairy",   isBase: true, youGrams: 20, herGrams: 30 },
      { name: "Яйце",                category: "dairy",   isBase: true, youGrams: 10, herGrams: 10 },
      { name: "Цукор",               category: "spices",  isBase: true, youGrams: 2,  herGrams: 3  },
      { name: "Дріжджі сухі",        category: "spices",  isBase: true, youGrams: 1,  herGrams: 1  },
      { name: "Олія оливкова",       category: "spices",  isBase: true, youGrams: 3,  herGrams: 5  },
      { name: "Кунжут",              category: "spices",  isBase: true, youGrams: 1,  herGrams: 1  },
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
      { name: "Яловичий фарш",       category: "meat",    youGrams: 150, herGrams: 150 },
      { name: "Чеддер",              category: "dairy",   youGrams: 20,  herGrams: 30  },
      { name: "Айсберг",             category: "veggies", youGrams: 30,  herGrams: 30  },
      { name: "Цибуля",              category: "veggies", youGrams: 10,  herGrams: 10  },
      { name: "Маринований огірок",  category: "veggies", youGrams: 15,  herGrams: 15  },
      { name: "ЦЗ Борошно",          category: "grains",  isBase: true, youGrams: 35, herGrams: 45 },
      { name: "Звичайне борошно",    category: "grains",  isBase: true, youGrams: 35, herGrams: 45 },
      { name: "Молоко",              category: "dairy",   isBase: true, youGrams: 30, herGrams: 40 },
      { name: "Яйце",                category: "dairy",   isBase: true, youGrams: 10, herGrams: 10 },
      { name: "Цукор",               category: "spices",  isBase: true, youGrams: 3,  herGrams: 4  },
      { name: "Дріжджі сухі",        category: "spices",  isBase: true, youGrams: 1,  herGrams: 1  },
      { name: "Олія оливкова",       category: "spices",  isBase: true, youGrams: 5,  herGrams: 7  },
      { name: "Кунжут",              category: "spices",  isBase: true, youGrams: 1,  herGrams: 1  },
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
      { name: "Куряче філе",         category: "meat",    youGrams: 150, herGrams: 120 },
      { name: "Помідор",             category: "veggies", youGrams: 50,  herGrams: 50  },
      { name: "Айсберг",             category: "veggies", youGrams: 50,  herGrams: 50  },
      { name: "Цибуля",              category: "veggies", youGrams: 20,  herGrams: 20  },
      { name: "Напівгострий соус",   category: "spices",  youGrams: 20,  herGrams: 30  },
      { name: "ЦЗ Борошно",          category: "grains",  isBase: true, youGrams: 40, herGrams: 40 },
      { name: "Звичайне борошно",    category: "grains",  isBase: true, youGrams: 40, herGrams: 40 },
      { name: "Олія оливкова",       category: "spices",  isBase: true, youGrams: 5,  herGrams: 5  },
      { name: "Насіння льону",       category: "spices",  isBase: true, youGrams: 5,  herGrams: 5  },
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
      { name: "Куряче філе",   category: "meat",    youGrams: 120, herGrams: 100 },
      { name: "Твердий сир",   category: "dairy",   youGrams: 20,  herGrams: 30  },
      { name: "Печериці",      category: "veggies", youGrams: 40,  herGrams: 40  },
      { name: "Помідор",       category: "veggies", youGrams: 40,  herGrams: 40  },
      { name: "Айсберг",       category: "veggies", youGrams: 40,  herGrams: 40  },
      { name: "ЦЗ Борошно",    category: "grains",  isBase: true, youGrams: 40, herGrams: 40 },
      { name: "Звичайне борошно", category: "grains", isBase: true, youGrams: 40, herGrams: 40 },
      { name: "Олія оливкова", category: "spices",  isBase: true, youGrams: 5,  herGrams: 5  },
      { name: "Насіння льону", category: "spices",  isBase: true, youGrams: 5,  herGrams: 5  },
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
      { name: "Куряче філе",   category: "meat",    youGrams: 100, herGrams: 80  },
      { name: "Бекон",         category: "meat",    youGrams: 10,  herGrams: 20  },
      { name: "Моцарела",      category: "dairy",   youGrams: 30,  herGrams: 40  },
      { name: "Бешамель",      category: "dairy",   youGrams: 30,  herGrams: 40  },
      { name: "Печериці",      category: "veggies", youGrams: 30,  herGrams: 30  },
      { name: "Томатний соус", category: "spices",  youGrams: 20,  herGrams: 20  },
      { name: "Соус Песто",    category: "spices",  youGrams: 10,  herGrams: 15  },
      { name: "Борошно 00",    category: "grains",  isBase: true, youGrams: 50, herGrams: 70 },
      { name: "ЦЗ Борошно",    category: "grains",  isBase: true, youGrams: 20, herGrams: 30 },
      { name: "Дріжджі сухі",  category: "spices",  isBase: true, youGrams: 1,  herGrams: 1  },
      { name: "Олія оливкова", category: "spices",  isBase: true, youGrams: 3,  herGrams: 5  },
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
      { name: "Куряче філе",   category: "meat",    youGrams: 100, herGrams: 80  },
      { name: "Бекон",         category: "meat",    youGrams: 10,  herGrams: 20  },
      { name: "Моцарела",      category: "dairy",   youGrams: 30,  herGrams: 40  },
      { name: "Чеддер",        category: "dairy",   youGrams: 20,  herGrams: 30  },
      { name: "Бешамель",      category: "dairy",   youGrams: 30,  herGrams: 40  },
      { name: "Ананас",        category: "fruits",  youGrams: 30,  herGrams: 40  },
      { name: "Борошно 00",    category: "grains",  isBase: true, youGrams: 50, herGrams: 70 },
      { name: "ЦЗ Борошно",    category: "grains",  isBase: true, youGrams: 20, herGrams: 30 },
      { name: "Дріжджі сухі",  category: "spices",  isBase: true, youGrams: 1,  herGrams: 1  },
      { name: "Олія оливкова", category: "spices",  isBase: true, youGrams: 3,  herGrams: 5  },
    ],
  },
];

export const FF_STORAGE_KEY = "visual-plan-ff";
export const FF_EVENT = "visual-plan-ff-changed";
