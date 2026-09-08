import { getCachedMission } from "@/lib/cache/cache";
import { missionRepository } from "../repositories/mission.repository";

export async function getCurrentMission(userId: string) {
  return getCachedMission(userId);
}

// Living document — save updates the single mission row in place (see
// Mission in schema.prisma), unlike a versioned history.
export async function saveMission(userId: string, content: string) {
  const trimmed = content.trim();
  if (!trimmed) throw new Error("Mission content is required");
  return missionRepository.save(userId, trimmed);
}