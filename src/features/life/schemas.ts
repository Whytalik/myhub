import { z } from "zod";

export const habitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["positive", "avoidance"]),
  anchor: z.string().optional(),
  action: z.string().optional(),
  celebration: z.string().optional(),
  reminderTime: z.string().optional(),
  archived: z.boolean().optional(),
  sphereId: z.string().nullable().optional(),
  sphereLevel: z.enum(["MINIMUM", "MEDIUM", "DESIRED"]).nullable().optional(),
}).superRefine((data, ctx) => {
  if (data.type === "positive") {
    if (!data.anchor || data.anchor.trim().length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Anchor is required", path: ["anchor"] });
    }
    if (!data.action || data.action.trim().length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Action is required", path: ["action"] });
    }
  }
});

export const sphereSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
  icon: z.string().min(1, "Icon is required"),
});

export type HabitFormData = z.infer<typeof habitSchema>;
export type SphereFormData = z.infer<typeof sphereSchema>;
