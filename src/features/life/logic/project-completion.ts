// A project is complete once every top-level item (group or standalone atom)
// is DONE or CANCELLED and at least one is actually DONE. Groups flip to DONE
// on their own when all their sub-atoms are finished (see task-service
// autoCompleteParentIfAllChildrenDone), so top-level statuses are enough.
export function isProjectComplete(topLevelStatuses: readonly string[]): boolean {
  if (!topLevelStatuses.includes("DONE")) return false;
  return topLevelStatuses.every((status) => status === "DONE" || status === "CANCELLED");
}
