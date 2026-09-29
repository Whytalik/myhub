import { WEEKLY_EXECUTION_TARGET, type WeeklyReviewData } from "@/features/life/types";

const WEEKS_IN_SPRINT = 12;

export function ReviewHistory({ data }: { data: WeeklyReviewData }) {
  const byWeek = new Map(data.history.map((entry) => [entry.weekNumber, entry]));

  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-panel-title">Sprint {data.sprint.number} · weeks</span>
        <span className="text-[11px] font-mono text-zinc-400">
          {data.streak > 0 ? `${data.streak}-week streak 🔥` : "No streak yet"}
        </span>
      </div>
      <div className="relative grid grid-cols-12 gap-1 items-end h-24">
        <div
          className="absolute left-0 right-0 border-t border-dashed border-white/20"
          style={{ bottom: `${WEEKLY_EXECUTION_TARGET}%` }}
          title={`Target ${WEEKLY_EXECUTION_TARGET}%`}
        />
        {Array.from({ length: WEEKS_IN_SPRINT }, (_, index) => {
          const weekNumber = index + 1;
          const entry = byWeek.get(weekNumber);
          const percent = entry?.executionPercent ?? null;
          const barClassName = `w-full rounded-sm ${
            percent === null
              ? "bg-white/[0.06]"
              : percent >= WEEKLY_EXECUTION_TARGET
                ? "bg-emerald-400"
                : "bg-accent-life"
          }`;
          const isCurrent = weekNumber === data.weekNumber;
          return (
            <div
              key={weekNumber}
              className="flex flex-col items-center justify-end h-full gap-1"
              title={`W${weekNumber}: ${percent === null ? "no data" : `${percent}%`}${entry?.score ? `, score ${entry.score}` : ""}`}
            >
              <div className={barClassName} style={{ height: `${Math.max(percent ?? 4, 4)}%` }} />
              <span
                className={`text-[9px] font-mono ${isCurrent ? "text-accent-life" : "text-zinc-600"}`}
              >
                {weekNumber}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
