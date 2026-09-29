import { z } from "zod";

export const habitSchema = z
  .object({
    name: z.string().optional(),
    type: z.enum(["positive", "avoidance"]),
    anchor: z.string().optional(),
    action: z.string().optional(),
    celebration: z.string().optional(),

    archived: z.boolean().optional(),
    scheduledWeekdays: z.array(z.number().int().min(0).max(6)).min(1).optional(),
    recurrence: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY"]).optional(),
    sphereId: z.string().nullable().optional(),
    chainId: z.string().nullable().optional(),
    identityStatement: z.string().optional(),
    minimalThreshold: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "positive") {
      if (!data.anchor || data.anchor.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Anchor is required",
          path: ["anchor"],
        });
      }
      if (!data.action || data.action.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Action is required",
          path: ["action"],
        });
      }
    }
  });

export const sphereSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
  icon: z.string().min(1, "Icon is required"),
});

export const habitChainSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  archived: z.boolean().optional(),
});

export const thoughtStatusSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
});

export const thoughtSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

export type HabitFormData = z.infer<typeof habitSchema>;
export type SphereFormData = z.infer<typeof sphereSchema>;
export type HabitChainFormData = z.infer<typeof habitChainSchema>;
export type ThoughtStatusFormData = z.infer<typeof thoughtStatusSchema>;
export type ThoughtFormData = z.infer<typeof thoughtSchema>;

export const sphereGoalSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    type: z.enum(["COUNTER", "DAYS", "VALUE"]),
    unit: z.string().trim().optional(),
    startValue: z.number().finite().optional(),
    targetValue: z.number().finite(),
    habitId: z.string().nullable().optional(),
    deadline: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.deadline && Number.isNaN(new Date(data.deadline).getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid deadline",
        path: ["deadline"],
      });
    }
    if (data.type === "VALUE" && data.habitId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A value goal can't be tracked by a habit",
        path: ["habitId"],
      });
    }
    if (data.type !== "VALUE" && data.targetValue <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Target must be greater than zero",
        path: ["targetValue"],
      });
    }
    if (data.type === "VALUE" && data.targetValue === (data.startValue ?? 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Target must differ from the start value",
        path: ["targetValue"],
      });
    }
  });

export type SphereGoalFormData = z.infer<typeof sphereGoalSchema>;

export const goalPhaseSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    startMonth: z.number().int().min(1).max(12),
    endMonth: z.number().int().min(1).max(12),
    outcome: z.string().trim().nullable().optional(),
  })
  .refine((data) => data.startMonth <= data.endMonth, {
    message: "The phase can't end before it starts",
    path: ["endMonth"],
  });

const trimmedList = z.array(z.string().trim()).transform((items) => items.filter(Boolean));

export const savePlaybookSchema = z.object({
  path: z.string().trim().optional(),
  keyChange: z.string().trim().optional(),
  assets: trimmedList.optional(),
  obstacles: z
    .array(z.object({ obstacle: z.string().trim(), solution: z.string().trim() }))
    .transform((items) => items.filter((item) => item.obstacle))
    .optional(),
  people: z
    .array(z.object({ name: z.string().trim(), help: z.string().trim() }))
    .transform((items) => items.filter((item) => item.name))
    .optional(),
  pedalAction: z.string().trim().optional(),
});
