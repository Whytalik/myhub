"use server";

import { FatSecretService } from "../services/fatsecret.service";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { ProductStatus } from "@/app/generated/prisma";

/**
 * Normalizes FatSecret nutrient values to a 100g/ml base.
 */
function normalizeTo100g(value: string | number | undefined, servingAmount: number): number {
  if (!value || isNaN(Number(value))) return 0;
  if (servingAmount <= 0) return Number(value);
  return (Number(value) / servingAmount) * 100;
}

interface FatSecretFoodSearchResult {
  food_id: string;
  food_name: string;
  brand_name?: string;
  food_description: string;
  food_type: string;
}

export async function searchFatSecretAction(query: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const results = await FatSecretService.searchProducts(query) as FatSecretFoodSearchResult[];
    return results.map((food) => ({
      id: food.food_id,
      name: food.food_name,
      brand: food.brand_name || "Generic",
      description: food.food_description,
      type: food.food_type,
    }));
  } catch (error) {
    console.error("FatSecret search error:", error);
    throw new Error("Failed to search FatSecret database.");
  }
}

interface FatSecretServing {
  metric_serving_unit?: string;
  metric_serving_amount?: string;
  calories?: string;
  protein?: string;
  fat?: string;
  carbohydrate?: string;
  fiber?: string;
}

interface FatSecretFoodDetails {
  food_name: string;
  brand_name?: string;
  servings: {
    serving: FatSecretServing | FatSecretServing[];
  };
}

export async function importFatSecretProductAction(foodId: string, category: string = "OTHER") {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const food = await FatSecretService.getProductDetails(foodId) as FatSecretFoodDetails;
    
    // Find a metric serving (grams or ml) if available, otherwise use the first one
    const servings = Array.isArray(food.servings.serving) 
      ? food.servings.serving 
      : [food.servings.serving];
    
    const metricServing = servings.find((s) => s.metric_serving_unit === "g" || s.metric_serving_unit === "ml") || servings[0];
    const servingAmount = Number(metricServing.metric_serving_amount) || 100;

    const product = await prisma.foodProduct.create({
      data: {
        userId: session.user.id,
        name: `${food.food_name}${food.brand_name ? ` (${food.brand_name})` : ""}`,
        caloriesPer100: normalizeTo100g(metricServing.calories, servingAmount),
        proteinPer100: normalizeTo100g(metricServing.protein, servingAmount),
        fatPer100: normalizeTo100g(metricServing.fat, servingAmount),
        carbsPer100: normalizeTo100g(metricServing.carbohydrate, servingAmount),
        fiberPer100: normalizeTo100g(metricServing.fiber, servingAmount),
        unit: metricServing.metric_serving_unit === "ml" ? "ML" : "GRAM",
        standardPackageAmount: 100,
        category: category,
        nutritionSource: "FATSECRET",
        status: "ACTIVE" as ProductStatus,
      },
    });

    revalidatePath("/nutrition");
    return { success: true, product };
  } catch (error) {
    console.error("FatSecret import error:", error);
    throw new Error("Failed to import product from FatSecret.");
  }
}
