import { prisma } from "@/lib/prisma";
import { CreateProductInput, UpdateProductInput } from "../types";

export async function getProducts() {
  return await prisma.product.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getProductById(id: string) {
  return await prisma.product.findUnique({
    where: { id },
  });
}

export async function createProduct(data: CreateProductInput) {
  return await prisma.product.create({
    data,
  });
}

export async function updateProduct({ id, ...data }: UpdateProductInput) {
  return await prisma.product.update({
    where: { id },
    data,
  });
}

export async function deleteProduct(id: string) {
  return await prisma.product.delete({
    where: { id },
  });
}
