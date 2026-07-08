import { TRAINING_ACCENT } from "./chart-tokens";

interface TonnageBarListProps {
  items: { muscleGroup: string; tonnage: number }[];
}

export function TonnageBarList({ items }: TonnageBarListProps) {
  const max = Math.max(...items.map((i) => i.tonnage), 1);

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item) => {
        const widthPercent = Math.max((item.tonnage / max) * 100, 3);
        return (
          <div key={item.muscleGroup} className="flex items-center gap-3 group">
            <span className="text-xs text-zinc-400 w-24 shrink-0 truncate">{item.muscleGroup}</span>
            <div className="flex-1 h-4 rounded-sm bg-white/[0.03] overflow-hidden">
              <div
                className="h-full rounded-r-[4px] transition-[width] duration-300 group-hover:brightness-110"
                style={{ width: `${widthPercent}%`, backgroundColor: TRAINING_ACCENT }}
              />
            </div>
            <span className="text-xs font-mono font-semibold text-zinc-200 w-16 text-right shrink-0">
              {item.tonnage.toLocaleString("uk-UA")} кг
            </span>
          </div>
        );
      })}
    </div>
  );
}
