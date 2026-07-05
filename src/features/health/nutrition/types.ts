export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MacroItem {
  food: string;
  vitalii: number;
  olesia: number;
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
  name: string;
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
