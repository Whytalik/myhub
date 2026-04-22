export function calculateSprintWeek(startDate: Date): number {
  const now = new Date();
  const start = new Date(startDate);
  
  // Set to start of the day for accurate diff
  now.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const weekNumber = Math.ceil((diffDays + 1) / 7);
  return Math.max(1, Math.min(weekNumber, 13)); // 12 weeks + 1 review week
}
