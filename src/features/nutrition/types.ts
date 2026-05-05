import { Goal } from "@/app/generated/prisma";

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
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}

export interface DishIngredientInput {
  productId: string;
  cookingMethodId?: string;
  rawWeight: number;
}

export interface CreateDishInput {
  name: string;
  description?: string;
  servings: number;
  ingredients: DishIngredientInput[];
}

export interface UpdateDishInput extends Partial<CreateDishInput> {
  id: string;
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
