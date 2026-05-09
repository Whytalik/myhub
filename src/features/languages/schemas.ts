import { z } from "zod";

export const addVocabularySchema = z.object({
  word: z.string().min(1, "Word is required"),
  translation: z.string().min(1, "Translation is required"),
  context: z.string().optional(),
});

export const logImmersionSchema = z.object({
  sphere: z.enum(["VOCABULARY", "LISTENING", "READING", "SPEAKING", "WRITING"]),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  note: z.string().optional(),
});

export type AddVocabularyFormData = z.infer<typeof addVocabularySchema>;
export type LogImmersionFormData = z.infer<typeof logImmersionSchema>;
