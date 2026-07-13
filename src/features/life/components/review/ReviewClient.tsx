"use client";

import { useMemo, useState } from "react";
import { Tabs } from "@/components/ui/navigation/tabs";
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
import { KaizenTab } from "./KaizenTab";

interface Props {
  entries: ReviewEntryData[];
  habits: HabitData[];
  tasks: TaskData[];
  activeSprint: any | null;
}

function formatRange(range: WeekRange): string {
  const end = new Date(range.end.getTime() - 86400000);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  return `${fmt(range.start)} – ${fmt(end)}`;
}

export function ReviewClient({ entries, habits, tasks, activeSprint }: Props) {
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

  const isCurrentWeek = weekOffset === 0;
  const navButtonClass =
    "p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setWeekOffset((v) => v - 1)}
          title="Previous week"
          className={navButtonClass}
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-panel-title">{formatRange(currentRange)}</span>
        <button
          onClick={() => setWeekOffset((v) => Math.min(0, v + 1))}
          disabled={isCurrentWeek}
          title="Next week"
          className={navButtonClass}
        >
          <ChevronRight size={16} />
        </button>
        {!isCurrentWeek && (
          <button
            onClick={() => setWeekOffset(0)}
            className="text-xs font-semibold text-accent hover:opacity-80 transition-opacity"
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
          {
            id: "kaizen",
            label: "Kaizen",
            content: (
              <KaizenTab
                tasks={tasks}
                activeSprint={activeSprint}
                weekStart={currentRange.start}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
