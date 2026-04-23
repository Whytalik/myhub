import { prisma } from "@/lib/prisma";
import { LanguageSphere, CefrLevel } from "@/app/generated/prisma";

// Алгоритм SM-2 для інтервальних повторень (Simplified)
// quality: 0-5 (0 = forgot, 5 = perfect)
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
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(prevInterval * prevEaseFactor);
    }
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

export const LanguageService = {
  // Розрахунок XP за активність
  calculateXpGain(durationMinutes: number, sphere: LanguageSphere) {
    // Базовий XP: 1 хвилина = 10 XP
    // Можна додати множники для різних сфер
    return durationMinutes * 10;
  },

  // Оновлення прогресу сфери (mastery)
  // mastery росте на основі логів занурення та успішних повторень
  async updateSphereProgress(userId: string, userLanguageId: string, sphere: LanguageSphere, gain: number) {
    // Перевірка власності
    await prisma.userLanguage.findFirstOrThrow({
      where: { id: userLanguageId, userId }
    });

    const current = await prisma.languageSphereProgress.findUnique({
      where: { userLanguageId_sphere: { userLanguageId, sphere } }
    });

    const newMastery = Math.min(100, (current?.mastery || 0) + gain);

    return prisma.languageSphereProgress.upsert({
      where: { userLanguageId_sphere: { userLanguageId, sphere } },
      update: { mastery: newMastery },
      create: { userLanguageId, sphere, mastery: newMastery }
    });
  },

  // Отримання повної статистики мови для Radar Chart
  async getLanguageStats(userId: string, userLanguageId: string) {
    const progress = await prisma.languageSphereProgress.findMany({
      where: { 
        userLanguageId,
        userLanguage: { userId }
      }
    });

    // Забезпечуємо наявність усіх 5 сфер у результаті
    const allSpheres = Object.values(LanguageSphere);
    const stats = allSpheres.map(sphere => {
      const p = progress.find(item => item.sphere === sphere);
      return {
        sphere,
        mastery: p?.mastery || 0
      };
    });

    return stats;
  },

  // Додавання мови для користувача
  async addLanguage(userId: string, languageId: string) {
    return prisma.userLanguage.create({
      data: {
        userId,
        languageId,
        level: CefrLevel.A0,
        totalXp: 0,
      }
    });
  },

  // Отримання списку доступних мов у системі
  async getAllAvailableLanguages() {
    return prisma.language.findMany({
      orderBy: { name: "asc" }
    });
  },

  // Отримання мов користувача
  async getUserLanguages(userId: string) {
    return prisma.userLanguage.findMany({
      where: { userId },
      include: { language: true }
    });
  },

  // Логування занурення
  async logImmersion(userId: string, userLanguageId: string, sphere: LanguageSphere, duration: number, note?: string) {
    const xpGain = this.calculateXpGain(duration, sphere);
    
    // Використовуємо транзакцію для цілісності даних
    return prisma.$transaction(async (tx) => {
      // Перевірка власності
      await tx.userLanguage.findFirstOrThrow({
        where: { id: userLanguageId, userId }
      });

      // 1. Створюємо лог
      const log = await tx.immersionLog.create({
        data: { userLanguageId, sphere, duration, note }
      });

      // 2. Оновлюємо загальний XP
      await tx.userLanguage.update({
        where: { id: userLanguageId },
        data: { totalXp: { increment: xpGain } }
      });

      // 3. Оновлюємо прогрес сфери (mastery)
      // Розрахунок приросту mastery: наприклад, 100 хв = +1% mastery (спрощено)
      const masteryGain = duration / 100; 
      
      const currentProgress = await tx.languageSphereProgress.findUnique({
        where: { userLanguageId_sphere: { userLanguageId, sphere } }
      });

      const newMastery = Math.min(100, (currentProgress?.mastery || 0) + masteryGain);

      await tx.languageSphereProgress.upsert({
        where: { userLanguageId_sphere: { userLanguageId, sphere } },
        update: { mastery: newMastery },
        create: { userLanguageId, sphere, mastery: newMastery }
      });

      return log;
    });
  },

  // Словник
  async addVocabularyItem(userId: string, userLanguageId: string, word: string, translation: string, context?: string) {
    // Перевірка власності
    await prisma.userLanguage.findFirstOrThrow({
      where: { id: userLanguageId, userId }
    });

    return prisma.vocabularyItem.create({
      data: {
        userLanguageId,
        word,
        translation,
        context,
        nextReview: new Date(),
        interval: 0,
        easeFactor: 2.5,
        repetition: 0
      }
    });
  },

  async reviewVocabularyItem(userId: string, id: string, quality: number) {
    const item = await prisma.vocabularyItem.findFirst({ 
      where: { 
        id,
        userLanguage: { userId }
      } 
    });
    if (!item) throw new Error("Item not found");

    const srs = calculateNextReview(
      quality,
      item.interval,
      item.easeFactor,
      item.repetition
    );

    return prisma.$transaction(async (tx) => {
      const updated = await tx.vocabularyItem.update({
        where: { id },
        data: {
          nextReview: srs.nextReview,
          interval: srs.interval,
          easeFactor: srs.easeFactor,
          repetition: srs.repetition
        }
      });

      // Кожне успішне повторення дає трохи mastery у сферу VOCABULARY
      if (quality >= 3) {
        const masteryGain = 0.1; // Невеликий приріст за кожне слово
        const currentProgress = await tx.languageSphereProgress.findUnique({
          where: { userLanguageId_sphere: { userLanguageId: item.userLanguageId, sphere: LanguageSphere.VOCABULARY } }
        });

        const newMastery = Math.min(100, (currentProgress?.mastery || 0) + masteryGain);

        await tx.languageSphereProgress.upsert({
          where: { userLanguageId_sphere: { userLanguageId: item.userLanguageId, sphere: LanguageSphere.VOCABULARY } },
          update: { mastery: newMastery },
          create: { userLanguageId: item.userLanguageId, sphere: LanguageSphere.VOCABULARY, mastery: newMastery }
        });
      }

      return updated;
    });
  }
};
