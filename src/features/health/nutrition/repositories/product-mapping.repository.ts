import { prisma } from "@/lib/db/prisma";
import { MappingSource } from "@/app/generated/prisma";

export interface ProductMappingFields {
  foodId: string;
  foodName: string;
  servingId: string;
  servingDescription: string;
  servingGrams: number;
  source: MappingSource;
}

export const productMappingRepository = {
  findAll() {
    return prisma.productFatSecretMapping.findMany();
  },
  upsert(productKey: string, data: ProductMappingFields) {
    return prisma.productFatSecretMapping.upsert({
      where: { productKey },
      create: { productKey, ...data },
      update: data,
    });
  },
  delete(productKey: string) {
    return prisma.productFatSecretMapping.delete({ where: { productKey } });
  },
};
