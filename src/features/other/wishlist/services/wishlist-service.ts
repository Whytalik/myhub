import { prisma } from "@/lib/prisma";
import type { WishlistItemData, UpsertWishlistItemInput } from "../types";

export const wishlistService = {
  async getAll(personId: string): Promise<WishlistItemData[]> {
    return prisma.wishlistItem.findMany({
      where: { personId },
      orderBy: [
        { status: "asc" },
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    }) as unknown as WishlistItemData[];
  },

  async upsert(personId: string, input: UpsertWishlistItemInput): Promise<WishlistItemData> {
    if (input.id) {
      return prisma.wishlistItem.update({
        where: { id: input.id, personId },
        data: {
          name: input.name,
          description: input.description,
          url: input.url,
          price: input.price,
          priority: input.priority,
          status: input.status,
        },
      }) as unknown as WishlistItemData;
    }

    return prisma.wishlistItem.create({
      data: {
        personId,
        name: input.name,
        description: input.description,
        url: input.url,
        price: input.price,
        priority: input.priority || "MEDIUM",
        status: input.status || "IDEA",
      },
    }) as unknown as WishlistItemData;
  },

  async delete(personId: string, id: string): Promise<void> {
    await prisma.wishlistItem.delete({
      where: { id, personId },
    });
  },
};
