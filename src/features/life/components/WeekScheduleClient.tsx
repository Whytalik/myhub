"use client";

import { useState, useTransition } from "react";
import { Dumbbell, Clock, Settings } from "lucide-react";
import { Select } from "@/components/ui/inputs/select";
import { Checkbox } from "@/components/ui/inputs/checkbox";
import { Input } from "@/components/ui/inputs/input";
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

const STANDARD_BLOCK_TEMPLATES = [
  {
    id: "health",
    name: "Health / Body",
    startTime: "07:00",
    endTime: "09:15",
    bufferMinutes: 15,
    sphereNames: ["Health", "Sport"],
  },
  {
    id: "work",
    name: "Business / Work",
    startTime: "09:30",
    endTime: "17:30",
    bufferMinutes: 30,
    sphereNames: ["Work", "Trading", "Finance"],
  },
  {
    id: "family",
    name: "Family / Romance",
    startTime: "18:00",
    endTime: "19:45",
    bufferMinutes: 15,
    sphereNames: ["Family & Friends", "Romance"],
  },
  {
    id: "growth",
    name: "Personal Growth",
    startTime: "18:00",
    endTime: "18:45",
    bufferMinutes: 15,
    sphereNames: ["Personal Growth"],
  },
  {
    id: "hobby",
    name: "Hobby",
    startTime: "19:00",
    endTime: "19:45",
    bufferMinutes: 15,
    sphereNames: ["Fun & Recreation", "Environment / Space"],
  },
  {
    id: "kaizen",
    name: "Kaizen (System)",
    startTime: "20:00",
    endTime: "20:45",
    bufferMinutes: 15,
    sphereNames: [],
  },
  {
    id: "recovery",
    name: "Recovery",
    startTime: "21:00",
    endTime: "22:45",
    bufferMinutes: 15,
    sphereNames: ["Health"],
  },
];

function todayDayOfWeek(): number {
  return (new Date().getDay() + 6) % 7;
}

const getBlockDisplayName = (blockId: string, originalName: string): string => {
  const id = blockId.toLowerCase();
  if (id.startsWith("health")) {
    return "Health / Body";
  }
  if (id.startsWith("work")) {
    return "Business / Work";
  }
  if (id.startsWith("family")) {
    return "Family / Romance";
  }
  if (id.startsWith("hobby")) {
    return "Hobby";
  }
  if (id.startsWith("growth")) {
    return "Personal Growth";
  }
  if (id.startsWith("kaizen")) {
    return "Kaizen (System)";
  }
  if (id.startsWith("recovery")) {
    return "Recovery";
  }
  return originalName;
};

const getBlockHeight = (startTime: string, endTime: string): string => {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  
  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;
  
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }
  
  const duration = endMinutes - startMinutes;
  // Scaled height: 64px baseline, +0.2px per minute above 45m, capped at 180px
  const calculatedHeight = Math.max(64, Math.min(180, 64 + (duration - 45) * 0.2));
  return `${calculatedHeight}px`;
};

interface Props {
  initialTemplates: DayScheduleData[];
  trainingDays: { id: string; name: string }[];
  spheres: string[];
}

