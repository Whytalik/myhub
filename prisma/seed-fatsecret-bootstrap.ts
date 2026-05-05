import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { ProductStatus } from '../src/app/generated/prisma';

const FATSECRET_CLIENT_ID = process.env.FATSECRET_CLIENT_ID;
const FATSECRET_CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET;
const TOKEN_URL = 'https://oauth.fatsecret.com/connect/token';
const API_URL = 'https://platform.fatsecret.com/rest/server.api';

async function getAccessToken(): Promise<string> {
  if (!FATSECRET_CLIENT_ID || !FATSECRET_CLIENT_SECRET) {
    throw new Error('FATSECRET_CLIENT_ID or FATSECRET_CLIENT_SECRET missing');
  }
  const credentials = btoa(`${FATSECRET_CLIENT_ID}:${FATSECRET_CLIENT_SECRET}`);
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=basic',
  });
  const data = await response.json() as { access_token: string };
  return data.access_token;
}

async function apiRequest(token: string, method: string, params: Record<string, string>) {
  const searchParams = new URLSearchParams({ method, format: 'json', region: 'UA', language: 'uk', ...params });
  const response = await fetch(`${API_URL}?${searchParams.toString()}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.json();
}

const CORE_FOODS = [
  { name: 'Banana', category: 'FRUITS' },
  { name: 'Apple', category: 'FRUITS' },
  { name: 'Broccoli', category: 'VEGETABLES' },
  { name: 'Tomato', category: 'VEGETABLES' },
  { name: 'Chicken breast', category: 'POULTRY' },
  { name: 'Beef', category: 'MEAT' },
  { name: 'Buckwheat', category: 'GRAINS' },
  { name: 'Rice', category: 'GRAINS' },
  { name: 'Egg', category: 'EGGS' },
  { name: 'Almond', category: 'NUTS_SEEDS' },
  { name: 'Salmon', category: 'SEAFOOD' },
  { name: 'Cottage cheese', category: 'DAIRY' },
  { name: 'Milk', category: 'DAIRY' },
  { name: 'Oatmeal', category: 'GRAINS' },
  { name: 'Lentils', category: 'LEGUMES' },
];

function normalizeTo100g(value: string | number | undefined, servingAmount: number): number {
  if (!value || isNaN(Number(value))) return 0;
  return (Number(value) / servingAmount) * 100;
}

interface FSFoodServing {
  metric_serving_unit?: string;
  metric_serving_amount?: string;
  calories?: string;
  protein?: string;
  fat?: string;
  carbohydrate?: string;
  fiber?: string;
}

interface FSFoodDetails {
  food_name: string;
  servings: {
    serving: FSFoodServing | FSFoodServing[];
  }
}

interface FSSearchResponse {
  foods?: {
    food?: {
      food_id: string;
    } | {
      food_id: string;
    }[]
  }
}

interface FSDetailsResponse {
  food: FSFoodDetails;
}

async function main() {
  console.log('🚀 Starting FatSecret Bootstrap...');
  const token = await getAccessToken();
  console.log('✅ Auth successful.');

  for (const item of CORE_FOODS) {
    console.log(`🔍 Searching for: ${item.name}...`);
    try {
      const searchData = await apiRequest(token, 'foods.search', { search_expression: item.name, max_results: '1' }) as FSSearchResponse;
      
      let foodId: string | undefined;
      if (searchData.foods?.food) {
        foodId = Array.isArray(searchData.foods.food) 
          ? searchData.foods.food[0].food_id 
          : searchData.foods.food.food_id;
      }
      
      if (!foodId) {
        console.log(`  ⚠️ No results for ${item.name}`);
        continue;
      }

      const detailsData = await apiRequest(token, 'food.get.v2', { food_id: foodId }) as FSDetailsResponse;
      const food = detailsData.food;
      const servings = Array.isArray(food.servings.serving) ? food.servings.serving : [food.servings.serving];
      const metricServing = servings.find((s) => s.metric_serving_unit === 'g' || s.metric_serving_unit === 'ml') || servings[0];
      const servingAmount = Number(metricServing.metric_serving_amount) || 100;

      await prisma.foodProduct.upsert({
        where: { id: `fs-bootstrap-${foodId}` },
        update: {},
        create: {
          id: `fs-bootstrap-${foodId}`,
          userId: null,
          name: food.food_name,
          caloriesPer100: normalizeTo100g(metricServing.calories, servingAmount),
          proteinPer100: normalizeTo100g(metricServing.protein, servingAmount),
          fatPer100: normalizeTo100g(metricServing.fat, servingAmount),
          carbsPer100: normalizeTo100g(metricServing.carbohydrate, servingAmount),
          fiberPer100: normalizeTo100g(metricServing.fiber, servingAmount),
          unit: metricServing.metric_serving_unit === 'ml' ? 'ML' : 'GRAM',
          standardPackageAmount: 100,
          category: item.category,
          nutritionSource: 'FATSECRET',
          status: 'ACTIVE' as ProductStatus,
        },
      });
      console.log(`  ✅ Seeded: ${food.food_name}`);
    } catch (e) {
      console.error(`  ❌ Failed ${item.name}:`, e);
    }
    
    // Tiny delay to be nice to API
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('✨ Bootstrap complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
