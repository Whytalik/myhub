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
    <div >
      <span >
        <Icon size={14} /> {title}
      </span>
      {items.length === 0 ? (
        <p >{empty}</p>
      ) : (
        <div >
          {items.map((item, i) => (
            <p
              key={i}

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
    <div >
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

      <div >
        <span >
          Emotion balance
        </span>
        {emotionBalance.ratio === null ? (
          <p >No emotions logged this week.</p>
        ) : (
          <div >
            <div >
              <div

              />
            </div>
            <div >
              {emotionBalance.top.map((e) => (
                <span
                  key={e.label}

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
