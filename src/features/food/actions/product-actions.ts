"use server";

import { revalidatePath } from "next/cache";
import * as productService from "../services/product-service";
import { CreateProductInput, UpdateProductInput } from "../types";

export async function createProductAction(data: CreateProductInput) {
  const product = await productService.createProduct(data);
  revalidatePath("/food/products");
  revalidatePath("/food");
  return product;
}

export async function updateProductAction(data: UpdateProductInput) {
  const product = await productService.updateProduct(data);
  revalidatePath("/food/products");
  revalidatePath("/food");
  return product;
}

export async function deleteProductAction(id: string) {
  await productService.deleteProduct(id);
  revalidatePath("/food/products");
  revalidatePath("/food");
}
