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
  qty: string;
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
