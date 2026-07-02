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
] as const;

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
