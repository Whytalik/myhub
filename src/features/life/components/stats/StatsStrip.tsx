import { getDailyStats } from "../../services/journal-service";
import { Flame, Moon, Zap } from "lucide-react";

export async function StatsStrip() {
  const stats = await getDailyStats();

  return (
    <div className="flex items-center gap-6 bg-surface border border-border rounded-2xl px-6 py-4">
      {/* Streak */}
      <div className="flex items-center gap-2.5">
        <Flame size={16} className="text-accent" />
        <div className="flex flex-col">
          <span className="text-lg font-heading text-text leading-none">{stats.streak}</span>
          <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Streak</span>
        </div>
      </div>

      <div className="w-px h-8 bg-border" />

      {/* Avg sleep */}
      <div className="flex items-center gap-2.5">
        <Moon size={16} className="text-accent" />
        <div className="flex flex-col">
          <span className="text-lg font-heading text-text leading-none">
            {stats.avgSleep !== null ? stats.avgSleep.toFixed(1) : "—"}
          </span>
          <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Sleep (avg.)</span>
        </div>
      </div>

      <div className="w-px h-8 bg-border" />

      {/* Avg energy */}
      <div className="flex items-center gap-2.5">
        <Zap size={16} className="text-accent" />
        <div className="flex flex-col">
          <span className="text-lg font-heading text-text leading-none">
            {stats.avgEnergy !== null ? stats.avgEnergy.toFixed(1) : "—"}
          </span>
          <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Energy (avg.)</span>
        </div>
      </div>

      <div className="w-px h-8 bg-border" />

      {/* 7-day trend */}
      <div className="flex flex-col gap-1.5 flex-1">
        <span className="text-[10px] font-mono text-muted uppercase tracking-wider">7 days</span>
        <div className="flex items-end gap-1 h-8">
          {stats.recentEntries.length === 0 ? (
            <span className="text-[11px] text-muted italic">No data</span>
          ) : (
            [...stats.recentEntries].reverse().map((e, i) => {
              const height = e.energy !== null ? Math.round((e.energy / 10) * 100) : 10;
              return (
                <div
                  key={i}
                  title={`${e.date.toLocaleDateString("en-US", { day: "numeric", month: "short" })}: energy ${e.energy ?? "—"}`}
                  className="flex-1 rounded-sm bg-accent/30 hover:bg-accent/60 transition-colors cursor-default"
                  style={{ height: `${height}%` }}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
