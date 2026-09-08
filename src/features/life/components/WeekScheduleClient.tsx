"use client";

import { useState } from "react";
import { Dumbbell, ChevronLeft, ChevronRight, Settings, Zap } from "lucide-react";
import { Select } from "@/components/ui/inputs/select";
import { Checkbox } from "@/components/ui/inputs/checkbox";
import { Input } from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/actions/button";
import { Dialog } from "@/components/ui/overlays/dialog";
import { AddBlockMenu } from "./week/AddBlockMenu";
import { usePersistDaySchedule } from "../logic/use-persist-day-schedule";
import {
  DAY_NAMES,
  getBlockBorderClass,
  getBlockDisplayName,
} from "../logic/week-template-blocks";
import type { DayScheduleData, ContextBlock } from "../types";

const NONE_VALUE = "__none__";

function todayDayOfWeek(): number {
  return (new Date().getDay() + 6) % 7;
}

interface Props {
  initialTemplates: DayScheduleData[];
  trainingDays: { id: string; name: string }[];
  spheres: string[];
}

export function WeekScheduleClient({ initialTemplates, trainingDays, spheres }: Props) {
  const today = todayDayOfWeek();
  const { daysData, pendingDay, persistDay } = usePersistDaySchedule(initialTemplates);

  const [selectedDay, setSelectedDay] = useState(today);
  const [editingBlock, setEditingBlock] = useState<{
    blockIndex: number;
    block: ContextBlock;
    isNew: boolean;
  } | null>(null);

  const selected = daysData[selectedDay];
  const selectedBlocks = selected.contextBlocks;
  const isPending = pendingDay === selectedDay;
  const isSelectedToday = selectedDay === today;

  const setTrainingDay = (trainingDayId: string | null) => {
    persistDay(selectedDay, (current) => ({ ...current, trainingDayId }));
  };

  const addPresetBlock = (block: ContextBlock) => {
    persistDay(selectedDay, (current) => {
      const newBlocks = [...current.contextBlocks, block];
      newBlocks.sort((a, b) => a.startTime.localeCompare(b.startTime));
      return { ...current, contextBlocks: newBlocks };
    });
  };

  const openEditBlock = (blockIndex: number) => {
    const block = selectedBlocks[blockIndex];
    setEditingBlock({ blockIndex, block: { ...block }, isNew: false });
  };

  const openAddCustomBlock = () => {
    const blockIndex = selectedBlocks.length;
    setEditingBlock({
      blockIndex,
      isNew: true,
      block: {
        id: "custom-" + Date.now(),
        name: "Custom Block",
        startTime: "12:00",
        endTime: "13:00",
        bufferMinutes: 0,
        sphereNames: [],
      },
    });
  };

  const saveBlockChanges = () => {
    if (!editingBlock) return;
    const { blockIndex, block } = editingBlock;
    persistDay(selectedDay, (current) => {
      const newBlocks = [...current.contextBlocks];
      if (blockIndex === newBlocks.length) {
        newBlocks.push(block);
      } else {
        newBlocks[blockIndex] = block;
      }
      newBlocks.sort((a, b) => a.startTime.localeCompare(b.startTime));
      return { ...current, contextBlocks: newBlocks };
    });
    setEditingBlock(null);
  };

  const deleteBlock = () => {
    if (!editingBlock) return;
    const { blockIndex } = editingBlock;
    persistDay(selectedDay, (current) => ({
      ...current,
      contextBlocks: current.contextBlocks.filter((_, idx) => idx !== blockIndex),
    }));
    setEditingBlock(null);
  };

  const stepDay = (delta: number) => {
    setSelectedDay((prev) => Math.min(6, Math.max(0, prev + delta)));
  };

  const overviewCells = DAY_NAMES.map((name, dayOfWeek) => {
    const isToday = dayOfWeek === today;
    const isSelected = selectedDay === dayOfWeek;
    const cellData = daysData[dayOfWeek];
    const activeCount = cellData.contextBlocks.filter((block) => block.enabled !== false).length;
    const hasTraining = !!cellData.trainingDayId;

    const cellClass = `p-2 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all duration-150 ${
      isSelected
        ? "border-accent/40 bg-accent/[0.05]"
        : isToday
          ? "border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.05]"
          : "border-white/[0.06] bg-black/10 hover:bg-white/[0.03]"
    }`;
    const nameClass = `text-[10px] font-mono uppercase tracking-wider ${
      isToday ? "text-accent" : "text-zinc-400"
    } ${isSelected ? "text-accent font-semibold" : ""}`;
    const countClass = `text-[9px] font-mono ${activeCount > 0 ? "text-zinc-400" : "text-zinc-600"}`;

    return (
      <button key={dayOfWeek} type="button" onClick={() => setSelectedDay(dayOfWeek)} className={cellClass}>
        <span className={nameClass}>{name}</span>
        <span className="flex items-center gap-1">
          <span className={countClass}>{activeCount}</span>
          {hasTraining && <Zap size={9} className="text-accent-training" />}
        </span>
      </button>
    );
  });

  const blockRows = selectedBlocks.map((block, index) => {
    const isEnabled = block.enabled !== false;
    const name = getBlockDisplayName(block.id, block.name);
    const borderClass = getBlockBorderClass(block.id);
    const timeLabel = `${block.startTime}–${block.endTime}${
      block.bufferMinutes > 0 ? ` (+${block.bufferMinutes}m)` : ""
    }`;
    const maxChips = 2;
    const extraChips = isEnabled ? block.sphereNames.length - maxChips : 0;

    const rowClass = `p-2.5 rounded-lg border border-l-2 transition-all duration-150 ${
      isEnabled
        ? "bg-white/[0.01] border-white/[0.04]"
        : "bg-white/[0.005] border-white/[0.03] opacity-40"
    } ${borderClass}`;

    return (
      <div key={block.id + "-" + index} className={rowClass}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-zinc-200 truncate">
            {name}
            {!isEnabled && <span className="text-zinc-500 font-normal"> · inactive</span>}
          </span>
          <button
            type="button"
            disabled={isPending}
            onClick={() => openEditBlock(index)}
            className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-zinc-200 transition-colors disabled:opacity-20"
            title="Edit block"
          >
            <Settings size={12} />
          </button>
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-zinc-500">{timeLabel}</span>
          {isEnabled && block.sphereNames.length > 0 && (
            <span className="flex flex-wrap items-center justify-end gap-1">
              {block.sphereNames.slice(0, maxChips).map((sphereName) => (
                <span
                  key={sphereName}
                  className="px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 text-[9px] border border-white/[0.04]"
                >
                  {sphereName}
                </span>
              ))}
              {extraChips > 0 && <span className="text-[9px] text-zinc-600 font-mono">+{extraChips}</span>}
            </span>
          )}
        </div>
      </div>
    );
  });

  const dialogFooter = editingBlock ? (
    <div className="flex w-full items-center justify-between gap-2">
      {!editingBlock.isNew && (
        <Button variant="danger" size="sm" onClick={deleteBlock}>
          Delete Block
        </Button>
      )}
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setEditingBlock(null)}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={saveBlockChanges}>
          Save
        </Button>
      </div>
    </div>
  ) : null;

  const dialogBody = editingBlock ? (
    <div className="flex flex-col gap-3.5">
      {editingBlock.isNew ? (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">
            Block Name
          </span>
          <Input
            type="text"
            value={editingBlock.block.name}
            onChange={(e) =>
              setEditingBlock((prev) =>
                prev ? { ...prev, block: { ...prev.block, name: e.target.value } } : prev,
              )
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
              setEditingBlock((prev) =>
                prev ? { ...prev, block: { ...prev.block, enabled: e.target.checked } } : prev,
              )
            }
          />
          <span className="text-xs font-semibold text-zinc-300">Active Block</span>
        </label>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">
            Start Time
          </span>
          <Input
            type="time"
            value={editingBlock.block.startTime}
            onChange={(e) =>
              setEditingBlock((prev) =>
                prev ? { ...prev, block: { ...prev.block, startTime: e.target.value } } : prev,
              )
            }
            className="px-2.5 py-1.5 text-xs bg-black/25 text-zinc-200"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">
            End Time
          </span>
          <Input
            type="time"
            value={editingBlock.block.endTime}
            onChange={(e) =>
              setEditingBlock((prev) =>
                prev ? { ...prev, block: { ...prev.block, endTime: e.target.value } } : prev,
              )
            }
            className="px-2.5 py-1.5 text-xs bg-black/25 text-zinc-200"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">
          Buffer Minutes
        </span>
        <Input
          type="number"
          min="0"
          max="120"
          value={editingBlock.block.bufferMinutes}
          onChange={(e) =>
            setEditingBlock((prev) =>
              prev
                ? { ...prev, block: { ...prev.block, bufferMinutes: parseInt(e.target.value) || 0 } }
                : prev,
            )
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
                        if (!prev) return prev;
                        const nextSphereNames = e.target.checked
                          ? [...prev.block.sphereNames, sphereName]
                          : prev.block.sphereNames.filter((name) => name !== sphereName);
                        return { ...prev, block: { ...prev.block, sphereNames: nextSphereNames } };
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
  ) : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Week overview */}
      <div className="glass-card p-3">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">{overviewCells}</div>
      </div>

      {/* Day editor */}
      <div className="glass-card p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            disabled={selectedDay === 0}
            onClick={() => stepDay(-1)}
          >
            <ChevronLeft size={16} />
          </Button>
          <div className="text-center">
            <h2 className="text-panel-title">
              {DAY_NAMES[selectedDay]}
              {isSelectedToday && <span className="text-accent"> · Today</span>}
            </h2>
            {trainingDays.length === 0 && (
              <p className="text-caption mt-0.5">
                No training days found — add them in Training space.
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            disabled={selectedDay === 6}
            onClick={() => stepDay(1)}
          >
            <ChevronRight size={16} />
          </Button>
        </div>

        <div className={`flex flex-col gap-4 ${isPending ? "opacity-60" : ""} transition-all duration-150`}>
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5">
              <Dumbbell size={12} className="text-accent-training" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Training Day
              </span>
            </span>
            <Select
              disabled={isPending || trainingDays.length === 0}
              value={selected.trainingDayId ?? NONE_VALUE}
              onChange={(e) =>
                setTrainingDay(e.target.value === NONE_VALUE ? null : e.target.value)
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

          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-1.5">
              <Settings size={12} className="text-zinc-500" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Time Blocks
              </span>
            </span>

            <div className="flex flex-col gap-2">
              {blockRows}
              <AddBlockMenu
                disabled={isPending}
                onAddPreset={addPresetBlock}
                onAddCustom={openAddCustomBlock}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Context Block modal */}
      <Dialog
        isOpen={editingBlock !== null}
        onClose={() => setEditingBlock(null)}
        title={editingBlock?.isNew ? "Add Time Block" : "Edit Time Block"}
        description={
          editingBlock && !editingBlock.isNew
            ? getBlockDisplayName(editingBlock.block.id, editingBlock.block.name)
            : undefined
        }
        footer={dialogFooter}
      >
        {dialogBody}
      </Dialog>
    </div>
  );
}