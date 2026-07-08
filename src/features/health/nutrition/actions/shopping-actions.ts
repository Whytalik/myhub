"use server";

import { ActionResult, withAction } from "@/lib/actions/action-utils";
import { invalidateGiftedGroceryCache } from "@/lib/cache/revalidate";
import { upsertGifted, removeGifted, type UpsertGiftedInput } from "../services/spending-service";

export async function upsertGiftedItemAction(
  input: UpsertGiftedInput,
): Promise<ActionResult<void>> {
  return withAction(async () => {
    await upsertGifted(input);
    invalidateGiftedGroceryCache();
  });
}

export async function removeGiftedItemAction(
  weekStart: string,
  itemId: string,
): Promise<ActionResult<void>> {
  return withAction(async () => {
    await removeGifted(weekStart, itemId);
    invalidateGiftedGroceryCache();
  });
}
