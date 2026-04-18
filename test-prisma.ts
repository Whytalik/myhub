import { prisma } from "./src/lib/prisma";

async function main() {
  try {
    console.log("Scalar fields:", Object.keys((prisma as any).dailyEntry.fields || {}));
    // Try a mock upsert (won't actually run if we don't call it, but we can check types)
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
