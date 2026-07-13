import { getCachedLatestMission, getCachedMissionHistory } from "@/lib/cache/cache";
import { missionRepository } from "../repositories/mission.repository";

export async function getCurrentMission(userId: string) {
  return getCachedLatestMission(userId);
}

export async function getMissionHistory(userId: string) {
  return getCachedMissionHistory(userId);
}

// Append-only — every save is a brand new version, never an update, so past
// wording is preserved verbatim (see MissionVersion in schema.prisma).
export async function saveMission(userId: string, content: string) {
  const trimmed = content.trim();
  if (!trimmed) throw new Error("Mission content is required");
  return missionRepository.create(userId, trimmed);
}
