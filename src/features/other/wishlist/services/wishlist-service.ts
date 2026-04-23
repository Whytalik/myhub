import { prisma } from "@/lib/prisma";
import type { WishlistItemData, UpsertWishlistItemInput } from "../types";

export const wishlistService = {
  async getAll(userId: string): Promise<WishlistItemData[]> {
    return prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: [
        { status: "asc" },
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    }) as unknown as WishlistItemData[];
  },

  async upsert(userId: string, input: UpsertWishlistItemInput): Promise<WishlistItemData> {
    if (input.id) {
      return prisma.wishlistItem.update({
        where: { id: input.id },
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
        userId,
        name: input.name,
        description: input.description,
        url: input.url,
        price: input.price,
        priority: input.priority || "MEDIUM",
        status: input.status || "IDEA",
      },
    }) as unknown as WishlistItemData;
  },

  async delete(userId: string, id: string): Promise<void> {
    await prisma.wishlistItem.delete({
      where: { id },
    });
  },
};
