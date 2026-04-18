import { LanguageSphere } from "@/app/generated/prisma";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

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
