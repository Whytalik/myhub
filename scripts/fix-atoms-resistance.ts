import { prisma } from "@/lib/db/prisma";

async function setDefaultResistanceForAtoms() {
  const childTasksWithoutResistance = await prisma.task.updateMany({
    where: {
      resistance: null,
      parentId: { not: null },
    },
    data: {
      resistance: 0,
    },
  });

  console.log(`Updated ${childTasksWithoutResistance.count} child atoms to resistance=0`);

  const orphanAtomsWithoutResistance = await prisma.task.updateMany({
    where: {
      resistance: null,
      parentId: null,
    },
    data: {
      resistance: 0,
    },
  });

  console.log(`Updated ${orphanAtomsWithoutResistance.count} orphan atoms to resistance=0`);
  console.log(`Total updated: ${childTasksWithoutResistance.count + orphanAtomsWithoutResistance.count}`);

  await prisma.$disconnect();
}

setDefaultResistanceForAtoms().catch(console.error);
