import type { DishType } from "./constants/dish-types";
import { Store } from "@/app/generated/prisma";

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

export interface CartItem {
  id: string;
  productId: string;
  requiredRawGrams: number;
  availableGrams: number | null;
  packagesCount: number | null;
  totalCost: number | null;
  status: string;
  product: {
    name: string;
    price: number | null;
    standardPackageAmount: number | null;
    category: string | null;
    stores: Store[];
  };
  dishes: { dishName: string; dishId: string }[];
}

export type { ActionResult } from "@/lib/action-utils";
