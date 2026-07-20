import { prisma } from "@/lib/db/prisma";

async function checkAtomsWithoutResistance() {
  const tasksWithoutResistance = await prisma.task.findMany({
    where: {
      resistance: null,
      parentId: { not: null },
    },
    select: {
      id: true,
      title: true,
      parentId: true,
      projectId: true,
    },
  });

  console.log(`Found ${tasksWithoutResistance.length} child tasks (atoms) without resistance:`);
  for (const task of tasksWithoutResistance) {
    console.log(`  - ${task.title} (id: ${task.id}, parent: ${task.parentId}, project: ${task.projectId})`);
  }

  const topLevelWithoutResistance = await prisma.task.findMany({
    where: {
      resistance: null,
      parentId: null,
    },
    select: {
      id: true,
      title: true,
      projectId: true,
      _count: {
        select: {
          children: true,
        },
      },
    },
  });

  console.log(`\nFound ${topLevelWithoutResistance.length} top-level tasks without resistance (potential groups):`);
  for (const task of topLevelWithoutResistance) {
    const hasChildren = task._count.children > 0;
    console.log(`  - ${task.title} (id: ${task.id}, project: ${task.projectId}, children: ${task._count.children}) ${hasChildren ? "✓ GROUP" : "⚠️  ORPHAN ATOM"}`);
  }

  await prisma.$disconnect();
}

checkAtomsWithoutResistance().catch(console.error);
