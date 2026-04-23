import { prisma } from "@/lib/prisma";
import { CreateDishInput, UpdateDishInput } from "../types";

export async function getDishes(userId: string) {
  return await prisma.dish.findMany({
    where: { userId },
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

export async function getDishById(userId: string, id: string) {
  return await prisma.dish.findFirst({
    where: { id, userId },
    include: {
      ingredients: {
        include: {
          product: true,
        },
      },
    },
  });
}

export async function createDish(userId: string, data: CreateDishInput) {
  const { ingredients, ...dishData } = data;
  return await prisma.dish.create({
    data: {
      ...dishData,
      userId,
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

export async function updateDish(userId: string, { id, ...data }: UpdateDishInput) {
  const { ingredients, ...dishData } = data;

  return await prisma.dish.update({
    where: { id, userId },
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

export async function deleteDish(userId: string, id: string) {
  return await prisma.dish.delete({
    where: { id, userId },
  });
}
