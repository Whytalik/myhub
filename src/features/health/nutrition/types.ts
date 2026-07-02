export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MacroItem {
  food: string; // key into FOOD_NUTRITION
  vitalii: number; // grams for Vitalii
  olesia: number; // grams for Olesia
}

export interface Meal {
  type: MealType;
  label: string;
  title: string;
  ingredients: string[];
  // Structured breakdown used to calculate actual kcal/macros for the day.
  // Empty when this meal is a second portion of another meal that day
  // (e.g. dinner = leftover lunch) to avoid double-counting.
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

export interface ShoppingItem {
  id: string;
  name: string;
  qty: string;
  note?: string;
  options?: string[];
  price?: number;
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
