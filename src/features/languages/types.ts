import { LanguageSphere } from "@/app/generated/prisma";

export type { ActionResult } from "@/lib/action-utils";

export interface LogImmersionInput {
  userLanguageId: string;
  sphere: LanguageSphere;
  duration: number;
  note?: string;
}

export interface AddVocabularyInput {
  userLanguageId: string;
  word: string;
  translation: string;
  context?: string;
}
