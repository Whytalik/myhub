import { PrismaClient } from "../src/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
import { hash } from "bcryptjs";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "tester@hub.local";
  const password = "password123";
  const name = "Test User";

  // Check if exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`ℹ️ User ${email} already exists`);
    return;
  }

  const passwordHash = await hash(password, 10);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "USER", // Explicitly user
      },
    });

    const profile = await tx.profile.create({
      data: {
        name: `${name}'s Profile`,
        userId: user.id,
      },
    });

    await tx.nutritionPerson.create({
      data: {
        name: "Test User",
        profileId: profile.id,
      },
    });
  });

  console.log(`✅ Test User created!`);
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => pool.end());
