import { prisma } from "@/lib/prisma";
import { TacticFrequency, TaskStatus, ObjectiveStatus, SprintStatus, TaskPriority } from "@/app/generated/prisma";
import type { 
  SprintData, 
  ObjectiveData, 
  KeyResultData, 
  ProjectData, 
  TacticData, 
  TacticCompletionData,
  UpsertSprintInput,
  UpsertObjectiveInput,
  UpsertKeyResultInput,
  UpsertTacticInput,
  UpsertProjectInput
} from "../types";
import type { TaskData } from "@/features/life/types";

// ─── Mapping Functions ───────────────────────────────────────────────────────

function mapTactic(t: Record<string, unknown>): TacticData {
  return {
    id: t.id as string,
    keyResultId: t.keyResultId as string,
    title: t.title as string,
    description: (t.description as string) || null,
    frequency: t.frequency as TacticFrequency,
    completions: t.completions as TacticCompletionData[],
    createdAt: t.createdAt as Date,
    updatedAt: t.updatedAt as Date,
  };
}

function mapKeyResult(kr: Record<string, unknown>): KeyResultData {
  const targetValue = kr.targetValue as number;
  const currentValue = kr.currentValue as number;
  const progress = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;
  return {
    id: kr.id as string,
    objectiveId: kr.objectiveId as string,
    title: kr.title as string,
    targetValue,
    currentValue,
    unit: kr.unit as string,
    progress: Math.min(progress, 100),
    tactics: (kr.tactics as Record<string, unknown>[] | undefined)?.map(mapTactic) ?? [],
    createdAt: kr.createdAt as Date,
    updatedAt: kr.updatedAt as Date,
  };
}

function mapProject(p: Record<string, unknown>): ProjectData {
  const tasks = p.tasks as Array<Record<string, unknown>> | undefined;
  const taskCount = tasks?.length ?? 0;
  const completedTaskCount = tasks?.filter(t => t.status === 'DONE').length ?? 0;
  const progress = taskCount > 0 ? (completedTaskCount / taskCount) * 100 : 0;
  
  return {
    id: p.id as string,
    objectiveId: p.objectiveId as string,
    title: p.title as string,
    description: p.description as string | null,
    startDate: p.startDate as Date | null,
    endDate: p.endDate as Date | null,
    status: p.status as TaskStatus,
    taskCount,
    completedTaskCount,
    progress,
    tasks: (tasks as Record<string, unknown>[])?.map(t => ({
      id: t.id as string,
      title: t.title as string,
      status: t.status as TaskStatus,
      priority: t.priority as TaskPriority,
      createdAt: t.createdAt as Date,
      updatedAt: t.updatedAt as Date,
    })) as unknown as TaskData[], 
    createdAt: p.createdAt as Date,
    updatedAt: p.updatedAt as Date,
  };
}

function mapObjective(obj: Record<string, unknown>): ObjectiveData {
  return {
    id: obj.id as string,
    sprintId: obj.sprintId as string,
    sphereId: obj.sphereId as string,
    sphereName: (obj.sphere as { name?: string })?.name,
    sphereColor: (obj.sphere as { color?: string })?.color,
    title: obj.title as string,
    description: obj.description as string | null,
    status: obj.status as ObjectiveStatus,
    keyResults: (obj.keyResults as Record<string, unknown>[] | undefined)?.map(mapKeyResult) ?? [],
    projects: (obj.projects as Record<string, unknown>[] | undefined)?.map(mapProject) ?? [],
    createdAt: obj.createdAt as Date,
    updatedAt: obj.updatedAt as Date,
  };
}

function mapSprint(s: Record<string, unknown>): SprintData {
  return {
    id: s.id as string,
    number: s.number as number,
    year: s.year as number,
    startDate: s.startDate as Date,
    endDate: s.endDate as Date,
    status: s.status as SprintStatus,
    objectives: (s.objectives as Record<string, unknown>[] | undefined)?.map(mapObjective) ?? [],
    createdAt: s.createdAt as Date,
    updatedAt: s.updatedAt as Date,
  };
}