export function WeekScheduleClient({ initialTemplates, trainingDays, spheres }: Props) {
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
    
    // Filter out existing evening blocks (id starts with family, growth, or hobby)
    const newBlocks = current.contextBlocks.filter(
      (block) =>
        !(
          block.id.startsWith("family") ||
          block.id.startsWith("growth") ||
          block.id.startsWith("hobby")
        )
    );

    // Insert the new blocks
    if (type === "family") {
      newBlocks.push({
        id: `family-${Date.now()}`,
        name: "Family / Romance",
        startTime: "18:00",
        endTime: "19:45",
        bufferMinutes: 15,
        sphereNames: ["Family & Friends", "Romance"],
        enabled: true,
      });
    } else {
      newBlocks.push({
        id: `growth-${Date.now()}`,
        name: "Personal Growth",
        startTime: "18:00",
        endTime: "18:45",
        bufferMinutes: 15,
        sphereNames: ["Personal Growth"],
        enabled: true,
      });
      newBlocks.push({
        id: `hobby-${Date.now()}`,
        name: "Hobby",
        startTime: "19:00",
        endTime: "19:45",
        bufferMinutes: 15,
        sphereNames: ["Fun & Recreation", "Environment / Space"],
        enabled: true,
      });
    }

    newBlocks.sort((a, b) => a.startTime.localeCompare(b.startTime));

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
    
    if (blockIndex === newBlocks.length) {
      newBlocks.push(block);
    } else {
      newBlocks[blockIndex] = block;
    }

    newBlocks.sort((a, b) => a.startTime.localeCompare(b.startTime));

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

  const deleteBlock = () => {
    if (!editingBlock) {
      return;
    }
    const { dayOfWeek, blockIndex } = editingBlock;

    const current = daysData[dayOfWeek];
    const newBlocks = current.contextBlocks.filter((_, idx) => idx !== blockIndex);

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

  const addTemplateToDay = (dayOfWeek: number, template: typeof STANDARD_BLOCK_TEMPLATES[0]) => {
    const current = daysData[dayOfWeek];
    const newBlock: ContextBlock = {
      ...template,
      id: `${template.id}-${Date.now()}`,
    };

    const newBlocks = [...current.contextBlocks, newBlock];
    newBlocks.sort((a, b) => a.startTime.localeCompare(b.startTime));

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

  const getBlockBorderColor = (blockId: string) => {
    if (blockId.startsWith("health")) {
      return "border-l-emerald-500/60";
    }
    if (blockId.startsWith("recovery")) {
      return "border-l-emerald-500/60";
    }
    if (blockId.startsWith("work")) {
      return "border-l-blue-500/60";
    }
    if (blockId.startsWith("family") || blockId.startsWith("romance")) {
      return "border-l-rose-500/60";
    }
    if (blockId.startsWith("growth")) {
      return "border-l-purple-500/60";
    }
    if (blockId.startsWith("hobby")) {
      return "border-l-purple-500/60";
    }
    if (blockId.startsWith("kaizen")) {
      return "border-l-amber-500/60";
    }
    return "border-l-zinc-500/60";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 🧩 Block Templates Library */}
      <div className="glass-card p-4 bg-black/10 flex flex-col gap-3">
        <div>
          <h2 className="text-panel-title">Block Templates Library</h2>
          <p className="text-caption mt-0.5">Quickly add standard contextual blocks to any day of your week.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {STANDARD_BLOCK_TEMPLATES.map((template) => {
            const blockBorder = getBlockBorderColor(template.id);
            return (
              <div
                key={template.id}
                className={`p-3 rounded-xl border border-white/[0.04] bg-white/[0.01] border-l-2 ${blockBorder} flex flex-col justify-between gap-2.5`}
              >
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">{template.name}</h4>
                  <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">
                    {template.startTime} – {template.endTime}
                  </span>
                </div>

                <Select
                  variant="inline"
                  value=""
                  onChange={(e) => {
                    if (e.target.value !== "") {
                      addTemplateToDay(parseInt(e.target.value), template);
                      e.target.value = "";
                    }
                  }}
                  className="text-[10px] font-bold text-accent uppercase tracking-wider pr-6 bg-transparent"
                >
                  <option value="" className="bg-zinc-900 text-zinc-400">
                    + Add to day...
                  </option>
                  {DAY_NAMES.map((dayName, idx) => (
                    <option key={idx} value={idx} className="bg-zinc-900 text-zinc-200">
                      {dayName}
                    </option>
                  ))}
                </Select>
              </div>
            );
          })}
        </div>
      </div>

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
                        style={{ height: getBlockHeight(block.startTime, block.endTime) }}
                        className={`flex flex-col justify-between p-2.5 rounded-lg bg-white/[0.01] border border-white/[0.04] border-l-2 ${blockBorder} ${
                          isBlockEnabled ? "" : "opacity-35"
                        } transition-all duration-150`}
                      >
                        <div className="flex items-center justify-between">
                          {block.id.startsWith("family") || block.id.startsWith("growth") ? (
                            <Select
                              variant="inline"
                              disabled={isPending}
                              value={block.id.startsWith("family") ? "family" : "hobby"}
                              onChange={(e) =>
                                changeEveningBlockType(dayOfWeek, e.target.value as "family" | "hobby")
                              }
                              className="text-xs font-semibold text-zinc-200 w-auto pr-6 font-sans"
                            >
                              <option value="family" className="bg-zinc-900 text-zinc-200 text-xs">
                                Family / Romance
                              </option>
                              <option value="hobby" className="bg-zinc-900 text-zinc-200 text-xs">
                                Growth & Hobby
                              </option>
                            </Select>
                          ) : (
                            <span className="text-xs font-semibold text-zinc-200">
                              {getBlockDisplayName(block.id, block.name)} {!isBlockEnabled && "(Inactive)"}
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

                        <div className="flex flex-col gap-1">
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
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      const newBlock: ContextBlock = {
                        id: "custom-" + Date.now(),
                        name: "Custom Block",
                        startTime: "12:00",
                        endTime: "13:00",
                        bufferMinutes: 0,
                        sphereNames: [],
                      };
                      setEditingBlock({
                        dayOfWeek,
                        blockIndex: contextBlocks.length,
                        block: newBlock,
                      });
                    }}
                    className="w-full py-1.5 border border-dashed border-white/[0.08] hover:border-white/[0.2] rounded-lg text-[10px] font-semibold text-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center gap-1 mt-1"
                  >
                    + Add Custom Block
                  </button>
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
              <h3 className="text-[15px] font-semibold text-zinc-100">
                {editingBlock.blockIndex === daysData[editingBlock.dayOfWeek].contextBlocks.length
                  ? "Add Time Block"
                  : "Edit Time Block"}
              </h3>
              {editingBlock.blockIndex !== daysData[editingBlock.dayOfWeek].contextBlocks.length && (
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {getBlockDisplayName(editingBlock.block.id, editingBlock.block.name)}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3.5 my-2">
              {/* If it's a new custom block, let them type the block name! */}
              {editingBlock.blockIndex === daysData[editingBlock.dayOfWeek].contextBlocks.length ? (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">Block Name</span>
                  <Input
                    type="text"
                    value={editingBlock.block.name}
                    onChange={(e) =>
                      setEditingBlock((prev) => {
                        if (!prev) return null;
                        return {
                          ...prev,
                          block: { ...prev.block, name: e.target.value },
                        };
                      })
                    }
                    placeholder="e.g. Study Time"
                    className="px-2.5 py-1.5 text-xs bg-black/25 text-zinc-200"
                  />
                </div>
              ) : (
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <Checkbox
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
                  />
                  <span className="text-xs font-semibold text-zinc-300">Active Block</span>
                </label>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">Start Time</span>
                  <Input
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
                    className="px-2.5 py-1.5 text-xs bg-black/25 text-zinc-200"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">End Time</span>
                  <Input
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
                    className="px-2.5 py-1.5 text-xs bg-black/25 text-zinc-200"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">Buffer Minutes</span>
                <Input
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
                  className="px-2.5 py-1.5 text-xs bg-black/25 text-zinc-200"
                />
              </div>

              <div className="flex flex-col gap-1.5 mt-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">
                  Mapped Life Spheres
                </span>
                <div className="flex flex-col gap-2 max-h-32 overflow-y-auto border border-white/[0.06] bg-black/10 rounded-xl p-2.5">
                  {spheres.length === 0 ? (
                    <span className="text-xs text-zinc-500 italic">No active spheres</span>
                  ) : (
                    spheres.map((sphereName) => {
                      const isChecked = editingBlock.block.sphereNames.includes(sphereName);
                      return (
                        <label key={sphereName} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={isChecked}
                            onChange={(e) => {
                              setEditingBlock((prev) => {
                                if (!prev) return null;
                                const currentSphereNames = prev.block.sphereNames;
                                const nextSphereNames = e.target.checked
                                  ? [...currentSphereNames, sphereName]
                                  : currentSphereNames.filter((name) => name !== sphereName);
                                return {
                                  ...prev,
                                  block: { ...prev.block, sphereNames: nextSphereNames },
                                };
                              });
                            }}
                          />
                          <span className="text-xs text-zinc-300">{sphereName}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 mt-2 border-t border-white/[0.04] pt-3">
              {editingBlock.blockIndex !== daysData[editingBlock.dayOfWeek].contextBlocks.length ? (
                <Button
                  variant="danger"
                  size="sm"
                  className="text-xs"
                  onClick={deleteBlock}
                >
                  Delete Block
                </Button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
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
        </div>
      )}
    </div>
  );
}
