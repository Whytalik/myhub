export interface RoutineSubItem {
  id: string;
  labelUk: string;
  days?: number[]; // native Date.getDay() convention (Sun=0..Sat=6); omitted = every day
}

export interface RoutineItem {
  id: string;
  time?: string;
  label: string;
  labelUk: string;
  icon: string;
  subItems?: RoutineSubItem[];
}

const MORNING_HYGIENE_SUBITEMS: RoutineSubItem[] = [
  {
    id: "m_hygiene_cleanse",
    labelUk:
      "Вмивання м'яким гелем та нанесення легкого зволожувального крем-гелю або SPF-флюїду (1 хв)",
  },
];

const EVENING_HYGIENE_SUBITEMS: RoutineSubItem[] = [
  {
    id: "e_hygiene_cleanse",
    labelUk:
      "Вмивання гелем із саліциловою кислотою (BHA) — глибоко розчиняє жир у порах, прибирає чорні цятки та свіжі висипання (2 хв)",
  },
  {
    id: "e_hygiene_moisturize",
    labelUk: "Нанесення зволожувального засобу після вмивання",
  },
  {
    id: "e_hygiene_hair_wash",
    labelUk: "Миття голови сульсеновим шампунем",
    days: [2, 0], // Tue, Sun
  },
  {
    id: "e_hygiene_conditioner",
    labelUk: "Нанесення кондиціонера на 1 хв для пом'якшення довжини волосся",
    days: [2, 4, 0], // Tue, Thu, Sun
  },
  {
    id: "e_hygiene_shave",
    labelUk: "Гоління",
    days: [2, 4, 0], // Tue, Thu, Sun
  },
];

export const MORNING_ROUTINE: RoutineItem[] = [
  {
    id: "m_wake",
    time: "06:30",
    label: "Wake up and get out of bed",
    labelUk: "Прокинутися та встати з ліжка",
    icon: "AlarmClock",
  },
  {
    id: "m_water",
    time: "06:32",
    label: "Drink a glass of water",
    labelUk: "Випити склянку води",
    icon: "Droplets",
  },
  {
    id: "m_hygiene",
    time: "06:35",
    label: "Water procedures",
    labelUk: "Водні процедури",
    icon: "ShowerHead",
    subItems: MORNING_HYGIENE_SUBITEMS,
  },
  {
    id: "m_outside",
    time: "06:50",
    label: "Go outside for 15 minutes",
    labelUk: "Вийти на вулицю на 15 хвилин",
    icon: "Sun",
  },
  {
    id: "m_gym",
    time: "07:00",
    label: "Training in the gym (07:00 - 08:30)",
    labelUk: "Тренування в залі (07:00 - 08:30)",
    icon: "Dumbbell",
  },
  {
    id: "m_cook",
    time: "07:00",
    label: "Cooking food",
    labelUk: "Приготування їжі",
    icon: "Utensils",
  },
];

export const getMorningRoutine = (isTrainingDay: boolean): RoutineItem[] => {
  const base: RoutineItem[] = [
    {
      id: "m_wake",
      time: "06:30",
      label: "Wake up and get out of bed",
      labelUk: "Прокинутися та встати з ліжка",
      icon: "AlarmClock",
    },
    {
      id: "m_water",
      time: "06:32",
      label: "Drink a glass of water",
      labelUk: "Випити склянку води",
      icon: "Droplets",
    },
    {
      id: "m_hygiene",
      time: "06:35",
      label: "Water procedures",
      labelUk: "Водні процедури",
      icon: "ShowerHead",
      subItems: MORNING_HYGIENE_SUBITEMS,
    },
  ];

  if (isTrainingDay) {
    return [
      ...base,
      {
        id: "m_gym",
        label: "Training in the gym",
        labelUk: "Тренування в залі",
        icon: "Dumbbell",
      },
      {
        id: "m_cook",
        label: "Cooking food",
        labelUk: "Приготування їжі",
        icon: "Utensils",
      },
    ];
  } else {
    return [
      ...base,
      {
        id: "m_outside",
        time: "06:50",
        label: "Go outside for 15 minutes",
        labelUk: "Вийти на вулицю на 15 хвилин",
        icon: "Sun",
      },
      {
        id: "m_cook",
        label: "Cooking food",
        labelUk: "Приготування їжі",
        icon: "Utensils",
      },
    ];
  }
};

export const EVENING_ROUTINE: RoutineItem[] = [
  {
    id: "e_kaizen",
    time: "20:30 - 21:00",
    label: "Kaizen time",
    labelUk: "Кайдзен час",
    icon: "Lightbulb",
  },
  {
    id: "e_devices_off",
    time: "21:00",
    label: "Turn off all devices",
    labelUk: "Вимкнути всі пристрої",
    icon: "PhoneOff",
  },
  {
    id: "e_water_prep",
    time: "21:05",
    label: "Pour water for tomorrow",
    labelUk: "Налити воду на завтра",
    icon: "Droplets",
  },
  {
    id: "e_walk",
    time: "21:10",
    label: "Take a walk",
    labelUk: "Прогулятися",
    icon: "Footprints",
  },
  {
    id: "e_hygiene",
    time: "21:30",
    label: "Water procedures",
    labelUk: "Водні процедури",
    icon: "ShowerHead",
    subItems: EVENING_HYGIENE_SUBITEMS,
  },
  {
    id: "e_sleep",
    time: "22:00",
    label: "Sleep",
    labelUk: "Спати",
    icon: "Moon",
  },
];

export const ROUTINE_ITEMS = [...MORNING_ROUTINE, ...EVENING_ROUTINE];

export type RoutineItemId = (typeof ROUTINE_ITEMS)[number]["id"];
export type RoutineMap = Record<string, boolean>;
