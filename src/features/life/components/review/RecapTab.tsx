import { Sparkles, HeartHandshake, ArrowUpRight, type LucideIcon } from "lucide-react";
import type { WeekSummary } from "@/features/life/types";

interface Props {
  summary: WeekSummary;
}

function Section({
  icon: Icon,
  title,
  items,
  empty,
}: {
  icon: LucideIcon;
  title: string;
  items: string[];
  empty: string;
}) {
  return (
    <div className="glass-card p-4 flex flex-col gap-2">
      <span className="text-panel-title flex items-center gap-2">
        <Icon size={14} /> {title}
      </span>
      {items.length === 0 ? (
        <p className="text-caption">{empty}</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {items.map((item, i) => (
            <p key={i} className="text-sm text-zinc-300 italic">
              &ldquo;{item}&rdquo;
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function RecapTab({ summary }: Props) {
  const { emotionBalance } = summary;
  const positivePct = emotionBalance.ratio !== null ? Math.round(emotionBalance.ratio * 100) : 0;

  return (
    <div className="flex flex-col gap-3">
      <Section
        icon={Sparkles}
        title="Wins"
        items={summary.wins}
        empty="No wins logged this week."
      />
      <Section
        icon={HeartHandshake}
        title="Gratitude"
        items={summary.gratitudeNotes}
        empty="No gratitude notes this week."
      />
      <Section
        icon={ArrowUpRight}
        title="To improve"
        items={summary.improvements}
        empty="No improvement notes this week."
      />

      <div className="glass-card p-4 flex flex-col gap-3">
        <span className="text-panel-title">Emotion balance</span>
        {emotionBalance.ratio === null ? (
          <p className="text-caption">No emotions logged this week.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="h-2 rounded-full bg-rose-500/20 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${positivePct}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {emotionBalance.top.map((e) => (
                <span
                  key={e.label}
                  className="inline-flex items-center px-2 py-1 rounded-md bg-white/5 text-caption"
                >
                  {e.label} × {e.count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