// ─── Sprints ──────────────────────────────────────────────────────────────────

export async function getAllSprints(userId: string): Promise<SprintData[]> {
  const sprints = await prisma.sprint.findMany({
    where: { userId },
    orderBy: [{ year: "desc" }, { number: "desc" }],
    include: {
      objectives: {
        include: {
          sphere: true,
          keyResults: {
            include: {
              tactics: {
                include: { completions: true }
              }
            }
          },
          projects: {
            include: { tasks: true }
          }
        }
      }
    }
  });
  return sprints.map(mapSprint);
}

export async function getActiveSprint(userId: string): Promise<SprintData | null> {
  const sprint = await prisma.sprint.findFirst({
    where: { userId, status: "ACTIVE" },
    include: {
      objectives: {
        include: {
          sphere: true,
          keyResults: {
            include: {
              tactics: {
                include: { completions: true }
              }
            }
          },
          projects: {
            include: { tasks: true }
          }
        }
      }
    }
  });
  return sprint ? mapSprint(sprint) : null;
}

export async function upsertSprint(userId: string, input: UpsertSprintInput): Promise<SprintData> {
  const { id, number, year, startDate, endDate, status } = input;
  
  const saved = await prisma.sprint.upsert({
    where: { id: id ?? "" },
    create: { userId, number, year, startDate, endDate, status: status ?? "PLANNED" },
    update: { number, year, startDate, endDate, status },
    include: {
      objectives: {
        include: {
          sphere: true,
          keyResults: {
            include: {
              tactics: {
                include: { completions: true }
              }
            }
          },
          projects: {
            include: { tasks: true }
          }
        }
      }
    }
  });
  return mapSprint(saved);
}

// ─── Objectives ───────────────────────────────────────────────────────────────

export async function upsertObjective(userId: string, input: UpsertObjectiveInput): Promise<ObjectiveData> {
  const { id, sprintId, sphereId, title, description, status } = input;
  
  const saved = await prisma.objective.upsert({
    where: { id: id ?? "" },
    create: { sprintId, sphereId, title, description, status: status ?? "IN_PROGRESS" },
    update: { sphereId, title, description, status },
    include: {
      sphere: true,
      keyResults: {
        include: {
          tactics: {
            include: { completions: true }
          }
        }
      },
      projects: {
        include: { tasks: true }
      }
    }
  });
  return mapObjective(saved);
}

export async function deleteObjective(userId: string, id: string): Promise<void> {
  // Check ownership through sprint
  const obj = await prisma.objective.findUnique({
    where: { id },
    include: { sprint: true }
  });
  
  if (obj && obj.sprint.userId === userId) {
    await prisma.objective.delete({ where: { id } });
  }
}

// ─── Key Results ──────────────────────────────────────────────────────────────

export async function upsertKeyResult(userId: string, input: UpsertKeyResultInput): Promise<KeyResultData> {
  const { id, objectiveId, title, targetValue, currentValue, unit } = input;
  
  const saved = await prisma.keyResult.upsert({
    where: { id: id ?? "" },
    create: { objectiveId, title, targetValue, currentValue: currentValue ?? 0, unit },
    update: { title, targetValue, currentValue, unit },
    include: {
      tactics: {
        include: { completions: true }
      }
    }
  });
  return mapKeyResult(saved);
}

export async function updateKRValue(id: string, value: number): Promise<void> {
  await prisma.keyResult.update({
    where: { id },
    data: { currentValue: value }
  });
}

// ─── Tactics ──────────────────────────────────────────────────────────────────

export async function upsertTactic(userId: string, input: UpsertTacticInput): Promise<TacticData> {
  const { id, keyResultId, title, description, frequency } = input;
  
  const saved = await prisma.tactic.upsert({
    where: { id: id ?? "" },
    create: { keyResultId, title, description, frequency: frequency ?? "WEEKLY" },
    update: { title, description, frequency },
    include: { completions: true }
  });
  return mapTactic(saved);
}

