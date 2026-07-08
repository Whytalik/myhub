export const MORNING_ROUTINE = [
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
] as const;

export interface RoutineItem {
  id: string;
  time: string;
  label: string;
  labelUk: string;
  icon: string;
}

export const getMorningRoutine = (isTrainingDay: boolean): RoutineItem[] => {
  const base = [
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
    },
  ];

  if (isTrainingDay) {
    return [
      ...base,
      {
        id: "m_gym",
        time: "07:00",
        label: "Training in the gym (07:00 - 08:30)",
        labelUk: "Тренування в залі (07:00 - 08:30)",
        icon: "Dumbbell",
      },
      {
        id: "m_cook",
        time: "08:45",
        label: "Cooking food (08:45 - 09:30)",
        labelUk: "Приготування їжі (08:45 - 09:30)",
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
        time: "07:00",
        label: "Cooking food (07:00 - 08:00)",
        labelUk: "Приготування їжі (07:00 - 08:00)",
        icon: "Utensils",
      },
    ];
  }
};

export const EVENING_ROUTINE = [
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
  },
  {
    id: "e_sleep",
    time: "22:00",
    label: "Sleep",
    labelUk: "Спати",
    icon: "Moon",
  },
] as const;

export const ROUTINE_ITEMS = [...MORNING_ROUTINE, ...EVENING_ROUTINE];

export type RoutineItemId = (typeof ROUTINE_ITEMS)[number]["id"];
export type RoutineMap = Record<string, boolean>;
