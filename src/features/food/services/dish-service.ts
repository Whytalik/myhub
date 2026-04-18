import { prisma } from "@/lib/prisma";
import { CreateDishInput, UpdateDishInput } from "../types";

export async function getDishes(personId: string) {
  return await prisma.dish.findMany({
    where: { personId },
    include: {
      ingredients: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getDishById(personId: string, id: string) {
  return await prisma.dish.findFirst({
    where: { id, personId },
    include: {
      ingredients: {
        include: {
          product: true,
        },
      },
    },
  });
}

export async function createDish(personId: string, data: CreateDishInput) {
  const { ingredients, ...dishData } = data;
  return await prisma.dish.create({
    data: {
      ...dishData,
      personId,
      ingredients: {
        create: ingredients.map((ing) => ({
          productId: ing.productId,
          amount: ing.amount,
          unit: ing.unit,
        })),
      },
    },
    include: {
      ingredients: true,
    },
  });
}

export async function updateDish(personId: string, { id, ...data }: UpdateDishInput) {
  const { ingredients, ...dishData } = data;

  return await prisma.dish.update({
    where: { id, personId },
    data: {
      ...dishData,
      ingredients: ingredients
        ? {
            deleteMany: {}, // Simplest way to update nested ingredients: clear and recreate
            create: ingredients.map((ing) => ({
              productId: ing.productId,
              amount: ing.amount,
              unit: ing.unit,
            })),
          }
        : undefined,
    },
    include: {
      ingredients: true,
    },
  });
}

export async function deleteDish(personId: string, id: string) {
  return await prisma.dish.delete({
    where: { id, personId },
  });
}
