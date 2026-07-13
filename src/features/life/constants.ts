export const DEFAULT_SPHERES = [
  { name: "Health", color: "#22c55e", icon: "Heart", order: 0 },
  { name: "Work", color: "#3b82f6", icon: "Briefcase", order: 1 },
  { name: "Family", color: "#f59e0b", icon: "Users", order: 2 },
  { name: "Finance", color: "#10b981", icon: "DollarSign", order: 3 },
  { name: "University", color: "#8b5cf6", icon: "University", order: 4 },
  { name: "Personal Growth", color: "#a855f7", icon: "BookOpen", order: 5 },
  { name: "Fun", color: "#ec4899", icon: "Smile", order: 6 },
];

// Seeded lazily into a user's board the first time it has zero statuses
// (see thought-service.ts getBoard) — not a one-time migration/seed script.
export const DEFAULT_THOUGHT_STATUSES = [
  { name: "Беклог", color: "#a3a3a3", order: 0 },
  { name: "Хочу", color: "#818cf8", order: 1 },
  { name: "Повинен", color: "#ff8c00", order: 2 },
];
