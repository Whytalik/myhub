import type { 
  TaskPriority,
  WishlistStatus as PrismaWishlistStatus,
} from "@/app/generated/prisma";

export type WishlistStatus = PrismaWishlistStatus;

export interface WishlistItemData {
  id:          string;
  name:        string;
  description: string | null;
  url:         string | null;
  imageUrl:    string | null;
  price:       number | null;
  currency:    string;
  priority:    TaskPriority;
  status:      WishlistStatus;
  category:    string | null;
  tags:        string[];
  necessity:   number | null;
  store:       string | null;
  createdAt:   Date;
  updatedAt:   Date;
}

export interface UpsertWishlistItemInput {
  id?:          string;
  name:         string;
  description?: string | null;
  url?:         string | null;
  imageUrl?:    string | null;
  price?:       number | null;
  currency?:    string;
  priority?:    TaskPriority;
  status?:      WishlistStatus;
  category?:    string | null;
  tags?:        string[];
  necessity?:   number | null;
  store?:       string | null;
}
