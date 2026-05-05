import { prisma } from "@/lib/prisma";
import { LanguageSphere, CefrLevel } from "@/app/generated/prisma";

// SM-2 spaced repetition algorithm (quality: 0=forgot, 5=perfect)
export function calculateNextReview(
  quality: number,
  prevInterval: number,
  prevEaseFactor: number,
  repetition: number
) {
  let interval: number;
  let easeFactor: number;
  let nextRepetition: number;

  if (quality >= 3) {
    if (repetition === 0) interval = 1;
    else if (repetition === 1) interval = 6;
    else interval = Math.round(prevInterval * prevEaseFactor);
    nextRepetition = repetition + 1;
    easeFactor = prevEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  } else {
    interval = 1;
    nextRepetition = 0;
    easeFactor = prevEaseFactor;
  }

  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { nextReview, interval, easeFactor, repetition: nextRepetition };
}

export function calculateXpGain(durationMinutes: number) {
  return durationMinutes * 10;
}

export async function updateSphereProgress(
  userId: string,
  userLanguageId: string,
  sphere: LanguageSphere,
  gain: number
) {
  const current = await prisma.languageSphereProgress.findUnique({
    where: {
      userLanguageId_sphere: { userLanguageId, sphere },
      userLanguage: { userId },
    },
  });

  const newMastery = Math.min(100, (current?.mastery || 0) + gain);

  return prisma.languageSphereProgress.upsert({
    where: { userLanguageId_sphere: { userLanguageId, sphere } },
    update: { mastery: newMastery },
    create: { userLanguageId, sphere, mastery: newMastery },
  });
}

export async function getLanguageStats(userId: string, userLanguageId: string) {
  const progress = await prisma.languageSphereProgress.findMany({
    where: { userLanguageId, userLanguage: { userId } },
  });

  return Object.values(LanguageSphere).map((sphere) => {
    const p = progress.find((item) => item.sphere === sphere);
    return { sphere, mastery: p?.mastery || 0 };
  });
}

export async function addLanguage(userId: string, languageId: string) {
  return prisma.userLanguage.create({
    data: { userId, languageId, level: CefrLevel.A0, totalXp: 0 },
  });
}

export async function getAllAvailableLanguages() {
  return prisma.language.findMany({ orderBy: { name: "asc" } });
}

export async function getUserLanguages(userId: string) {
  return prisma.userLanguage.findMany({
    where: { userId },
    include: { language: true },
  });
}

export async function logImmersion(
  userId: string,
  userLanguageId: string,
  sphere: LanguageSphere,
  duration: number,
  note?: string
) {
  const xpGain = calculateXpGain(duration);

  return prisma.$transaction(async (tx) => {
    await tx.userLanguage.findFirstOrThrow({ where: { id: userLanguageId, userId } });

    const log = await tx.immersionLog.create({
      data: { userLanguageId, sphere, duration, note },
    });

    await tx.userLanguage.update({
      where: { id: userLanguageId },
      data: { totalXp: { increment: xpGain } },
    });

    const masteryGain = duration / 100;
    const currentProgress = await tx.languageSphereProgress.findUnique({
      where: { userLanguageId_sphere: { userLanguageId, sphere } },
    });

    const newMastery = Math.min(100, (currentProgress?.mastery || 0) + masteryGain);

    await tx.languageSphereProgress.upsert({
      where: { userLanguageId_sphere: { userLanguageId, sphere } },
      update: { mastery: newMastery },
      create: { userLanguageId, sphere, mastery: newMastery },
    });

    return log;
  });
}

export async function addVocabularyItem(
  userId: string,
  userLanguageId: string,
  word: string,
  translation: string,
  context?: string
) {
  await prisma.userLanguage.findFirstOrThrow({ where: { id: userLanguageId, userId } });

  return prisma.vocabularyItem.create({
    data: {
      userLanguageId,
      word,
      translation,
      context,
      nextReview: new Date(),
      interval: 0,
      easeFactor: 2.5,
      repetition: 0,
    },
  });
}

export async function reviewVocabularyItem(userId: string, id: string, quality: number) {
  const item = await prisma.vocabularyItem.findFirst({
    where: { id, userLanguage: { userId } },
  });
  if (!item) throw new Error("Item not found");

  const srs = calculateNextReview(quality, item.interval, item.easeFactor, item.repetition);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.vocabularyItem.update({
      where: { id },
      data: {
        nextReview: srs.nextReview,
        interval: srs.interval,
        easeFactor: srs.easeFactor,
        repetition: srs.repetition,
      },
    });

    if (quality >= 3) {
      const masteryGain = 0.1;
      const currentProgress = await tx.languageSphereProgress.findUnique({
        where: {
          userLanguageId_sphere: { userLanguageId: item.userLanguageId, sphere: LanguageSphere.VOCABULARY },
        },
      });

      const newMastery = Math.min(100, (currentProgress?.mastery || 0) + masteryGain);

      await tx.languageSphereProgress.upsert({
        where: {
          userLanguageId_sphere: { userLanguageId: item.userLanguageId, sphere: LanguageSphere.VOCABULARY },
        },
        update: { mastery: newMastery },
        create: { userLanguageId: item.userLanguageId, sphere: LanguageSphere.VOCABULARY, mastery: newMastery },
      });
    }

    return updated;
  });
}
