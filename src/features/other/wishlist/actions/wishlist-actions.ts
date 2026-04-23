"use server";

import { auth } from "@/auth";
import { wishlistService } from "../services/wishlist-service";
import type { UpsertWishlistItemInput, WishlistItemData } from "../types";
import { revalidatePath } from "next/cache";

export type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

async function getPersonId() {
  const session = await auth();
  const personId = (session?.user as { personId?: string })?.personId;
  if (!personId) throw new Error("Unauthorized: No personId found in session");
  return personId;
}

export async function upsertWishlistItemAction(
  input: UpsertWishlistItemInput
): Promise<ActionResult<WishlistItemData>> {
  try {
    const personId = await getPersonId();
    const item = await wishlistService.upsert(personId, input);
    revalidatePath("/other/wishlist");
    return { success: true, data: item };
  } catch (err) {
    console.error("Failed to upsert wishlist item:", err);
    return { success: false, error: "Failed to save item" };
  }
}

export async function deleteWishlistItemAction(
  id: string
): Promise<ActionResult<void>> {
  try {
    const personId = await getPersonId();
    await wishlistService.delete(personId, id);
    revalidatePath("/other/wishlist");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete wishlist item:", err);
    return { success: false, error: "Failed to delete item" };
  }
}
