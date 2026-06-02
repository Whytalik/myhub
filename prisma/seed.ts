import { PrismaClient } from '../src/app/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Dictionaries are seeded via migration SQL.
  // Add test data here as needed.
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
