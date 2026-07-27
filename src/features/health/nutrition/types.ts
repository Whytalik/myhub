export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

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

export interface DayPlan {
  weekday: Weekday;
  labelUk: string;
  labelShort: string;
  meals: Meal[];
  prepSteps?: PrepSection[];
  note?: string;
}

export type ShoppingDay = "sun" | "wed";

/**
 * A quantity derived from `macroItems` instead of hand-typed — `sumMacroGramsMulti`
 * sums the given product key(s) over the given weekdays; `grams` (default 0) is an
 * explicit, visible-in-the-diff manual addition for amounts `macroItems` can't see
 * (e.g. the 1 egg a meal-prep recipe uses that never becomes its own macroItem —
 * see [[nutrition_products_single_source]] / quantities.ts for why this must stay
 * explicit rather than silently folded into a hardcoded total).
 */
export interface ComputedQuantity {
  food: string;
  extraFood?: string[];
  weekdays: Weekday[];
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
