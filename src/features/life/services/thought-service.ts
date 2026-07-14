import { getCachedThoughtBoard } from "@/lib/cache/cache";
import { thoughtStatusRepository } from "../repositories/thought-status.repository";
import { thoughtRepository } from "../repositories/thought.repository";
import { prisma } from "@/lib/db/prisma";
import { sphereRepository } from "../repositories/sphere.repository";
import { DEFAULT_THOUGHT_STATUSES } from "../constants";
import { Prisma } from "@/app/generated/prisma";
import type { UpsertThoughtStatusInput, UpsertThoughtInput } from "../types";
import { getThoughtTypeConfig, type ThoughtType } from "../logic/thought-types";
import { FILTER_OUTCOME_STATUS, type FilterOutcome } from "../logic/filter-outcomes";

export async function getBoard(userId: string) {
  // Uncached check so a first-ever visit doesn't cache an empty board before
  // the defaults exist (revalidateTag isn't available from this render path).
  const existingCount = await thoughtStatusRepository.count(userId);
  if (existingCount === 0) {
    await thoughtStatusRepository.createMany(
      DEFAULT_THOUGHT_STATUSES.map((status) => ({ ...status, userId })),
    );
  }
  return getCachedThoughtBoard(userId);
}

export async function upsertStatus(userId: string, input: UpsertThoughtStatusInput) {
  const { id, ...data } = input;
  if (id) {
    return thoughtStatusRepository.update(id, userId, data);
  }
  if (!data.name) throw new Error("Name is required");
  const count = await thoughtStatusRepository.count(userId);
  return thoughtStatusRepository.create({
    name: data.name,
    color: data.color,
    order: data.order ?? count,
    userId,
  });
}

export async function deleteStatus(userId: string, id: string) {
  return thoughtStatusRepository.delete(id, userId);
}

export async function reorderStatuses(userId: string, orderedStatusIds: string[]) {
  const statuses = await thoughtStatusRepository.findManyByIds(orderedStatusIds, userId);
  if (statuses.length !== orderedStatusIds.length) {
    throw new Error("Status not found or unauthorized");
  }
  return thoughtStatusRepository.reorder(userId, orderedStatusIds);
}

export async function upsertThought(userId: string, input: UpsertThoughtInput) {
  const { id, sphereId, templateData, ...data } = input;

  if (sphereId) {
    const spheres = await sphereRepository.findAll(userId);
    if (!spheres.some((sphere) => sphere.id === sphereId)) {
      throw new Error("Sphere not found or unauthorized");
    }
  }

  // Json? columns need Prisma.DbNull to clear to SQL NULL — passing raw
  // `null` is ambiguous between "no value" and "the JSON literal null"
  // (same pattern as journal-service.ts confidenceLog/dailyVector).
  const templateDataValue =
    templateData === undefined
      ? undefined
      : templateData === null
        ? Prisma.DbNull
        : (templateData as unknown as Prisma.InputJsonValue);

  if (id) {
    return thoughtRepository.update(id, userId, {
      ...data,
      sphereId: sphereId === undefined ? undefined : (sphereId ?? null),
      templateData: templateDataValue,
    });
  }

  if (!data.statusId) throw new Error("statusId is required to create a thought");
  if (!data.content) throw new Error("Content is required");

  const [status] = await thoughtStatusRepository.findManyByIds([data.statusId], userId);
  if (!status) throw new Error("Status not found or unauthorized");

  return thoughtRepository.create({
    content: data.content,
    statusId: data.statusId,
    order: data.order ?? (await thoughtRepository.countInStatus(data.statusId, userId)),
    type: data.type ?? undefined,
    templateData: templateDataValue,
    sphereId: sphereId ?? undefined,
    userId,
  });
}

export async function deleteThought(userId: string, id: string) {
  return thoughtRepository.delete(id, userId);
}

// Zero-friction capture entry point: resolve the Inbox column by name (not a
// hardcoded order index, since columns are user-reorderable) and drop the
// thought straight in. `extra` is only populated when the user chose
// "Continue filling" past the one-line quick capture — omitted entirely,
// capture stays untyped/unsphered as before.
export async function quickCapture(
  userId: string,
  content: string,
  extra?: {
    sphereId?: string | null;
    type?: ThoughtType | null;
    templateData?: Record<string, string> | null;
  },
) {
  const trimmed = content.trim();
  if (!trimmed) throw new Error("Content is required");

  const board = await getBoard(userId);
  const inbox = board.find((status) => status.name === "Inbox") ?? board[0];
  if (!inbox) throw new Error("No inbox status available");

  return upsertThought(userId, { statusId: inbox.id, content: trimmed, ...extra });
}

