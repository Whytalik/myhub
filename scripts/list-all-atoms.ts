import { prisma } from "@/lib/db/prisma";

async function listProjectsAndAtoms() {
  const projects = await prisma.project.findMany({
    where: {
      tasks: {
        some: {},
      },
    },
    include: {
      tasks: {
        where: {
          parentId: null,
        },
        include: {
          children: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  for (const project of projects) {
    console.log(`\n=== PROJECT: ${project.title} (id: ${project.id}) ===`);

    for (const task of project.tasks) {
      const isGroup = task.resistance === null;
      console.log(`\n  ${isGroup ? "📋 GROUP" : "⚡ ATOM"}: ${task.title}`);

      if (isGroup) {
        for (const child of task.children) {
          console.log(`    → ${child.title}`);
        }
      }
    }
  }

  await prisma.$disconnect();
}

listProjectsAndAtoms().catch(console.error);
