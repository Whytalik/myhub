"use server";

import { auth } from "@/auth";
import { wishlistService } from "../services/wishlist-service";
import { invalidateWishlistCache } from "@/lib/revalidate";
import { ActionResult } from "@/lib/action-utils";
import type { UpsertWishlistItemInput, WishlistItemData } from "../types";

async function getRequiredPersonId(): Promise<string> {
  const session = await auth();
  const personId = (session?.user as { personId?: string })?.personId;
  if (!personId) throw new Error("Unauthorized: No personId found in session");
  return personId;
}

export async function upsertWishlistItemAction(
  input: UpsertWishlistItemInput
): Promise<ActionResult<WishlistItemData>> {
  try {
    const personId = await getRequiredPersonId();
    const item = await wishlistService.upsert(personId, input);
    invalidateWishlistCache(personId);
    return { success: true, data: item };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to save item" };
  }
}

export async function deleteWishlistItemAction(id: string): Promise<ActionResult<void>> {
  try {
    const personId = await getRequiredPersonId();
    await wishlistService.delete(personId, id);
    invalidateWishlistCache(personId);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete item" };
  }
}
