// Exercise names containing these keywords load multiple joints/muscle
// groups at once (squat/press/pull/hinge patterns), so a single working set
// benefits from one light warm-up set to groove the pattern and raise
// tissue temperature before loading up.
const COMPOUND_KEYWORDS = [
  "присід",
  "жим",
  "тяга",
  "станова",
  "випад",
  "підтягув",
  "віджим",
  "гребл",
  "рвання",
  "поштовх",
  "трастер",
];

export function isCompoundExercise(exerciseName: string): boolean {
  const lower = exerciseName.toLowerCase();
  return COMPOUND_KEYWORDS.some((keyword) => lower.includes(keyword));
}
