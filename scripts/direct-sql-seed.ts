import "dotenv/config";
import fs from "fs";
import path from "path";
import { Client } from "pg";

async function main() {
  const envPath = path.resolve(process.cwd(), ".env.production.local");
  const envContent = fs.readFileSync(envPath, "utf-8");
  const dbLine = envContent.split(/\r?\n/).find(l => l.startsWith("POSTGRES_PRISMA_URL="));

  if (!dbLine) {
    console.error("❌ No POSTGRES_PRISMA_URL found");
    return;
  }

  const url = dbLine.split("=")[1].replace(/^"|"$/g, "");
  const client = new Client({ connectionString: url });

  try {
    await client.connect();
    console.log("🔗 Connected to Supabase via PG Client");

    // 1. Get User ID
    const userRes = await client.query("SELECT id FROM \"User\" WHERE email = 'hanmaster05@gmail.com' LIMIT 1");
    if (userRes.rows.length === 0) {
      console.error("❌ User not found");
      return;
    }
    const userId = userRes.rows[0].id;

    // 2. Global Products
    console.log("Seeding global products...");
    const products = [
      ['global-cheese', 'Сир кисломолочний 0-2%', 80, 16, 0.5, 3, 0, 'г', 250, 'Dairy'],
      ['global-flour', 'Борошно пшеничне', 340, 10, 1, 70, 3, 'г', 1000, 'Grocery'],
      ['global-lavash', 'Лаваш', 240, 8, 1, 48, 2, 'г', 200, 'Bakery'],
      ['global-chicken', 'Куряче філе', 110, 23, 2, 0, 0, 'г', 500, 'Meat'],
    ];

    for (const p of products) {
      await client.query(`
        INSERT INTO "FoodProduct" (id, name, "caloriesPer100", "proteinPer100", "fatPer100", "carbsPer100", "fiberPer100", unit, "standardPackageAmount", category, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
      `, p);
    }

    // 3. Profiles
    console.log("Seeding profiles...");
    await client.query(`
      INSERT INTO "NutritionPerson" (id, "userId", name, "targetKcal", "proteinPct", "fatPct", "carbsPct", "fiberGrams", goal, "createdAt", "updatedAt")
      VALUES ('vitalii-profile', $1, 'Vitalii', 1700, 45, 30, 25, 30, 'LOSE', NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET "targetKcal" = 1700
    `, [userId]);

    await client.query(`
      INSERT INTO "NutritionPerson" (id, "userId", name, "targetKcal", "proteinPct", "fatPct", "carbsPct", "fiberGrams", goal, "createdAt", "updatedAt")
      VALUES ('gf-profile', $1, 'GF', 2300, 15, 25, 60, 30, 'GAIN', NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET "targetKcal" = 2300
    `, [userId]);

    console.log("✅ SQL SEED SUCCESSFUL");

  } catch (e) {
    console.error("❌ SQL Error:", e);
  } finally {
    await client.end();
  }
}

main();
