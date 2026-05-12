import { Goal } from "@/app/generated/prisma";
import type { DishType } from "./constants/dish-types";
import type { Store } from "./constants/stores";

export type { DishType } from "./constants/dish-types";
export type { Store } from "./constants/stores";

export interface CreateProductInput {
  name: string;
  caloriesPer100: number;
  proteinPer100: number;
  fatPer100: number;
  carbsPer100: number;
  fiberPer100: number;
  unit: string;
  standardPackageAmount: number;
  price?: number;
  category: string;
  stores?: Store[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}

export interface DishIngredientInput {
  productId: string;
  cookingMethodId?: string;
  rawWeight: number;
  alternatives?: string[];
}

export interface CreateDishInput {
  name: string;
  description?: string;
  servings: number;
  type?: DishType;
  ingredients: DishIngredientInput[];
}

export interface UpdateDishInput extends Partial<CreateDishInput> {
  id: string;
}

export interface CreateProductEntryInput {
  mealSlotId: string;
  productId: string;
  portionWeight: number;
}

export interface CreatePersonInput {
  name: string;
  goal: Goal;
  targetKcal: number;
  proteinPct: number;
  fatPct: number;
  carbsPct: number;
  fiberGrams: number;
}

export interface UpdatePersonInput extends Partial<CreatePersonInput> {
  id: string;
}

export interface CreateWeekPlanInput {
  startDate: Date;
  personIds: string[];
}

export type { ActionResult } from "@/lib/action-utils";
