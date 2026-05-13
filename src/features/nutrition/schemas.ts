import { z } from "zod";

const STORES = ["NASHA_RYABA", "BAZAR", "ATB", "SILPO", "POLISSYA", "METRO", "FORA"] as const;

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  caloriesPer100: z.number().min(0),
  proteinPer100: z.number().min(0),
  fatPer100: z.number().min(0),
  carbsPer100: z.number().min(0),
  fiberPer100: z.number().min(0),
  unit: z.string().min(1, "Unit is required"),
  standardPackageAmount: z.number().min(1),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0).optional(),
  stores: z.array(z.enum(STORES)).optional(),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;
