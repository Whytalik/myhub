import { z } from "zod";

const DISH_TYPES = ["MAIN", "SALAD", "SOUP", "SIDE", "SNACK", "SAUCE", "MARINADE", "BASE"] as const;
const STORES = ["NASHA_RYABA", "BAZAR", "ATB", "SILPO", "POLISSYA", "METRO", "FORA"] as const;

export const createPersonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetKcal: z.number().min(500).max(10000),
  proteinPct: z.number().min(0).max(100),
  fatPct: z.number().min(0).max(100),
  carbsPct: z.number().min(0).max(100),
  fiberGrams: z.number().min(0),
  goal: z.enum(["GAIN", "MAINTAIN", "LOSE"]),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  caloriesPer100: z.number().min(0),
  proteinPer100: z.number().min(0),
  fatPer100: z.number().min(0),
  carbsPer100: z.number().min(0),
  fiberPer100: z.number().min(0),
  unit: z.string().min(1, "Unit is required"),
  standardPackageAmount: z.number().min(1),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0).optional(),
  stores: z.array(z.enum(STORES)).optional(),
});

export const dishIngredientSchema = z.object({
  productId: z.string().min(1),
  cookingMethodId: z.string().optional(),
  rawWeight: z.number().positive("Weight must be positive"),
});

export const createDishSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  servings: z.number().min(1),
  type: z.enum(DISH_TYPES).optional(),
  ingredients: z.array(dishIngredientSchema).min(1, "At least one ingredient required"),
});

export const createProductEntrySchema = z.object({
  mealSlotId: z.string().min(1),
  productId: z.string().min(1),
  portionWeight: z.number().positive("Weight must be positive"),
});

export type CreatePersonFormData = z.infer<typeof createPersonSchema>;
export type CreateProductFormData = z.infer<typeof createProductSchema>;
export type CreateDishFormData = z.infer<typeof createDishSchema>;
export type CreateProductEntryFormData = z.infer<typeof createProductEntrySchema>;
