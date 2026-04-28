"use server";

import { revalidatePath } from "next/cache";
import * as productService from "../services/product-service";
import { CreateProductInput, UpdateProductInput } from "../types";
import { auth } from "@/auth";

import { scrapeProductUrl } from "../logic/importers";

export async function parseProductLinkAction(url: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const data = await scrapeProductUrl(url);
    return { success: true, data };
  } catch {
    return { success: false, error: "Failed to parse link" };
  }
}

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
