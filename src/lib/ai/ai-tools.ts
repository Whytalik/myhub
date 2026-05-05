import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const createAiTools = (userId: string, domain: "operations" | "health") => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tools: Record<string, any> = {};

  if (domain === "operations") {
    tools.createTask = tool({
      description: "Створити нову задачу. Використовуйте для будь-яких нових справ.",
      inputSchema: z.object({
        title: z.string().describe("Назва задачі"),
        description: z.string().optional().describe("Детальний опис"),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
        status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
        plannedDate: z.string().optional().describe("Дата виконання (YYYY-MM-DD)"),
        dueDate: z.string().optional().describe("Крайній термін (YYYY-MM-DDTHH:MM)"),
        sphereId: z.string().optional().describe("ID сфери життя"),
        parentId: z.string().optional().describe("ID батьківської задачі для підзадач"),
      }),
      execute: async (params) => {
        const { upsertTask } = await import("@/features/life/services/task-service");
        const task = await upsertTask(userId, params);
        return { success: true, taskId: task.id, message: `Задачу "${task.title}" створено` };
      },
    });

    tools.suggestUpdateTask = tool({
      description: "Запропонувати оновлення існуючої задачі. Використовуйте для зміни статусу, пріоритету або тексту.",
      inputSchema: z.object({
        id: z.string().describe("ID задачі, яку треба оновити"),
        title: z.string().optional(),
        status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "DONE"]).optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
        plannedDate: z.string().optional(),
      }),
      execute: async (params) => {
        const suggestion = await prisma.aISuggestion.create({
          data: {
            userId,
            domain: "OPERATIONS",
            action: "updateTask",
            payload: params,
            reason: "Запит користувача на оновлення",
            status: "PENDING",
          },
        });
        return { success: true, suggestionId: suggestion.id, message: "Пропозицію на оновлення створено. Користувач має її підтвердити." };
      },
    });

    tools.suggestDeleteTask = tool({
      description: "Запропонувати видалення задачі.",
      inputSchema: z.object({
        id: z.string().describe("ID задачі для видалення"),
      }),
      execute: async (params) => {
        const suggestion = await prisma.aISuggestion.create({
          data: {
            userId,
            domain: "OPERATIONS",
            action: "deleteTask",
            payload: params,
            reason: "Запит на видалення",
            status: "PENDING",
          },
        });
        return { success: true, suggestionId: suggestion.id, message: "Запит на видалення створено." };
      },
    });
  }

  if (domain === "health") {
    tools.createHabit = tool({
      description: "Створити нову звичку.",
      inputSchema: z.object({
        name: z.string().describe("Назва звички"),
        anchor: z.string().describe("Тригер (наприклад, 'Після кави')"),
        action: z.string().describe("Дія звички"),
        celebration: z.string().optional(),
      }),
      execute: async (params) => {
        const { upsertHabit } = await import("@/features/life/services/habit-service");
        const habit = await upsertHabit(userId, params);
        return { success: true, habitId: habit.id, message: `Звичку "${habit.name}" додано` };
      },
    });

    tools.recordDailyStats = tool({
      description: "Записати показники дня (сон, енергія, настрій).",
      inputSchema: z.object({
        date: z.string().describe("Дата (YYYY-MM-DD)"),
        sleepHours: z.number().optional(),
        energy: z.number().min(1).max(10).optional(),
        mood: z.number().min(1).max(10).optional(),
        weight: z.number().optional(),
      }),
      execute: async (params) => {
        const { upsertEntry } = await import("@/features/life/services/journal-service");
        await upsertEntry(userId, params);
        return { success: true, message: "Дані за день успішно записано" };
      },
    });
  }

  tools.getTasks = tool({
    description: "Отримати список поточних задач користувача. Використовуйте, щоб дізнатись що зараз у списку.",
    inputSchema: z.object({
      status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "DONE"]).optional(),
    }),
    execute: async ({ status }) => {
      const tasks = await prisma.task.findMany({
        where: { userId, status },
        take: 10,
        orderBy: { updatedAt: "desc" },
        select: { id: true, title: true, status: true, priority: true },
      });
      return { tasks };
    },
  });

  return tools;
};
