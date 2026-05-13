import type { DishType } from "./constants/dish-types";

export type { DishType } from "./constants/dish-types";

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

export type { ActionResult } from "@/lib/action-utils";
