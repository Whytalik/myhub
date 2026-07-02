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
    <div className="flex flex-col gap-3">
      <span className="text-caption font-mono uppercase tracking-wider text-muted flex items-center gap-2">
        <Icon size={14} className="text-accent/60" /> {title}
      </span>
      {items.length === 0 ? (
        <p className="text-body text-muted italic">{empty}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item, i) => (
            <p
              key={i}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-body text-secondary italic"
            >
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

  return (
    <div className="flex flex-col gap-8">
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

      <div className="flex flex-col gap-3">
        <span className="text-caption font-mono uppercase tracking-wider text-muted">
          Emotion balance
        </span>
        {emotionBalance.ratio === null ? (
          <p className="text-body text-muted italic">No emotions logged this week.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="h-2 rounded-full bg-rose-500/20 overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${Math.round(emotionBalance.ratio * 100)}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {emotionBalance.top.map((e) => (
                <span
                  key={e.label}
                  className={`px-2 py-1 rounded-lg border text-caption font-medium ${
                    e.positive
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-600"
                  }`}
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
