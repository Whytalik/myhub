export type MealProduct = {
  name: string;
  alts?: string[];
  youGrams: number;
  herGrams: number;
};

export type MealVariant = { name: string; icon: string; products: MealProduct[] };

export const MEAL_VARIANTS: Record<string, MealVariant[]> = {
  "Передтрен": [
    { name: "Класика",  icon: "🍯", products: [
      { name: "Рисові хлібці", youGrams: 7, herGrams: 14 },
      { name: "Мед", youGrams: 7, herGrams: 14 },
      { name: "Теплий чай", youGrams: 0, herGrams: 0 },
    ]},
    { name: "Енергія",  icon: "🍌", products: [
      { name: "Банан стиглий", youGrams: 120, herGrams: 150 },
      { name: "Теплий чай", youGrams: 0, herGrams: 0 },
    ]},
    { name: "Баланс",   icon: "🥨", products: [
      { name: "Солона соломка", youGrams: 40, herGrams: 50 },
      { name: "Теплий чай", youGrams: 0, herGrams: 0 },
    ]},
    { name: "Ситність", icon: "🥖", products: [
      { name: "Батон", youGrams: 30, herGrams: 60 },
      { name: "Мед", youGrams: 7, herGrams: 14 },
      { name: "Теплий чай", youGrams: 0, herGrams: 0 },
    ]},
  ],
  "Сніданок": [
    { name: "Сирні панкейки", icon: "🥞", products: [
      { name: "Сир кисломолочний", youGrams: 150, herGrams: 250 },
      { name: "Яйце", youGrams: 50, herGrams: 100 },
      { name: "ЦЗ Борошно", youGrams: 20, herGrams: 40 },
      { name: "Яблуко", alts: ["Груша", "Вишня замор.", "Чорниця замор."], youGrams: 80, herGrams: 120 },
      { name: "Мед", youGrams: 5, herGrams: 10 },
      { name: "Кориця", youGrams: 0, herGrams: 0 },
      { name: "Ванілін", youGrams: 0, herGrams: 0 },
    ]},
    { name: "Білковий омлет", icon: "🍳", products: [
      { name: "Яйця", youGrams: 50, herGrams: 200 },
      { name: "Яєчні білки", youGrams: 120, herGrams: 0 },
      { name: "Куряче філе", youGrams: 100, herGrams: 120 },
      { name: "Помідор", alts: ["Мікс овочей"], youGrams: 200, herGrams: 200 },
      { name: "ЦЗ Хліб", youGrams: 30, herGrams: 60 },
      { name: "Насіння льону", youGrams: 10, herGrams: 15 },
      { name: "Соєво-часниковий", youGrams: 0, herGrams: 0 },
    ]},
    { name: "Тости з тунцем", icon: "🐟", products: [
      { name: "Тунець у вл. соку", youGrams: 90, herGrams: 185 },
      { name: "ЦЗ Хліб", youGrams: 30, herGrams: 60 },
      { name: "Яйце варене", youGrams: 50, herGrams: 100 },
      { name: "Огірок", alts: ["Зелена цибуля"], youGrams: 80, herGrams: 120 },
      { name: "Насіння льону", youGrams: 10, herGrams: 15 },
      { name: "Гірчиця", youGrams: 0, herGrams: 0 },
    ]},
    { name: "Breakfast Wrap", icon: "🌯", products: [
      { name: "Лаваш тонкий", youGrams: 50, herGrams: 50 },
      { name: "Куряче філе", youGrams: 100, herGrams: 120 },
      { name: "Яйце-скрембл", youGrams: 50, herGrams: 100 },
      { name: "Айсберг", alts: ["Огірок"], youGrams: 100, herGrams: 150 },
      { name: "Насіння льону", youGrams: 10, herGrams: 15 },
      { name: "Помідор", youGrams: 50, herGrams: 100 },
      { name: "Цибуля червона", youGrams: 15, herGrams: 30 },
      { name: "Лимонний сік", youGrams: 0, herGrams: 0 },
    ]},
  ],
  "Обід": [
    { name: "Зібраний Боул", icon: "🥣", products: [
      { name: "Гречка", alts: ["Рис", "Булгур"], youGrams: 100, herGrams: 150 },
      { name: "Куряче філе", alts: ["Смажений курячий фарш", "Курячі серця"], youGrams: 100, herGrams: 150 },
      { name: "Морква", youGrams: 80, herGrams: 100 },
      { name: "Огірок", youGrams: 80, herGrams: 100 },
      { name: "Помідор", youGrams: 100, herGrams: 150 },
      { name: "Яблуко", alts: ["Груша"], youGrams: 60, herGrams: 120 },
      { name: "Олія оливкова", alts: ["Арахіс смажений"], youGrams: 5, herGrams: 10 },
      { name: "Соєво-медовий", youGrams: 0, herGrams: 0 },
    ]},
    { name: "Паста-конструктор", icon: "🍝", products: [
      { name: "Макарони ТЗ", youGrams: 120, herGrams: 180 },
      { name: "Куряче філе", alts: ["Яловичий фарш"], youGrams: 100, herGrams: 150 },
      { name: "Томатна пасата", youGrams: 100, herGrams: 150 },
      { name: "Цибуля", youGrams: 30, herGrams: 50 },
      { name: "Морква", youGrams: 50, herGrams: 80 },
      { name: "Твердий сир", youGrams: 10, herGrams: 30 },
      { name: "Орегано + Базилік", youGrams: 0, herGrams: 0 },
    ]},
    { name: "Зігріваючий Суп", icon: "🍲", products: [
      { name: "Червона сочевиця", youGrams: 100, herGrams: 150 },
      { name: "Куряче філе", youGrams: 100, herGrams: 120 },
      { name: "Картопля", youGrams: 100, herGrams: 200 },
      { name: "Морква", youGrams: 50, herGrams: 80 },
      { name: "Цибуля", youGrams: 30, herGrams: 50 },
      { name: "Петрушка", alts: ["Кріп"], youGrams: 5, herGrams: 10 },
      { name: "Куркума", youGrams: 0, herGrams: 0 },
      { name: "Лавровий лист", youGrams: 0, herGrams: 0 },
    ]},
    { name: "Печена тарілка", icon: "🐟", products: [
      { name: "Картопля", youGrams: 200, herGrams: 400 },
      { name: "Хек", alts: ["Тилапія", "Куряче стегно"], youGrams: 150, herGrams: 150 },
      { name: "Морква по-корейськи", alts: ["Капуста"], youGrams: 80, herGrams: 150 },
      { name: "Лимонно-трав'яний", youGrams: 0, herGrams: 0 },
      { name: "Ткемалі", youGrams: 0, herGrams: 0 },
    ]},
  ],
  "Вечеря": [
    { name: "Овочеве Рагу", icon: "🍛", products: [
      { name: "Куряче філе", alts: ["Яловичий фарш"], youGrams: 150, herGrams: 150 },
      { name: "Картопля", youGrams: 100, herGrams: 200 },
      { name: "Морква", youGrams: 60, herGrams: 100 },
      { name: "Кабачок", youGrams: 100, herGrams: 150 },
      { name: "Перець", youGrams: 50, herGrams: 100 },
      { name: "Квасоля", youGrams: 50, herGrams: 100 },
      { name: "Томатна паста", youGrams: 10, herGrams: 20 },
      { name: "Паприка + Лавровий лист", youGrams: 0, herGrams: 0 },
    ]},
    { name: "Солодкий Сир", icon: "🍓", products: [
      { name: "Сир кисломолочний", youGrams: 250, herGrams: 250 },
      { name: "Яблуко", alts: ["Груша", "Вишня замор.", "Чорниця замор."], youGrams: 100, herGrams: 150 },
      { name: "Арахіс", alts: ["Насіння льону"], youGrams: 10, herGrams: 25 },
      { name: "Мед", youGrams: 5, herGrams: 10 },
      { name: "Кориця", youGrams: 0, herGrams: 0 },
    ]},
    { name: "Риба + Зелень", icon: "🥦", products: [
      { name: "Хек", alts: ["Тилапія", "Мінтай"], youGrams: 150, herGrams: 150 },
      { name: "Гречка", alts: ["Рис"], youGrams: 100, herGrams: 150 },
      { name: "Броколі зам.", alts: ["Цвітна капуста зам."], youGrams: 100, herGrams: 150 },
      { name: "Олія + Кріп + Часник", youGrams: 0, herGrams: 0 },
      { name: "Грецький йогурт", youGrams: 15, herGrams: 30 },
    ]},
    { name: "Протеїновий Салат", icon: "🥗", products: [
      { name: "Тунець у вл. соку", alts: ["Куряче філе", "Яйця"], youGrams: 150, herGrams: 150 },
      { name: "Айсберг", alts: ["Пекінська капуста"], youGrams: 200, herGrams: 300 },
      { name: "Огірок", alts: ["Помідор"], youGrams: 100, herGrams: 200 },
      { name: "Рис", alts: ["Гречка"], youGrams: 100, herGrams: 150 },
      { name: "Йогурт з кропом", youGrams: 0, herGrams: 0 },
    ]},
  ],
};