export async function toggleTacticCompletion(tacticId: string, weekNumber: number, completed: boolean): Promise<void> {
  if (completed) {
    await prisma.tacticCompletion.upsert({
      where: { tacticId_weekNumber: { tacticId, weekNumber } },
      create: { tacticId, weekNumber, completed: true },
      update: { completed: true }
    });
  } else {
    await prisma.tacticCompletion.deleteMany({
      where: { tacticId, weekNumber }
    });
  }
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function upsertProject(userId: string, input: UpsertProjectInput): Promise<ProjectData> {
  const { id, objectiveId, title, description, status, startDate, endDate } = input;
  
  const saved = await prisma.project.upsert({
    where: { id: id ?? "" },
    create: { objectiveId, title, description, status: status ?? "TODO", startDate, endDate },
    update: { title, description, status, startDate, endDate },
    include: { tasks: true }
  });
  return mapProject(saved);
}

export async function deleteProject(userId: string, id: string): Promise<void> {
  // Check ownership through objective -> sprint
  const proj = await prisma.project.findUnique({
    where: { id },
    include: { objective: { include: { sprint: true } } }
  });
  
  if (proj && proj.objective.sprint.userId === userId) {
    await prisma.project.delete({ where: { id } });
  }
}

// ─── Alignment ────────────────────────────────────────────────────────────────

export async function getAlignmentData(userId: string) {
  const [vision, spheres, activeSprint] = await Promise.all([
    prisma.vision.findFirst({ where: { userId } }),
    prisma.lifeSphere.findMany({ 
      where: { userId }, 
      orderBy: { order: "asc" },
      include: { _count: { select: { tasks: true } } } 
    }),
    prisma.sprint.findFirst({
      where: { userId, status: "ACTIVE" },
      include: {
        objectives: {
          include: {
            sphere: true,
            keyResults: true,
            projects: { include: { tasks: true } }
          }
        }
      }
    })
  ]);

  return {
    vision,
    spheres: spheres.map(s => ({
      id: s.id,
      name: s.name,
      color: s.color,
      icon: s.icon,
      order: s.order,
      taskCount: s._count.tasks,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    })),
    activeObjectives: activeSprint?.objectives.map(mapObjective) || []
  };
}

export async function upsertVision(userId: string, title: string, content: string) {
  const existing = await prisma.vision.findFirst({ where: { userId } });
  
  return prisma.vision.upsert({
    where: { id: existing?.id || "" },
    create: { userId, title, content },
    update: { title, content }
  });
}

// ─── Sprint Reviews ───────────────────────────────────────────────────────────

export async function upsertSprintReview(userId: string, input: {
  id?: string;
  sprintId: string;
  weekNumber: number;
  score?: number | null;
  wins?: string | null;
  challenges?: string | null;
  adjustments?: string | null;
}) {
  const { id, sprintId, weekNumber, ...data } = input;
  
  // Check ownership
  const sprint = await prisma.sprint.findUnique({ where: { id: sprintId } });
  if (!sprint || sprint.userId !== userId) throw new Error("Unauthorized");

  return prisma.sprintReview.upsert({
    where: { id: id ?? "" },
    create: { sprintId, weekNumber, date: new Date(), ...data },
    update: data
  });
}

export async function getSprintReview(sprintId: string, weekNumber: number) {
  return prisma.sprintReview.findFirst({
    where: { sprintId, weekNumber }
  });
}

// ─── Annual Compass ───────────────────────────────────────────────────────────

export async function getAnnualCompass(userId: string, year: number) {
  return prisma.annualCompass.findUnique({
    where: { userId_year: { userId, year } }
  });
}

export async function upsertAnnualCompass(userId: string, input: {
  id?: string;
  year: number;
  theme?: string | null;
  wigs?: string | null;
  focusAreas?: string | null;
}) {
  const { id, year, ...data } = input;
  
  return prisma.annualCompass.upsert({
    where: { id: id ?? "" },
    create: { userId, year, ...data },
    update: data
  });
}
