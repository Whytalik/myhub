import { prisma } from "@/lib/db/prisma";

async function fixGroupsResistance() {
  const groupsWithChildren = await prisma.task.findMany({
    where: {
      resistance: 0,
      parentId: null,
    },
    include: {
      _count: {
        select: {
          children: true,
        },
      },
    },
  });

  const groupIds = groupsWithChildren
    .filter((t) => t._count.children > 0)
    .map((t) => t.id);

  console.log(`Found ${groupIds.length} groups (top-level tasks with children) that need resistance=null`);

  if (groupIds.length > 0) {
    const result = await prisma.task.updateMany({
      where: {
        id: { in: groupIds },
      },
      data: {
        resistance: null,
      },
    });

    console.log(`Updated ${result.count} groups back to resistance=null`);
  }

  await prisma.$disconnect();
}

fixGroupsResistance().catch(console.error);
