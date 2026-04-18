import { Unit, Priority, MealSlot, ProductSource, ProductStatus, ProductState, ProductCategory } from "@/app/generated/prisma";

export interface CreateProductInput {
  name: string;
  category?: ProductCategory;
  source: ProductSource;
  status?: ProductStatus;
  state?: ProductState;
  unit?: Unit;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  fiber?: number;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}

export interface DishIngredientInput {
  productId: string;
  amount: number;
  unit: Unit;
}

export interface CreateDishInput {
  personId: string;
  name: string;
  description?: string;
  priority?: Priority;
  yield?: number;
  ingredients: DishIngredientInput[];
}

export interface UpdateDishInput extends Partial<CreateDishInput> {
  id: string;
}

export interface DayPlanEntryInput {
  dishId: string;
  mealSlot: MealSlot;
  servings?: number;
  priority?: Priority;
}

export interface CreateDayPlanInput {
  personId: string;
  date: Date;
  weekPlanId?: string;
  templateId?: string;
  entries: DayPlanEntryInput[];
}

export interface CreateWeekPlanInput {
  personId: string;
  name?: string;
  startDate: Date;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
