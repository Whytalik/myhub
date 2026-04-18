export function getStartOfDay(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function calculateStreak(completions: { date: Date }[]): number {
  if (completions.length === 0) return 0;
  
  const today = getStartOfDay();
  const completionDates = new Set(completions.map(c => new Date(c.date).setHours(0, 0, 0, 0)));
  
  let streak = 0;
  let checkDate = today;
  
  // If not completed today, check if it was completed yesterday to keep streak alive
  if (!completionDates.has(checkDate.getTime())) {
    checkDate = new Date(today.getTime() - 86400000);
  }

  while (completionDates.has(checkDate.getTime())) {
    streak++;
    checkDate = new Date(checkDate.getTime() - 86400000);
  }

  return streak;
}
