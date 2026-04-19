import { PrismaClient } from "../src/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "vitalii@hub.local";
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (user) {
    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" }
    });
    console.log(`✅ User ${email} is now ADMIN`);
  } else {
    console.log(`❌ User ${email} not found`);
  }
}

main().finally(() => pool.end());
