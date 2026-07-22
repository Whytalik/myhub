"use client";

import { useState, useTransition } from "react";
import { Dumbbell, Clock, Settings } from "lucide-react";
import { Select } from "@/components/ui/inputs/select";
import { Button } from "@/components/ui/actions/button";
import { upsertDayScheduleAction } from "../actions/schedule-actions";
import type { DayScheduleData, ContextBlock } from "../types";
import { getDefaultBlocks } from "../logic/context-blocks";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const NONE_VALUE = "__none__";

const EVENING_BLOCKS = {
  family: {
    id: "family",
    name: "Family / Romance",
    startTime: "18:00",
    endTime: "19:45",
    bufferMinutes: 15,
    sphereNames: ["Family & Friends", "Romance"],
  },
  hobby: {
    id: "hobby",
    name: "Growth / Hobby",
    startTime: "18:00",
    endTime: "19:45",
    bufferMinutes: 15,
    sphereNames: ["Personal Growth", "Fun & Recreation", "Environment / Space"],
  },
};

function todayDayOfWeek(): number {
  return (new Date().getDay() + 6) % 7;
}

interface Props {
  initialTemplates: DayScheduleData[];
  trainingDays: { id: string; name: string }[];
}

export function WeekScheduleClient({ initialTemplates, trainingDays }: Props) {
  const [daysData, setDaysData] = useState<
    Record<number, { trainingDayId: string | null; contextBlocks: ContextBlock[] }>
  >(() => {
    const map: Record<number, { trainingDayId: string | null; contextBlocks: ContextBlock[] }> = {};
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const template = initialTemplates.find((t) => t.dayOfWeek === dayOfWeek);
      map[dayOfWeek] = {
        trainingDayId: template?.trainingDayId ?? null,
        contextBlocks: template?.contextBlocks || getDefaultBlocks(dayOfWeek),
      };
    }
    return map;
  });

  const [pending, setPending] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const [editingBlock, setEditingBlock] = useState<{
    dayOfWeek: number;
    blockIndex: number;
    block: ContextBlock;
  } | null>(null);

  const today = todayDayOfWeek();

  const setTrainingDay = (dayOfWeek: number, trainingDayId: string | null) => {
    setPending(dayOfWeek);
    const previousData = daysData[dayOfWeek];
    setDaysData((state) => ({
      ...state,
      [dayOfWeek]: { ...state[dayOfWeek], trainingDayId },
    }));

    startTransition(async () => {
      const result = await upsertDayScheduleAction({
        dayOfWeek,
        trainingDayId,
        contextBlocks: previousData.contextBlocks,
      });
      if (!result.success) {
        setDaysData((state) => ({ ...state, [dayOfWeek]: previousData }));
      }
      setPending(null);
    });
  };

  const changeEveningBlockType = (dayOfWeek: number, type: "family" | "hobby") => {
    const current = daysData[dayOfWeek];
    const newBlocks = [...current.contextBlocks];
    const eveningBlockIndex = newBlocks.findIndex((block) => block.startTime === "18:00");
    if (eveningBlockIndex === -1) {
      return;
    }

    newBlocks[eveningBlockIndex] = {
      ...EVENING_BLOCKS[type],
      enabled: newBlocks[eveningBlockIndex].enabled, // Preserve active state
    };

    setPending(dayOfWeek);
    const previousData = daysData[dayOfWeek];
    setDaysData((state) => ({
      ...state,
      [dayOfWeek]: { ...state[dayOfWeek], contextBlocks: newBlocks },
    }));

    startTransition(async () => {
      const result = await upsertDayScheduleAction({
        dayOfWeek,
        trainingDayId: current.trainingDayId,
        contextBlocks: newBlocks,
      });
      if (!result.success) {
        setDaysData((state) => ({ ...state, [dayOfWeek]: previousData }));
      }
      setPending(null);
    });
  };

  const saveBlockChanges = () => {
    if (!editingBlock) {
      return;
    }
    const { dayOfWeek, blockIndex, block } = editingBlock;

    const current = daysData[dayOfWeek];
    const newBlocks = [...current.contextBlocks];
    newBlocks[blockIndex] = block;

    setPending(dayOfWeek);
    const previousData = daysData[dayOfWeek];
    setDaysData((state) => ({
      ...state,
      [dayOfWeek]: { ...state[dayOfWeek], contextBlocks: newBlocks },
    }));

    startTransition(async () => {
      const result = await upsertDayScheduleAction({
        dayOfWeek,
        trainingDayId: current.trainingDayId,
        contextBlocks: newBlocks,
      });
      if (!result.success) {
        setDaysData((state) => ({ ...state, [dayOfWeek]: previousData }));
      }
      setPending(null);
      setEditingBlock(null);
    });
  };

  const getBlockBorderColor = (blockId: string) => {
    switch (blockId) {
      case "health":
      case "recovery":
        return "border-l-emerald-500/60";
      case "work":
        return "border-l-blue-500/60";
      case "family":
      case "romance":
        return "border-l-rose-500/60";
      case "hobby":
        return "border-l-purple-500/60";
      case "kaizen":
        return "border-l-amber-500/60";
      default:
        return "border-l-zinc-500/60";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {trainingDays.length === 0 && (
        <div className="glass-card p-4 flex items-center gap-2.5">
          <Dumbbell size={16} className="text-zinc-500 shrink-0" />
          <p className="text-caption">
            No training days found — add them in Training space.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {DAY_NAMES.map((name, dayOfWeek) => {
          const isToday = dayOfWeek === today;
          const { trainingDayId, contextBlocks } = daysData[dayOfWeek];
          const isPending = pending === dayOfWeek;
          
          const cardClass = `glass-card p-4 flex flex-col gap-4 border ${
            isToday ? "border-accent/40 bg-accent/[0.01]" : "border-white/[0.06]"
          } ${isPending ? "opacity-60" : ""} transition-all duration-150`;

          const iconWrapClass = `flex items-center justify-center w-7 h-7 rounded-lg border ${
            trainingDayId
              ? "border-accent-training/40 bg-accent-training/10 text-accent-training"
              : "border-white/[0.08] bg-white/[0.03] text-zinc-400"
          }`;

          return (
            <div key={dayOfWeek} className={cardClass}>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold ${isToday ? "text-accent" : "text-zinc-200"}`}
                >
                  {name} {isToday && <span className="text-[10px] font-normal opacity-85">(Today)</span>}
                </span>
                <div className={iconWrapClass}>
                  <Dumbbell size={14} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Training Day
                </span>
                <Select
                  disabled={isPending || trainingDays.length === 0}
                  value={trainingDayId ?? NONE_VALUE}
                  onChange={(e) =>
                    setTrainingDay(dayOfWeek, e.target.value === NONE_VALUE ? null : e.target.value)
                  }
                >
                  <option value={NONE_VALUE}>No Training</option>
                  {trainingDays.map((trainingDay) => (
                    <option key={trainingDay.id} value={trainingDay.id}>
                      {trainingDay.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Contextual Time Blocks */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Contextual Time Blocks
                  </span>
                  <Clock size={12} className="text-zinc-500" />
                </div>

                <div className="flex flex-col gap-2">
                  {contextBlocks.map((block, index) => {
                    const blockBorder = getBlockBorderColor(block.id);
                    const isBlockEnabled = block.enabled !== false;
                    return (
                      <div
                        key={block.id + "-" + index}
                        className={`flex flex-col gap-1.5 p-2.5 rounded-lg bg-white/[0.01] border border-white/[0.04] border-l-2 ${blockBorder} ${
                          isBlockEnabled ? "" : "opacity-35"
                        } transition-opacity duration-150`}
                      >
                        <div className="flex items-center justify-between">
                          {block.startTime === "18:00" ? (
                            <Select
                              variant="inline"
                              disabled={isPending}
                              value={block.id === "family" ? "family" : "hobby"}
                              onChange={(e) =>
                                changeEveningBlockType(dayOfWeek, e.target.value as "family" | "hobby")
                              }
                              className="text-xs font-semibold text-zinc-200 w-auto pr-6 font-sans"
                            >
                              <option value="family" className="bg-zinc-900 text-zinc-200 text-xs">
                                Family / Romance
                              </option>
                              <option value="hobby" className="bg-zinc-900 text-zinc-200 text-xs">
                                Growth / Hobby
                              </option>
                            </Select>
                          ) : (
                            <span className="text-xs font-semibold text-zinc-200">
                              {block.name} {!isBlockEnabled && "(Inactive)"}
                            </span>
                          )}

                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              setEditingBlock({
                                dayOfWeek,
                                blockIndex: index,
                                block: { ...block },
                              })
                            }
                            className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-zinc-200 transition-colors disabled:opacity-20"
                            title="Edit block"
                          >
                            <Settings size={12} />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-zinc-500">
                          <span>
                            {block.startTime} – {block.endTime}
                            {block.bufferMinutes > 0 && ` (+${block.bufferMinutes}m buffer)`}
                          </span>
                        </div>

                        {isBlockEnabled && block.sphereNames.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {block.sphereNames.map((sphereName) => (
                              <span
                                key={sphereName}
                                className="px-1.5 py-0.2 rounded bg-white/[0.04] text-zinc-400 text-[9px] border border-white/[0.04]"
                              >
                                {sphereName}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ⚙️ Edit Context Block Modal */}
      {editingBlock && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-elevated p-6 w-full max-w-sm flex flex-col gap-4 bg-zinc-900/95 border border-white/[0.12] rounded-2xl shadow-2xl">
            <div>
              <h3 className="text-[15px] font-semibold text-zinc-100">Edit Time Block</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">{editingBlock.block.name}</p>
            </div>

            <div className="flex flex-col gap-3.5 my-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingBlock.block.enabled !== false}
                  onChange={(e) =>
                    setEditingBlock((prev) => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        block: { ...prev.block, enabled: e.target.checked },
                      };
                    })
                  }
                  className="rounded border-zinc-700 bg-zinc-800 text-accent focus:ring-accent"
                />
                <span className="text-xs font-semibold text-zinc-300">Active Block</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">Start Time</span>
                  <input
                    type="time"
                    value={editingBlock.block.startTime}
                    onChange={(e) =>
                      setEditingBlock((prev) => {
                        if (!prev) return null;
                        return {
                          ...prev,
                          block: { ...prev.block, startTime: e.target.value },
                        };
                      })
                    }
                    className="glass-input px-2.5 py-1.5 text-xs focus:glass-input-focus bg-black/25 text-zinc-200"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">End Time</span>
                  <input
                    type="time"
                    value={editingBlock.block.endTime}
                    onChange={(e) =>
                      setEditingBlock((prev) => {
                        if (!prev) return null;
                        return {
                          ...prev,
                          block: { ...prev.block, endTime: e.target.value },
                        };
                      })
                    }
                    className="glass-input px-2.5 py-1.5 text-xs focus:glass-input-focus bg-black/25 text-zinc-200"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">Buffer Minutes</span>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={editingBlock.block.bufferMinutes}
                  onChange={(e) =>
                    setEditingBlock((prev) => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        block: { ...prev.block, bufferMinutes: parseInt(e.target.value) || 0 },
                      };
                    })
                  }
                  className="glass-input px-2.5 py-1.5 text-xs focus:glass-input-focus bg-black/25 text-zinc-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setEditingBlock(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="text-xs"
                onClick={saveBlockChanges}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
