import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/app/generated/prisma";

const ATOM_SELECT = {
  id: true,
  title: true,
  status: true,
  plannedDate: true,
  hasPlannedTime: true,
  plannedEndDate: true,
  sphereId: true,
  projectId: true,
  carryOverReason: true,
  project: { select: { title: true } },
} satisfies Prisma.TaskSelect;

export type WeeklyReviewTaskRow = Prisma.TaskGetPayload<{ select: typeof ATOM_SELECT }>;

// Atoms only: tasks without sub-tasks that carry a resistance value (groups have none).
const ATOM_FILTER = {
  children: { none: {} },
  resistance: { not: null },
} satisfies Prisma.TaskWhereInput;

export const weeklyReviewRepository = {
  findPlannedAtoms(userId: string, from: Date, to: Date) {
    return prisma.task.findMany({
      where: {
        userId,
        ...ATOM_FILTER,
        status: { not: "CANCELLED" },
        plannedDate: { gte: from, lte: to },
      },
      select: ATOM_SELECT,
      orderBy: { plannedDate: "asc" },
    });
  },

  findOverdueAtoms(userId: string, before: Date) {
    return prisma.task.findMany({
      where: {
        userId,
        ...ATOM_FILTER,
        status: { in: ["TODO", "IN_PROGRESS"] },
        plannedDate: { lt: before },
      },
      select: ATOM_SELECT,
      orderBy: { plannedDate: "asc" },
      take: 40,
    });
  },

  // Open atoms of the sprint's projects that are unscheduled or planned in the range.
  findSprintAtomsForRange(userId: string, sprintId: string, from: Date, to: Date) {
    return prisma.task.findMany({
      where: {
        userId,
        ...ATOM_FILTER,
        status: { in: ["TODO", "IN_PROGRESS"] },
        project: { objective: { sprintId } },
        OR: [{ plannedDate: null }, { plannedDate: { gte: from, lte: to } }],
      },
      select: ATOM_SELECT,
      orderBy: [{ plannedDate: "asc" }, { order: "asc" }],
      take: 60,
    });
  },

  findJournalEntries(userId: string, from: Date, to: Date) {
    return prisma.dailyEntry.findMany({
      where: { userId, date: { gte: from, lte: to } },
      select: {
        date: true,
        energy: true,
        mood: true,
        sleepHours: true,
        winToday: true,
        improveTomorrow: true,
        frictionToday: true,
        gratitude: true,
      },
      orderBy: { date: "asc" },
    });
  },

  countInboxThoughts(userId: string, statusNames: string[]) {
    return prisma.thought.count({
      where: {
        userId,
        status: {
          OR: statusNames.map((name) => ({ name: { equals: name, mode: "insensitive" as const } })),
        },
      },
    });
  },

  findReviews(sprintId: string) {
    return prisma.sprintReview.findMany({ where: { sprintId }, orderBy: { weekNumber: "asc" } });
  },

  findUserSettings(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { dailyResistanceBudget: true, weeklyReviewDay: true, weeklyReviewTime: true },
    });
  },

  updateSettings(userId: string, data: { weeklyReviewDay: number; weeklyReviewTime: string }) {
    return prisma.user.update({ where: { id: userId }, data });
  },
};
