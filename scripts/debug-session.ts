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
    include: {
      profile: {
        include: {
          persons: true
        }
      }
    }
  });
  
  console.log("📊 Database Debug Info:");
  users.forEach(u => {
    console.log(`User: ${u.email} (id: ${u.id})`);
    console.log(`  - Profile: ${u.profile?.name} (id: ${u.profile?.id || 'N/A'})`);
    if (u.profile?.persons) {
      console.log(`  - Persons: ${u.profile.persons.length}`);
      u.profile.persons.forEach(p => {
        console.log(`    - Person: ${p.name} (id: ${p.id})`);
      });
    } else {
      console.log(`  - Persons: N/A`);
    }
    console.log("-----------------------------------");
  });
}

main()
  .catch(console.error)
  .finally(() => pool.end());
