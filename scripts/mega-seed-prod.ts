import "dotenv/config";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

async function main() {
  const envPath = path.resolve(process.cwd(), ".env.production.local");
  const envContent = fs.readFileSync(envPath, "utf-8");
  const lines = envContent.split(/\r?\n/);
  const dbLine = lines.find(l => l.startsWith("POSTGRES_PRISMA_URL="));

  if (!dbLine) {
    console.error("❌ Could not find POSTGRES_PRISMA_URL line in .env.production.local");
    return;
  }

  const prodUrl = dbLine.split("=")[1].replace(/^"|"$/g, "");
  process.env.DATABASE_URL = prodUrl;
  
  console.log("🔗 Connected to Prod URL. Running scripts...");

  try {
    console.log("1/3 Seeding Global Products...");
    execSync("npx tsx scripts/seed-global-visual-plan.ts", { stdio: "inherit", env: process.env });
    
    console.log("2/3 Seeding Personal Profiles...");
    execSync("npx tsx prisma/seed-visual-plan.ts", { stdio: "inherit", env: process.env });
    
    console.log("3/3 Generating Week Plan...");
    execSync("npx tsx scripts/generate-visual-week.ts", { stdio: "inherit", env: process.env });
    
    console.log("✅ ALL PROD SEEDING COMPLETE!");
  } catch (e) {
    console.error("❌ Error during seeding:", e);
  }
}

main();
