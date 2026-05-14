import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { hash } from "bcryptjs";

const EMAIL = "hanmaster05@gmail.com";
const PASSWORD = "changeme";
const NAME = "Vitalii";

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (existing) {
    console.log("User already exists:", EMAIL);
    return;
  }

  const passwordHash = await hash(PASSWORD, 12);
  const user = await prisma.user.create({
    data: { email: EMAIL, passwordHash, name: NAME },
  });

  console.log("Created user:", user.email);
  console.log("Password:", PASSWORD, "← change this after first login");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
