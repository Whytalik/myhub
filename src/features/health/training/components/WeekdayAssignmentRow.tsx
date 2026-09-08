const WEEKDAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];
const WEEKDAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function WeekdayAssignmentRow({
  dayId,
  assignments,
  onToggle,
}: {
  dayId: string;
  assignments: Record<number, string | null>;
  onToggle: (dayOfWeek: number, nextTrainingDayId: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {WEEKDAY_LETTERS.map((letter, dayOfWeek) => {
        const isAssignedHere = assignments[dayOfWeek] === dayId;
        const isAssignedElsewhere = !!assignments[dayOfWeek] && !isAssignedHere;
        const buttonClass = `flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-mono font-semibold transition-colors duration-150 border ${
          isAssignedHere
            ? "bg-accent-training/20 text-accent-training border-accent-training/40"
            : isAssignedElsewhere
              ? "bg-transparent text-zinc-700 border-white/[0.04]"
              : "bg-white/[0.03] text-zinc-500 border-white/[0.06] hover:bg-white/5"
        }`;

        return (
          <button
            key={dayOfWeek}
            type="button"
            title={WEEKDAY_NAMES[dayOfWeek]}
            onClick={() => onToggle(dayOfWeek, isAssignedHere ? null : dayId)}
            className={buttonClass}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
}