export type WeekDay = {
  day: string;
  isWeekend: boolean;
  activity: "gym" | "cardio";
  defaults: Partial<Record<string, string>>;
};

export const WEEKLY_SCHEDULE: WeekDay[] = [
  { day: "Пн", isWeekend: false, activity: "gym",    defaults: { "Передтрен": "Класика", "Сніданок": "Білковий омлет",  "Обід": "Зібраний Боул",     "Вечеря": "Овочеве Рагу"      } },
  { day: "Вт", isWeekend: false, activity: "cardio", defaults: { "Передтрен": "Енергія", "Сніданок": "Сирні панкейки",  "Обід": "Зігріваючий Суп",   "Вечеря": "Протеїновий Салат" } },
  { day: "Ср", isWeekend: false, activity: "gym",    defaults: { "Передтрен": "Класика", "Сніданок": "Білковий омлет",  "Обід": "Зібраний Боул",     "Вечеря": "Риба + Зелень"     } },
  { day: "Чт", isWeekend: false, activity: "cardio", defaults: { "Передтрен": "Баланс",  "Сніданок": "Breakfast Wrap",  "Обід": "Паста-конструктор", "Вечеря": "Солодкий Сир"      } },
  { day: "Пт", isWeekend: false, activity: "gym",    defaults: { "Передтрен": "Класика", "Сніданок": "Білковий омлет",  "Обід": "Печена тарілка"                                    } },
  { day: "Сб", isWeekend: true,  activity: "cardio", defaults: { "Передтрен": "Баланс",  "Сніданок": "Сирні панкейки",  "Обід": "Паста-конструктор", "Вечеря": "Овочеве Рагу"      } },
  { day: "Нд", isWeekend: true,  activity: "cardio", defaults: { "Передтрен": "Енергія", "Сніданок": "Тости з тунцем", "Обід": "Зігріваючий Суп",   "Вечеря": "Протеїновий Салат" } },
];

export const MEAL_TYPE_STYLE: Record<string, { active: string; inactive: string }> = {
  "Передтрен": {
    active:   "bg-[#43d98c] text-[#1a1d27] font-bold",
    inactive: "bg-[#43d98c]/10 text-[#43d98c]/60 hover:bg-[#43d98c]/25",
  },
  "Сніданок": {
    active:   "bg-[#6c63ff] text-white font-bold",
    inactive: "bg-[#6c63ff]/10 text-[#6c63ff]/60 hover:bg-[#6c63ff]/25",
  },
  "Обід": {
    active:   "bg-[#f7a948] text-[#1a1d27] font-bold",
    inactive: "bg-[#f7a948]/10 text-[#f7a948]/60 hover:bg-[#f7a948]/25",
  },
  "Вечеря": {
    active:   "bg-[#ff6584] text-white font-bold",
    inactive: "bg-[#ff6584]/10 text-[#ff6584]/60 hover:bg-[#ff6584]/25",
  },
};

export const CHOICES_STORAGE_KEY = "visual-plan-choices";
export const CHOICES_EVENT = "visual-plan-choices-changed";

export const SCHEDULE_DEFAULT_CHOICES: Record<string, string> = {};
