// Wheel of Life (Co-Active Coaching's canonical 8) adapted for the app:
// merges Family+Friends, adds Romance and Environment/Space, drops the
// non-canonical "University". Lazily seeded the first time a user has zero
// spheres (see task-service.ts getAllSpheres) — not a migration script.
export const DEFAULT_SPHERES = [
  { name: "Health", color: "#22c55e", icon: "Heart", order: 0 },
  { name: "Work", color: "#3b82f6", icon: "Briefcase", order: 1 },
  { name: "Finance", color: "#10b981", icon: "DollarSign", order: 2 },
  { name: "Family & Friends", color: "#f59e0b", icon: "Users", order: 3 },
  { name: "Romance", color: "#ec4899", icon: "Gift", order: 4 },
  { name: "Personal Growth", color: "#a855f7", icon: "BookOpen", order: 5 },
  { name: "Fun & Recreation", color: "#06b6d4", icon: "Gamepad2", order: 6 },
  { name: "Environment / Space", color: "#78716c", icon: "Home", order: 7 },
];

// Seeded lazily into a user's board the first time it has zero statuses
// (see thought-service.ts getBoard) — not a one-time migration/seed script.
// Deliberately just Inbox for now — Хочу/Повинен (and any further filtering)
// come later once continuous capture is actually in use; the user can still
// add columns manually via the UI at any time.
export const DEFAULT_THOUGHT_STATUSES = [{ name: "Inbox", color: "#a3a3a3", order: 0 }];
