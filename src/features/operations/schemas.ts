import { z } from "zod";

export const objectiveSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  sphereId: z.string().min(1, "Sphere is required"),
});

export const tacticSchema = z.object({
  title: z.string().min(1, "Title is required"),
  frequency: z.enum(["DAILY", "WEEKLY"]),
});

export const keyResultSchema = z.object({
  title: z.string().min(1, "Title is required"),
  targetValue: z.number({ error: "Must be a number" }).positive("Must be positive"),
  currentValue: z.number({ error: "Must be a number" }).min(0),
  unit: z.string().min(1, "Unit is required"),
});

export type ObjectiveFormData = z.infer<typeof objectiveSchema>;
export type TacticFormData = z.infer<typeof tacticSchema>;
export type KeyResultFormData = z.infer<typeof keyResultSchema>;
