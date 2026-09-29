import { sphereRoleRepository } from "../repositories/sphere-role.repository";
import type { SphereRoleData } from "../types";
import * as yearFocusService from "./year-focus-service";

const STORED_ROLES = ["ACTIVE", "MINIMUM", "OFF"] as const;
export type StoredSphereRole = (typeof STORED_ROLES)[number];

// Roles for every sphere id passed in: the focus sphere is FOCUS, a stored role wins
// next, and a sphere without a row is ACTIVE.
export async function getRolesForYear(
  userId: string,
  year: number,
  sphereIds: string[],
): Promise<SphereRoleData[]> {
  const [rows, focus] = await Promise.all([
    sphereRoleRepository.findByYear(userId, year),
    yearFocusService.getFocus(userId, year),
  ]);
  const byId = new Map(rows.map((row) => [row.sphereId, row]));

  return sphereIds.map((sphereId) => {
    if (focus?.sphereId === sphereId)
      return { sphereId, role: "FOCUS", plank: byId.get(sphereId)?.plank ?? null };
    const row = byId.get(sphereId);
    return { sphereId, role: row?.role ?? "ACTIVE", plank: row?.plank ?? null };
  });
}

export async function setRole(
  userId: string,
  input: { year: number; sphereId: string; role: StoredSphereRole; plank?: string | null },
): Promise<void> {
  if (!STORED_ROLES.includes(input.role)) throw new Error("Invalid role");
  if (!(await sphereRoleRepository.findSphereForUser(input.sphereId, userId))) {
    throw new Error("Sphere not found");
  }
  const focus = await yearFocusService.getFocus(userId, input.year);
  if (focus?.sphereId === input.sphereId && input.role !== "ACTIVE") {
    throw new Error("The focus sphere can't be minimum or off. Change the focus first.");
  }
  await sphereRoleRepository.upsert(
    userId,
    input.sphereId,
    input.year,
    input.role,
    input.plank?.trim() || null,
  );
}
