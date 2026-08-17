import { z } from "zod";

export const exerciseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  muscleGroup: z.string().optional(),
  equipment: z.string().optional(),
  trackingType: z.enum(["weight_reps", "bodyweight", "duration", "cardio"]).optional(),
  notes: z.string().optional(),
  archived: z.boolean().optional(),
});

export const trainingPlanSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  archived: z.boolean().optional(),
});

export const trainingDaySchema = z.object({
  planId: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  notes: z.string().optional(),
});

export const dayExerciseSchema = z.object({
  dayId: z.string().min(1),
  exerciseId: z.string().min(1, "Pick an exercise"),
  sets: z.number().int().min(1).max(20).optional(),
  targetReps: z.number().int().min(0).optional().nullable(),
  targetWeight: z.number().min(0).optional().nullable(),
  targetRpe: z.number().min(1).max(10).optional().nullable(),
  targetRir: z.number().min(0).max(10).optional().nullable(),
  restSeconds: z.number().int().min(0).optional().nullable(),
  targetDurationSeconds: z.number().int().min(0).optional().nullable(),
  targetDistanceMeters: z.number().min(0).optional().nullable(),
  notes: z.string().optional(),
});

export const setLogSchema = z.object({
  reps: z.number().int().min(0).optional().nullable(),
  weight: z.number().min(0).optional().nullable(),
  rpe: z.number().min(1).max(10).optional().nullable(),
  rir: z.number().min(0).max(10).optional().nullable(),
  restSeconds: z.number().int().min(0).optional().nullable(),
  durationSeconds: z.number().int().min(0).optional().nullable(),
  distanceMeters: z.number().min(0).optional().nullable(),
  completed: z.boolean().optional(),
  notes: z.string().optional(),
});

export type ExerciseFormData = z.infer<typeof exerciseSchema>;
export type TrainingPlanFormData = z.infer<typeof trainingPlanSchema>;
export type TrainingDayFormData = z.infer<typeof trainingDaySchema>;
export type DayExerciseFormData = z.infer<typeof dayExerciseSchema>;
export type SetLogFormData = z.infer<typeof setLogSchema>;
