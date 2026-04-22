import { PrismaClient } from "../src/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      profile: {
        select: {
          id: true,
          persons: {
            take: 1,
            orderBy: { createdAt: "asc" },
            select: { id: true, name: true }
          }
        }
      }
    }
  });
  
  console.log("📊 User Session ID Check:");
  users.forEach(u => {
    console.log(`- User: ${u.email} (${u.name})`);
    console.log(`  Profile ID: ${u.profile?.id || "MISSING"}`);
    console.log(`  Person ID:  ${u.profile?.persons[0]?.id || "MISSING"} (${u.profile?.persons[0]?.name || "N/A"})`);
    console.log("-----------------------------------");
  });
}

main().finally(() => pool.end());
