import { getFood, type FoodServing } from "../src/lib/fatsecret/client";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function printMacros(foodId: string, label: string) {
  const detail = await getFood(foodId);
  const servings = Array.isArray(detail.servings.serving)
    ? detail.servings.serving
    : [detail.servings.serving];
  // Find a ~100g serving to read per-100g macros directly.
  const s100 = servings.find((s: FoodServing) => s.metric_serving_unit === "g") as FoodServing | undefined;
  console.log(`${label} (food_id=${foodId}, "${detail.food_name}"):`);
  if (s100) {
    console.log(
      `  per ${s100.metric_serving_amount}g: kcal=${s100.calories} protein=${s100.protein} fat=${s100.fat} carbs=${s100.carbohydrate}`,
    );
  } else {
    console.log("  no metric serving found");
  }
  await sleep(1200);
}

async function main() {
  console.log("=== Mackerel: raw vs cooked ===");
  await printMacros("2008", "Mackerel (raw)");
  await printMacros("2009", "Cooked Mackerel");

  console.log("\n=== Chicken thigh: raw candidates ===");
  await printMacros("1695", "Chicken Thigh");
  await printMacros("1697", "Chicken Thigh (Skin Not Eaten)");

  console.log("\n=== Pork chop candidates ===");
  await printMacros("36081", "Pork Chops (Top Loin, Boneless)");
  await printMacros("36057", "Pork Chops (Center Loin, Bone-In, Cooked, Broiled)");
}

main();
