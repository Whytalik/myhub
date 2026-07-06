/**
 * One-time helper: for every tracked/prepared product in PRODUCTS, searches
 * FatSecret's food database (OAuth2 client-credentials, read-only) and prints
 * gram-based serving candidates to review. Run with:
 *
 *   set -a; source .env.local; set +a; npx tsx scripts/fatsecret-map-products.ts
 *
 * Output is for manual review — copy the chosen food_id/serving_id/grams
 * into src/features/health/nutrition/fatsecret-mapping.ts by hand. This
 * script never writes that file itself: FatSecret's search doesn't
 * understand Ukrainian, and automatic top-pick would silently mismatch
 * regional foods (bryndza, syrniki, suluguni) too often to trust blindly.
 */
import { PRODUCTS } from "../src/features/health/nutrition/products";
import { searchFoods, getFood, type FoodServing } from "../src/lib/fatsecret/client";

/** English search terms — FatSecret's database has no Ukrainian-language search. */
const SEARCH_QUERY: Record<string, string> = {
  eggs: "egg",
  bread: "whole wheat bread",
  freshVeg: "mixed vegetables",
  oil: "olive oil",
  chickenMarinated: "chicken thigh",
  friedChicken: "fried chicken thigh",
  chickenHearts: "chicken hearts",
  potato: "potato",
  milk: "milk",
  butter: "butter",
  tomato: "tomato",
  cucumber: "cucumber",
  pepper: "bell pepper",
  onion: "onion",
  brynza: "feta cheese",
  yogurtGreek: "greek yogurt",
  berries: "mixed berries",
  fruitMix: "mixed fruit",
  banana: "banana",
  oats: "oats",
  proteinPowder: "whey protein powder",
  buckwheat: "buckwheat groats",
  rice: "white rice",
  arugula: "arugula",
  icebergLettuce: "iceberg lettuce",
  hardCheese: "cheddar cheese",
  suluguni: "mozzarella cheese",
  cottageCheese: "cottage cheese",
  soySauce: "soy sauce",
  honey: "honey",
  mackerel: "mackerel",
  tunaCanned: "canned tuna in water",
  cornCanned: "canned corn",
  carrot: "carrot",
  sugar: "sugar",
  syrniki: "cottage cheese pancakes",
  mayo: "mayonnaise",
  mustardDijon: "dijon mustard",
  porkChop: "pork chop",
  cream: "heavy cream",
};

function findGramServings(servings: FoodServing | FoodServing[]): FoodServing[] {
  const list = Array.isArray(servings) ? servings : [servings];
  return list.filter((s) => s.metric_serving_unit === "g");
}

async function main() {
  const productsToMap = Object.values(PRODUCTS).filter((p) => p.kind !== "pantry");
  console.log(`Mapping ${productsToMap.length} products...\n`);

  for (const product of productsToMap) {
    const query = SEARCH_QUERY[product.key];
    if (!query) {
      console.log(`⚠ ${product.key} (${product.nameUk}) — no SEARCH_QUERY entry, skipping`);
      continue;
    }

    console.log(`\n=== ${product.key} (${product.nameUk}) — query: "${query}" ===`);

    try {
      const results = await searchFoods(query);

      if (results.length === 0) {
        console.log("  no matches found");
        continue;
      }

      for (const candidate of results.slice(0, 3)) {
        console.log(`  food_id=${candidate.food_id}  "${candidate.food_name}"`);
        try {
          const detail = await getFood(candidate.food_id);
          const gramServings = findGramServings(detail.servings.serving);
          const servingInfo = gramServings.length
            ? gramServings
                .map((s) => `serving_id=${s.serving_id} (${s.metric_serving_amount}g)`)
                .join(", ")
            : "no gram-based serving found";
          console.log(`    ${servingInfo}`);
        } catch (error) {
          console.log(`    ERROR: ${error instanceof Error ? error.message : error}`);
        }
        // FatSecret rate-limits — small delay between calls to stay well under it.
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.log(`  ERROR: ${error instanceof Error ? error.message : error}`);
    }
  }
}

main();
