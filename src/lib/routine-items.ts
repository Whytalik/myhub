export const MORNING_ROUTINE_NO_TRAIN = [
  { 
    id: "m_600_wake",
    time: "06:00",
    label: "Wake up and get out of bed", 
    labelUk: "Прокинутися та встати з ліжка",
    icon: "AlarmClock"
  },
  { 
    id: "m_605_water",
    time: "06:05",
    label: "Drink a large glass of water", 
    labelUk: "Випити велику склянку води",
    icon: "Droplets"
  },
  { 
    id: "m_610_nsdr", 
    time: "06:10",
    label: "Do 10m NSDR or Meditation", 
    labelUk: "Зробити 10 хв NSDR (відпочинок)",
    icon: "Brain"
  },
  { 
    id: "m_620_stability", 
    time: "06:20",
    label: "Do stability & mobility drill", 
    labelUk: "Зробити розминку на мобільність",
    icon: "Move"
  },
  { 
    id: "m_630_tasks",  
    time: "06:30",
    label: "Review tasks planned yesterday", 
    labelUk: "Переглянути плани на день",
    icon: "ClipboardCheck"
  },
  { 
    id: "m_715_light",    
    time: "07:15",
    label: "Get 10m of sunlight (walk)", 
    labelUk: "Вийти на сонце (10 хв прогулянки)",
    icon: "Sun"
  },
] as const;

export const MORNING_ROUTINE_TRAIN = [
  { 
    id: "t_600_wake",     
    time: "06:00",
    label: "Wake up and get out of bed", 
    labelUk: "Прокинутися та встати з ліжка",
    icon: "AlarmClock"
  },
  { 
    id: "t_605_water",
    time: "06:05",
    label: "Drink a large glass of water", 
    labelUk: "Випити велику склянку води",
    icon: "Droplets"
  },
  { 
    id: "t_610_warmup",   
    time: "06:10",
    label: "Do dynamic warm-up", 
    labelUk: "Зробити динамічну розминку",
    icon: "Zap"
  },
  { 
    id: "t_620_pack",     
    time: "06:20",
    label: "Pack bag for the gym", 
    labelUk: "Зібрати речі в зал",
    icon: "Briefcase"
  },
  { 
    id: "t_640_leave",    
    time: "06:40",
    label: "Active commute (Sunlight)", 
    labelUk: "Йти до залу (отримати сонце)",
    icon: "Footprints"
  },
  { 
    id: "t_700_workout",  
    time: "07:00",
    label: "Complete main workout session", 
    labelUk: "Провести тренування в залі",
    icon: "Dumbbell"
  },
  { 
    id: "t_815_recovery", 
    time: "08:15",
    label: "Take cold shower & hydrate", 
    labelUk: "Прийняти холодний душ та попити",
    icon: "ThermometerSnowflake"
  },
] as const;

export const EVENING_ROUTINE_NO_TRAIN = [
  {
    id: "e_finish_work",
    time: "18:00",
    label: "Finish work + Short stretch",
    labelUk: "Завершити роботу та зробити розтяжку",
    icon: "LogOut"
  },
  {
    id: "e_study_long",
    time: "18:10",
    label: "Deep Study (80-90 min)",
    labelUk: "Провести блок навчання (80-90 хв)",
    icon: "GraduationCap"
  },
  {
    id: "e_dinner",
    time: "19:30",
    label: "Eat healthy dinner",
    labelUk: "Повечеряти (білок + овочі)",
    icon: "Utensils"
  },
  {
    id: "e_cleaning",
    time: "20:00",
    label: "Light cleaning / Housework",
    labelUk: "Зробити легке прибирання",
    icon: "Sparkles"
  },
  {
    id: "e_hygiene",
    time: "20:20",
    label: "Hygiene (shower, face, shaving)",
    labelUk: "Прийняти душ та вмитися",
    icon: "ShowerHead"
  },
  {
    id: "e_prepare",
    time: "20:45",
    label: "Prepare for tomorrow",
    labelUk: "Підготувати речі та плани на завтра",
    icon: "ListTodo"
  },
  {
    id: "e_sleep_prep",
    time: "21:15",
    label: "Transition to sleep (NSDR)",
    labelUk: "Відкласти телефон та зробити NSDR",
    icon: "Moon"
  }
] as const;

export const EVENING_ROUTINE_TRAIN = [
  {
    id: "et_workout",
    time: "18:00",
    label: "Main Gym Session (1.5h)",
    labelUk: "Провести тренування в залі (1.5г)",
    icon: "Dumbbell"
  },
  {
    id: "et_commute",
    time: "19:30",
    label: "Commute home (Switch off)",
    labelUk: "Повернутися додому та перемкнутися",
    icon: "Car"
  },
  {
    id: "et_dinner",
    time: "20:00",
    label: "Post-workout dinner",
    labelUk: "Повечеряти після тренування",
    icon: "Utensils"
  },
  {
    id: "et_hygiene",
    time: "20:30",
    label: "Water procedures (hygiene)",
    labelUk: "Прийняти душ та вмитися",
    icon: "ShowerHead"
  },
  {
    id: "et_cleaning",
    time: "21:00",
    label: "Quick tidy up",
    labelUk: "Зробити швидке прибирання",
    icon: "Sparkles"
  },
  {
    id: "et_sleep_prep",
    time: "21:15",
    label: "Transition to sleep (NSDR)",
    labelUk: "Відкласти телефон та зробити NSDR",
    icon: "Moon"
  }
] as const;

export const EVENING_ROUTINE_FUN = [
  {
    id: "ef_finish",
    time: "18:00",
    label: "Finish work + Switch mode",
    labelUk: "Завершити роботу та перемкнути режим",
    icon: "LogOut"
  },
  {
    id: "ef_entertainment",
    time: "18:10",
    label: "Entertainment + Dinner",
    labelUk: "Розважатися та повечеряти (до 21:00)",
    icon: "Gamepad2"
  },
  {
    id: "ef_hygiene",
    time: "21:00",
    label: "Water procedures (hygiene)",
    labelUk: "Прийняти душ та вмитися",
    icon: "ShowerHead"
  },
  {
    id: "ef_sleep_prep",
    time: "21:25",
    label: "Calming down (no screens)",
    labelUk: "Вимкнути екрани та почати заспокоєння",
    icon: "Moon"
  }
] as const;

export const ROUTINE_ITEMS = [
  ...MORNING_ROUTINE_NO_TRAIN,
  ...MORNING_ROUTINE_TRAIN,
  ...EVENING_ROUTINE_NO_TRAIN,
  ...EVENING_ROUTINE_TRAIN,
  ...EVENING_ROUTINE_FUN,
];

export type RoutineItemId = typeof ROUTINE_ITEMS[number]["id"];
export type RoutineMap = Record<string, boolean>;