// Evening Review session outcome routing — resolves the destination status
// by name (creating it lazily, same spirit as the "Inbox" default) and
// appends the thought there. DELETE has no destination: it's a hard delete,
// per the user's own "сміливо видаляй" wording for the Q1b "nothing
// catastrophic" branch specifically.
export async function routeThought(userId: string, thoughtId: string, outcome: FilterOutcome) {
  if (outcome === "DELETE") {
    return thoughtRepository.delete(thoughtId, userId);
  }

  const target = FILTER_OUTCOME_STATUS[outcome];
  if (!target) throw new Error(`No destination configured for outcome "${outcome}"`);

  const board = await getBoard(userId);
  let destination = board.find((status) => status.name === target.name);

  if (!destination) {
    const created = await thoughtStatusRepository.create({
      name: target.name,
      color: target.color,
      order: board.length,
      userId,
    });
    destination = { ...created, thoughts: [] };
  }

  const nextOrder = destination.thoughts.length;
  return thoughtRepository.moveToEnd(userId, thoughtId, destination.id, nextOrder);
}

export async function moveThought(
  userId: string,
  thoughtId: string,
  targetStatusId: string,
  orderedIdsInTargetColumn: string[],
) {
  const [status] = await thoughtStatusRepository.findManyByIds([targetStatusId], userId);
  if (!status) throw new Error("Status not found or unauthorized");

  return thoughtRepository.moveAndReorder(
    userId,
    thoughtId,
    targetStatusId,
    orderedIdsInTargetColumn,
  );
}

export async function decomposeThought(
  userId: string,
  input: {
    thoughtId: string;
    type: "task" | "project";
    taskTitle?: string;
    sphereId?: string | null;
    description?: string | null;
    priority?: string;
    projectTitle?: string;
    atomTitle?: string;
    atomDescription?: string | null;
  },
) {
  const {
    thoughtId,
    type,
    taskTitle,
    sphereId,
    description,
    priority = "MEDIUM",
    projectTitle,
    atomTitle,
    atomDescription,
  } = input;

  // Verify thought ownership/existence
  const thought = await prisma.thought.findUnique({
    where: { id: thoughtId, userId },
  });
  if (!thought) {
    throw new Error("Thought not found or unauthorized");
  }

  // Format template details if present
  let formattedDescription = description || "";
  if (thought.type) {
    const config = getThoughtTypeConfig(thought.type);
    const typeLabel = config?.label || thought.type;
    let templateText = `📋 Type: ${typeLabel}`;
    if (thought.templateData && typeof thought.templateData === "object") {
      const data = thought.templateData as Record<string, string>;
      const fieldsText = Object.entries(data)
        .filter(([_, val]) => val && val.trim())
        .map(([key, val]) => {
          const fieldLabel = config?.fields.find((f) => f.key === key)?.label || key;
          return `• ${fieldLabel}: ${val}`;
        })
        .join("\n");
      if (fieldsText) {
        templateText += `\n${fieldsText}`;
      }
    }
    formattedDescription = formattedDescription
      ? `${templateText}\n\n${formattedDescription}`
      : templateText;
  }

  return prisma.$transaction(async (tx) => {
    if (type === "task") {
      const title = taskTitle || thought.content;
      const createdTask = await tx.task.create({
        data: {
          userId,
          title,
          description: formattedDescription || null,
          status: "TODO",
          priority: priority as any,
          sphereId: sphereId || thought.sphereId,
          depth: 0,
        },
      });

      await tx.thought.delete({
        where: { id: thoughtId, userId },
      });

      return { type: "task" as const, task: createdTask };
    } else {
      const title = projectTitle || thought.content;
      const createdProject = await tx.project.create({
        data: {
          userId,
          title,
          description: formattedDescription || null,
          status: "TODO",
        },
      });

      const createdTask = await tx.task.create({
        data: {
          userId,
          title: atomTitle || "Перший крок проєкту",
          description: atomDescription || null,
          status: "TODO",
          priority: priority as any,
          projectId: createdProject.id,
          sphereId: sphereId || thought.sphereId,
          depth: 0,
        },
      });

      await tx.thought.delete({
        where: { id: thoughtId, userId },
      });

      return {
        type: "project" as const,
        project: createdProject,
        task: createdTask,
      };
    }
  });
}

export async function getThoughtsForWizard(userId: string) {
  return prisma.thought.findMany({
    where: { userId },
    include: {
      status: true,
      sphere: true,
    },
    orderBy: { createdAt: "asc" },
  });
}
