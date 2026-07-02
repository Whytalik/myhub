"use client";

import { useMemo, useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getWeekRange,
  shiftWeek,
  summarizeWeek,
  compareWeeks,
  extractPatterns,
} from "@/features/life/logic/review-analytics";
import type { ReviewEntryData, HabitData, TaskData, WeekRange } from "@/features/life/types";
import { SummaryTab } from "./SummaryTab";
import { TrendsTab } from "./TrendsTab";
import { PatternsTab } from "./PatternsTab";
import { RecapTab } from "./RecapTab";

interface Props {
  entries: ReviewEntryData[];
  habits: HabitData[];
  tasks: TaskData[];
}

function formatRange(range: WeekRange): string {
  const end = new Date(range.end.getTime() - 86400000);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  return `${fmt(range.start)} – ${fmt(end)}`;
}

export function ReviewClient({ entries, habits, tasks }: Props) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeTab, setActiveTab] = useState("summary");

  const currentRange = useMemo(() => shiftWeek(getWeekRange(), weekOffset), [weekOffset]);
  const previousRange = useMemo(() => shiftWeek(currentRange, -1), [currentRange]);

  const currentSummary = useMemo(
    () => summarizeWeek(entries, habits, tasks, currentRange),
    [entries, habits, tasks, currentRange],
  );
  const previousSummary = useMemo(
    () => summarizeWeek(entries, habits, tasks, previousRange),
    [entries, habits, tasks, previousRange],
  );
  const comparisons = useMemo(
    () => compareWeeks(currentSummary, previousSummary),
    [currentSummary, previousSummary],
  );
  const patterns = useMemo(() => extractPatterns(entries, habits), [entries, habits]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-2 py-1.5 w-fit">
        <button
          onClick={() => setWeekOffset((v) => v - 1)}
          className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
          title="Previous week"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-body font-mono text-text px-2 min-w-[9rem] text-center">
          {formatRange(currentRange)}
        </span>
        <button
          onClick={() => setWeekOffset((v) => Math.min(0, v + 1))}
          disabled={weekOffset >= 0}
          className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted"
          title="Next week"
        >
          <ChevronRight size={16} />
        </button>
        {weekOffset !== 0 && (
          <button
            onClick={() => setWeekOffset(0)}
            className="ml-1 px-2 py-1 rounded-lg text-caption font-mono uppercase tracking-wider text-accent hover:bg-accent/10 transition-colors"
          >
            This week
          </button>
        )}
      </div>

      <Tabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          {
            id: "summary",
            label: "Summary",
            content: <SummaryTab summary={currentSummary} comparisons={comparisons} />,
          },
          {
            id: "trends",
            label: "Trends",
            content: <TrendsTab entries={entries} latestWeekStart={currentRange.start} />,
          },
          { id: "patterns", label: "Patterns", content: <PatternsTab patterns={patterns} /> },
          { id: "recap", label: "Recap", content: <RecapTab summary={currentSummary} /> },
        ]}
      />
    </div>
  );
}
