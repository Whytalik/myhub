"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { Tabs } from "@/components/ui/navigation/tabs";
import { Moon, Zap, Utensils, CheckCircle2, ChevronDown, Smile, Weight, Trash2 } from "lucide-react";
import { ROUTINE_ITEMS, type RoutineMap } from "@/lib/life/routine-items";
import { deleteEntryAction } from "../actions/journal-actions";
import { ConfirmationDialog } from "@/components/ui/overlays/dialog";

interface HistoryEntry {
  id: string;
  date: Date;
  sleepHours: number | null;
  energy: number | null;
  mood: number | null;
  weight: number | null;
  nutrition: number | null;
  winToday: string | null;
  morningRoutine: unknown;
  eveningRoutine: unknown;
}

interface Props {
  entries: HistoryEntry[];
}

function routineScore(morning: unknown, evening: unknown): number | null {
  const totalItems = ROUTINE_ITEMS.length;
  if (totalItems === 0) return null;

  const morningMap = morning as RoutineMap | null;
  const eveningMap = evening as RoutineMap | null;

  if (!morningMap && !eveningMap) return null;

  let done = 0;
  ROUTINE_ITEMS.forEach(item => {
    if ((morningMap && morningMap[item.id]) || (eveningMap && eveningMap[item.id])) {
      done++;
    }
  });

  return Math.round((done / totalItems) * 100);
}

function getWeekNumber(d: Date) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

export function JournalHistoryView({ entries }: Props) {
  const [activeTab, setActiveTab] = useState("all");
  const [visibleGroups, setVisibleGroups] = useState(3);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteEntryAction(id);
      if (result.success) setDeleteId(null);
    });
  };

  const groupedEntries = useMemo(() => {
    if (activeTab === "all") return { "Recent Entries": entries };

    const groups: Record<string, HistoryEntry[]> = {};

    entries.forEach(e => {
      const date = new Date(e.date);
      let key = "";

      if (activeTab === "weeks") {
        const week = getWeekNumber(date);
        key = `Week ${week}, ${date.getFullYear()}`;
      } else if (activeTab === "months") {
        key = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      } else if (activeTab === "quarters") {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `Q${quarter} ${date.getFullYear()}`;
      } else if (activeTab === "years") {
        key = date.getFullYear().toString();
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });

    return groups;
  }, [entries, activeTab]);

  const groupKeys = Object.keys(groupedEntries);
  const displayedKeys = groupKeys.slice(0, visibleGroups);
  const hasMore = groupKeys.length > visibleGroups;

  return (
    <div >
      <div >
        <Tabs
          tabs={[
            { id: "all", label: "All" },
            { id: "weeks", label: "Weeks" },
            { id: "months", label: "Months" },
            { id: "quarters", label: "Quarters" },
            { id: "years", label: "Years" },
          ]}
          activeTab={activeTab}
          onTabChange={(id) => {
            setActiveTab(id);
            setVisibleGroups(3);
          }}
        />
      </div>

      <div >
        {displayedKeys.map(key => (
          <div key={key} >
            <div >
              <div />
              <span >{key}</span>
              <div />
            </div>

            <div >
              {groupedEntries[key].map((e) => {
                const dateStr = e.date.toISOString().slice(0, 10);
                const label = new Date(e.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                });
                const score = routineScore(e.morningRoutine, e.eveningRoutine);

                return (
                  <div key={e.id} >
                    <Link
                      href={`/life/journal?date=${dateStr}`}

                    >
                      <span >
                        {label}
                      </span>

                        <div >
                        <span title="Sleep">
                          <Moon size={12} />
                          {e.sleepHours !== null ? `${e.sleepHours}h` : "—"}
                        </span>
                        <span title="Energy">
                          <Zap size={12} />
                          {e.energy !== null ? `${e.energy}/10` : "—"}
                        </span>
                        <span title="Mood">
                          <Smile size={12} />
                          {e.mood !== null ? `${e.mood}/10` : "—"}
                        </span>
                        {e.weight !== null && (
                          <span title="Weight">
                            <Weight size={12} />
                            {e.weight}kg
                          </span>
                        )}
                        <span title="Nutrition Adherence">
                          <Utensils size={12} />
                          {e.nutrition !== null ? `${e.nutrition}/5` : "—"}
                        </span>
                        <span title="Routine Score">
                          <CheckCircle2 size={12} />
                          {score !== null ? `${score}%` : "—"}
                        </span>
                      </div>

                      {e.winToday && (
                        <span >
                          &ldquo;{e.winToday}&rdquo;
                        </span>
                      )}

                      <span >
                        →
                      </span>
                    </Link>

                    <button
                      onClick={() => setDeleteId(e.id)}

                      title="Delete Entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <ConfirmationDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Journal Entry"
        description="Are you sure you want to delete this entry? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />

      {hasMore && (
        <button
          onClick={() => setVisibleGroups(prev => prev + 5)}

        >
          <ChevronDown size={14} />
          Show More Groups
        </button>
      )}
    </div>
  );
}
