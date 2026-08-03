export interface RoutineSubItem {
  id: string;
  label: string;
  days?: number[]; // native Date.getDay() convention (Sun=0..Sat=6); omitted = every day
}

export interface RoutineItem {
  id: string;
  time?: string;
  label: string;
  icon: string;
  subItems?: RoutineSubItem[];
}

const MORNING_HYGIENE_SUBITEMS: RoutineSubItem[] = [
  {
    id: "m_hygiene_cleanse",
    label:
      "Cleanse with a gentle gel and apply a light moisturizing cream-gel or SPF fluid (1 min)",
  },
];

const EVENING_HYGIENE_SUBITEMS: RoutineSubItem[] = [
  {
    id: "e_hygiene_cleanse",
    label:
      "Cleanse with a salicylic acid (BHA) gel — deeply dissolves oil in pores, clears blackheads and fresh breakouts (2 min)",
  },
  {
    id: "e_hygiene_moisturize",
    label: "Apply moisturizer after cleansing",
  },
  {
    id: "e_hygiene_hair_wash",
    label: "Wash hair with Sulsena shampoo",
    days: [2, 0], // Tue, Sun
  },
  {
    id: "e_hygiene_conditioner",
    label: "Apply conditioner for 1 min to soften hair length",
    days: [2, 4, 0], // Tue, Thu, Sun
  },
  {
    id: "e_hygiene_shave",
    label: "Shave",
    days: [2, 4, 0], // Tue, Thu, Sun
  },
];

export const MORNING_ROUTINE: RoutineItem[] = [
  {
    id: "m_wake",
    time: "06:30",
    label: "Wake up and get out of bed",
    icon: "AlarmClock",
  },
  {
    id: "m_water",
    time: "06:32",
    label: "Drink a glass of water",
    icon: "Droplets",
  },
  {
    id: "m_hygiene",
    time: "06:35",
    label: "Water procedures",
    icon: "ShowerHead",
    subItems: MORNING_HYGIENE_SUBITEMS,
  },
  {
    id: "m_outside",
    time: "06:50",
    label: "Go outside for 15 minutes",
    icon: "Sun",
  },
  {
    id: "m_gym",
    time: "07:00",
    label: "Training in the gym (07:00 - 08:30)",
    icon: "Dumbbell",
  },
  {
    id: "m_cook",
    time: "07:00",
    label: "Cooking food",
    icon: "Utensils",
  },
];

export const getMorningRoutine = (isTrainingDay: boolean): RoutineItem[] => {
  const base: RoutineItem[] = [
    {
      id: "m_wake",
      time: "06:30",
      label: "Wake up and get out of bed",
      icon: "AlarmClock",
    },
    {
      id: "m_water",
      time: "06:32",
      label: "Drink a glass of water",
      icon: "Droplets",
    },
    {
      id: "m_hygiene",
      time: "06:35",
      label: "Water procedures",
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
        icon: "Dumbbell",
      },
      {
        id: "m_cook",
        label: "Cooking food",
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
        icon: "Sun",
      },
      {
        id: "m_cook",
        label: "Cooking food",
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
    icon: "Lightbulb",
  },
  {
    id: "e_devices_off",
    time: "21:00",
    label: "Turn off all devices",
    icon: "PhoneOff",
  },
  {
    id: "e_water_prep",
    time: "21:05",
    label: "Pour water for tomorrow",
    icon: "Droplets",
  },
  {
    id: "e_walk",
    time: "21:10",
    label: "Take a walk",
    icon: "Footprints",
  },
  {
    id: "e_hygiene",
    time: "21:30",
    label: "Water procedures",
    icon: "ShowerHead",
    subItems: EVENING_HYGIENE_SUBITEMS,
  },
  {
    id: "e_sleep",
    time: "22:00",
    label: "Sleep",
    icon: "Moon",
  },
];

export const ROUTINE_ITEMS = [...MORNING_ROUTINE, ...EVENING_ROUTINE];

export type RoutineItemId = (typeof ROUTINE_ITEMS)[number]["id"];
export type RoutineMap = Record<string, boolean>;
