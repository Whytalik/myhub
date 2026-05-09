import { z } from "zod";

export const habitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  anchor: z.string().min(1, "Anchor is required"),
  action: z.string().min(1, "Action is required"),
  celebration: z.string().optional(),
  reminderTime: z.string().optional(),
  archived: z.boolean().optional(),
});

export const sphereSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
  icon: z.string().min(1, "Icon is required"),
});

export type HabitFormData = z.infer<typeof habitSchema>;
export type SphereFormData = z.infer<typeof sphereSchema>;
