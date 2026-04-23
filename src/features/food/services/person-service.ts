import { prisma } from "@/lib/prisma";

export async function getPersons(userId: string) {
  return await prisma.nutritionPerson.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });
}

export async function createPerson(userId: string, name: string) {
  return await prisma.nutritionPerson.create({
    data: {
      userId,
      name,
      targetCalories: 2000,
      targetProtein: 150,
      targetFat: 70,
      targetCarbs: 200,
      targetFiber: 30,
    },
  });
}

export async function updatePersonGoals(userId: string, id: string, goals: {
  targetCalories?: number;
  targetProtein?: number;
  targetFat?: number;
  targetCarbs?: number;
  targetFiber?: number;
}) {
  return await prisma.nutritionPerson.update({
    where: { id },
    data: goals,
  });
}

export async function deletePerson(userId: string, id: string) {
  return await prisma.nutritionPerson.delete({
    where: { id },
  });
}