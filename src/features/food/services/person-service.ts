import { prisma } from "@/lib/prisma";

export async function getPersons(profileId: string) {
  return await prisma.person.findMany({
    where: { profileId },
    orderBy: { name: 'asc' },
  });
}

export async function createPerson(profileId: string, name: string) {
  return await prisma.person.create({
    data: {
      name,
      profileId,
      targetCalories: 2000,
      targetProtein: 150,
      targetFat: 70,
      targetCarbs: 200,
      targetFiber: 30,
    },
  });
}

export async function updatePersonGoals(profileId: string, id: string, goals: {
  targetCalories?: number;
  targetProtein?: number;
  targetFat?: number;
  targetCarbs?: number;
  targetFiber?: number;
}) {
  return await prisma.person.update({
    where: { id, profileId },
    data: goals,
  });
}

export async function deletePerson(profileId: string, id: string) {
  return await prisma.person.delete({
    where: { id, profileId },
  });
}
