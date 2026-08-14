/** Реальний день тижня — лише для UI-фільтрів/дат шоплиста. НЕ ідентифікує рецепт,
 *  див. `SetId`/`cycle.ts`: той самий сет з'являється на різних парах реальних днів
 *  тижня залежно від того, який з 2 тижнів 14-денного циклу зараз іде. */
export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/** Ідентифікатор одного з 7 рецептів-сетів у фіксованому порядку ротації —
 *  див. `cycle.ts` для мапінгу дата → { setIndex, subDay }. */
export type SetId = "set1" | "set2" | "set3" | "set4" | "set5" | "set6" | "set7";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MacroItem {
  food: string;
  vitalii: number;
  olesia: number;
  /** Назва сервірувального компонента (напр. "Грецький салат"), якщо цей
   *  інгредієнт — частина складеної страви, а не окрема позиція на тарілці. */
  component?: string;
}

export interface Meal {
  type: MealType;
  label: string;
  title: string;
  ingredients: string[];

  macroItems?: MacroItem[];
}

export interface PrepSection {
  title: string;
  steps: string[];
}

export interface ThawInstruction {
  title: string;
  action: string;
  note?: string;
}

export interface DayPlan {
  setId: SetId;
  /** Назва страви (напр. "Курячі шашлики") — рендериться як заголовок дня. */
  labelUk: string;
  /** Компактний лейбл таб-стрічки, напр. "Сет 1". */
  labelShort: string;
  /** День 1 сета. */
  meals: Meal[];
  prepSteps?: PrepSection[];
  note?: string;
  /** Що розморозити/підготувати напередодні цього сета — читається з `plan[tomorrow.setIndex]`
   *  завтрашнього дня, а не хардкодиться в компоненті. */
  thawInstructions?: ThawInstruction[];

  /** День 2 сета — присутній ЛИШЕ коли він відрізняється від дня 1 (сет-виняток із 2
   *  різних страв). Відсутність = день 2 ідентичний дню 1 (дефолт для 6 із 7 сетів). */
  day2Meals?: Meal[];
  day2PrepSteps?: PrepSection[];
  day2Note?: string;
  day2LabelUk?: string;
  day2ThawInstructions?: ThawInstruction[];
}

export type ShoppingDay = "sun" | "wed";

/** Одне входження продукту в сет: `day` не задано = обидва дні сета (дефолт), `1`/`2` —
 *  лише конкретний день (потрібно для сету-винятку з 2 різними стравами, і для сетів,
 *  чия пара днів перетинає межу тижневих закупівель — див. `cycle.ts`). */
export interface SetOccurrence {
  set: SetId;
  day?: 1 | 2;
}

/**
 * A quantity derived from `macroItems` instead of hand-typed — `sumMacroGramsForSetsMulti`
 * sums the given product key(s) over the given set-occurrences; `grams` (default 0) is an
 * explicit, visible-in-the-diff manual addition for amounts `macroItems` can't see
 * (e.g. the 1 egg a meal-prep recipe uses that never becomes its own macroItem —
 * see [[nutrition_products_single_source]] / quantities.ts for why this must stay
 * explicit rather than silently folded into a hardcoded total).
 */
export interface ComputedQuantity {
  food: string;
  extraFood?: string[];
  sets: SetOccurrence[];
  grams?: number;
  unit?: "g" | "piece" | "ml";
  /** Відсоток відходів (напр. 15 = +15% до загальної ваги). */
  wastePercent?: number;
}

export interface ShoppingItem {
  id: string;
  /** Product key from `products.ts` — when set, the display name derives from
   *  `getProductName(food)` instead of `name`, so a rename only happens once. */
  food?: string;
  /** Buy-spec detail that products.ts has no reason to track (fat %, fresh-frozen,
   *  in own juice...) — appended after the derived name when `food` is set. */
  qualifier?: string;
  /** Full override name — required when `food` isn't set (item has no PRODUCTS entry). */
  name?: string;
  /** Either a computed quantity (preferred, when macroItems fully covers this item)
   *  or a plain hand-typed string (spices, pantry items, anything macroItems can't see). */
  computedQty?: ComputedQuantity;
  qty?: string;
  note?: string;
  options?: string[];
  price?: number;
  buyDay: ShoppingDay;
}

export interface ShoppingCategory {
  id: string;
  title: string;
  items: ShoppingItem[];
}

export interface MacroTargets {
  protein: number;
  fat: number;
  carbs: number;
}

export interface Profile {
  id: string;
  name: string;
  goal: string;
  kcal: number;
  macros: MacroTargets;
}
