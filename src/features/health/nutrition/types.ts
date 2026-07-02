export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface Meal {
  type: MealType;
  label: string;
  title: string;
  ingredients: string[];
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

export interface ShoppingItem {
  id: string;
  name: string;
  qty: string;
  note?: string;
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
