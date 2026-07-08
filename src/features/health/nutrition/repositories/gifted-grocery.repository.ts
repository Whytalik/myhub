import { prisma } from "@/lib/db/prisma";

export interface GiftedGroceryFields {
  productKey: string | null;
  value: number;
  quantityNote: string | null;
  note: string | null;
}

export const giftedGroceryRepository = {
  findAll() {
    return prisma.giftedGroceryItem.findMany({ orderBy: { weekStart: "desc" } });
  },
  upsert(weekStart: Date, itemId: string, data: GiftedGroceryFields) {
    return prisma.giftedGroceryItem.upsert({
      where: { weekStart_itemId: { weekStart, itemId } },
      create: { weekStart, itemId, ...data },
      update: data,
    });
  },
  remove(weekStart: Date, itemId: string) {
    return prisma.giftedGroceryItem.delete({
      where: { weekStart_itemId: { weekStart, itemId } },
    });
  },
};
