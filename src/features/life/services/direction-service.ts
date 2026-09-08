import { getCachedDirections } from "@/lib/cache/cache";
import { prisma } from "@/lib/db/prisma";
import { directionRepository } from "../repositories/direction.repository";
import type { DirectionData, DirectionAction, UpsertDirectionInput } from "../types";

function toDirectionData(direction: {
  id: string;
  statement: string;
  actions: unknown;
  createdAt: Date;
  updatedAt: Date;
  sphere: { id: string; name: string; color: string; icon: string };
}): DirectionData {
  return {
    id: direction.id,
    sphereId: direction.sphere.id,
    sphereName: direction.sphere.name,
    sphereColor: direction.sphere.color,
    sphereIcon: direction.sphere.icon,
    statement: direction.statement,
    actions: (direction.actions as DirectionAction[] | null) ?? [],
    createdAt: direction.createdAt,
    updatedAt: direction.updatedAt,
  };
}

export async function getAllDirections(userId: string): Promise<DirectionData[]> {
  const directions = await getCachedDirections(userId);
  return directions.map(toDirectionData);
}

export async function upsertDirection(
  userId: string,
  input: UpsertDirectionInput,
): Promise<DirectionData> {
  const { sphereId, statement, actions = [] } = input;

  const trimmed = statement.trim();
  if (!trimmed) {
    throw new Error("statement-not-empty");
  }

  const sphere = await prisma.lifeSphere.findFirst({
    where: { id: sphereId, userId },
    select: { id: true },
  });
  if (!sphere) {
    throw new Error("sphere-not-found");
  }

  const direction = await directionRepository.upsert(sphereId, userId, {
    statement: trimmed,
    actions,
  });
  return toDirectionData(direction);
}

export async function deleteDirection(userId: string, sphereId: string): Promise<void> {
  await directionRepository.deleteBySphereId(sphereId, userId);
}
