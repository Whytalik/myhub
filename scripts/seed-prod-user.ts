import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.SUPABASE_URL || "https://rmrujtxlrpjtazzaojtw.supabase.co";
const KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const PASSWORD = process.env.USER_SEED_PASSWORD || "Hub2026!Calm";

if (!KEY) {
  console.error("Error: Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

async function del(table: string, filter = "id=not.is.null") {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: "DELETE",
    headers,
  });
  const text = r.ok ? "" : await r.text();
  console.log(`  ${r.ok ? "✓" : "✗"} ${table}${text ? `: ${text.slice(0, 80)}` : ""}`);
}

async function main() {
  console.log("⚠️  Clearing database...");

  const legacy = [
    "NutritionPerson", "WeekPlan", "DayPlan", "ShoppingList", "ShoppingListItem",
    "Dish", "DishIngredient", "Product", "DishProduct",
    "Language", "VocabularyEntry", "JournalEntry", "LanguageResource",
    "WishlistItem",
    "LibraryItem",
    "UserProfile",
    "NotificationQueue",
    "SphereSyncLog",
  ];
  for (const t of legacy) await del(t);

  await del("TacticCompletion");
  await del("Tactic");
  await del("KeyResult");
  await del("Objective");
  await del("SprintReview");
  await del("Sprint");
  await del("Milestone");
  await del("Vision");
  await del("AnnualCompass");
  await del("HabitCompletion");
  await del("Habit");
  await del("Task");
  await del("Project");
  await del("LifeSphere");
  await del("DailyEntry");
  await del("WeekTemplate");
  await del("PushSubscription");
  await del("Session");
  await del("Account");
  await del("VerificationToken", "identifier=not.is.null");

  console.log("\n🔑 Updating user...");

  const hash = await bcrypt.hash(PASSWORD, 12);

  const patch = await fetch(
    `${SUPABASE_URL}/rest/v1/User?email=eq.hanmaster05%40gmail.com`,
    {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify({
        name: "Vitalii",
        passwordHash: hash,
        updatedAt: new Date().toISOString(),
        systemStatus: "STABLE",
      }),
    },
  );

  if (patch.ok) {
    const users = await patch.json();
    if (users.length > 0) {
      console.log(`✓ Updated: ${users[0].email} (${users[0].id})`);
      console.log(`\nLogin: hanmaster05@gmail.com / ${PASSWORD}`);
      return;
    }
  }

  const post = await fetch(`${SUPABASE_URL}/rest/v1/User`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify({
      id: crypto.randomUUID(),
      name: "Vitalii",
      email: "hanmaster05@gmail.com",
      passwordHash: hash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      systemStatus: "STABLE",
    }),
  });

  if (post.ok) {
    const [user] = await post.json();
    console.log(`✓ Created: ${user.email} (${user.id})`);
    console.log(`\nLogin: hanmaster05@gmail.com / ${PASSWORD}`);
  } else {
    console.error("✗ Failed:", await post.text());
  }
}

main().catch(console.error);
