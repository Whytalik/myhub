import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaClient } from "../src/app/generated/prisma";

// 1. Manually parse .env.production.local
const envPath = path.resolve(process.cwd(), ".env.production.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const dbUrlMatch = envContent.match(/POSTGRES_URL="([^"]+)"/);

if (!dbUrlMatch || !dbUrlMatch[1]) {
  console.error("❌ Could not find POSTGRES_URL in .env.production.local");
  process.exit(1);
}

const prodUrl = dbUrlMatch[1];
console.log("🔗 Connecting to Production Database (Supabase)...");

// 2. Initialize Prisma with the Production URL
const prisma = new PrismaClient({
  datasources: {
    db: { url: prodUrl },
  },
});

async function run() {
  try {
    const user = await prisma.user.findFirst({ where: { email: "hanmaster05@gmail.com" } });
    if (!user) {
      console.error("❌ User hanmaster05@gmail.com not found in Production DB!");
      return;
    }
    console.log(`✅ Found user: ${user.name} (${user.id})`);

    // Here we could import and run the seed logic, but to be safe we'll just 
    // run the actual scripts by spawning them with the correct environment variable
    console.log("🚀 Starting seeding process...");
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
