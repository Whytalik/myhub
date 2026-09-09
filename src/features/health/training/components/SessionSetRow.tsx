"use client";

import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { Check, Flame } from "lucide-react";
import type { SetLogData, TrainingGoal } from "../types";
import type { EditableField } from "./SessionClient";
import {
  REP_RANGES,
  isRepsWithinRange,
  WARMUP_WEIGHT_PERCENT,
  WARMUP_REPS,
} from "../constants/rep-ranges";

interface SessionSetRowProps {
  setLog: SetLogData;
  isCompleted: boolean;
  isTimeBased: boolean;
  toggleCompleted: (id: string) => void;
  toggleWarmup: (id: string) => void;
  updateField: (id: string, field: EditableField, value: number | string | null) => void;
  persist: (id: string) => void;
  setToggleClass: string;
  warmupToggleClass: string;
  numberInputClass: string;
  notesInputClass: string;
  pastSet:
    | {
        reps: number | null;
        weight: number | null;
        rpe: number | null;
        rir: number | null;
        durationSeconds: number | null;
        distanceMeters: number | null;
      }
    | undefined;
  goal: TrainingGoal;
}

export function SessionSetRow({
  setLog,
  isCompleted,
  isTimeBased,
  toggleCompleted,
  toggleWarmup,
  updateField,
  persist,
  setToggleClass,
  warmupToggleClass,
  numberInputClass,
  notesInputClass,
  pastSet,
  goal,
}: SessionSetRowProps) {
  const repRange = REP_RANGES[goal];
  const pastRepsInRange = !isTimeBased && pastSet ? isRepsWithinRange(pastSet.reps, goal) : null;
  const repRangeHintClass = pastRepsInRange === false ? "text-amber-400" : "text-zinc-500";

  return (
    <div className="flex flex-col gap-1 w-full border-b border-white/[0.04] md:border-white/[0.02] pb-3 md:pb-1.5 last:border-b-0 last:pb-0">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center gap-2 w-full min-w-0">
        <button
          onClick={() => toggleCompleted(setLog.id)}
          disabled={isCompleted}
          className={setToggleClass}
        >
          <Check size={14} />
        </button>
        <span className="font-mono text-xs text-zinc-500 w-4 text-center shrink-0">
          {setLog.isWarmup ? "Р" : setLog.setNumber}
        </span>
        <button
          onClick={() => toggleWarmup(setLog.id)}
          disabled={isCompleted}
          title={`Розминочний підхід (~${Math.round(WARMUP_WEIGHT_PERCENT * 100)}% ваги, ${WARMUP_REPS} повт)`}
          className={warmupToggleClass}
        >
          <Flame size={12} />
        </button>

        {isTimeBased ? (
          <>
            <Input
              type="number"
              min={0}
              placeholder="—"
              className={numberInputClass}
              disabled={isCompleted}
              value={setLog.durationSeconds ?? ""}
              onChange={(event) =>
                updateField(
                  setLog.id,
                  "durationSeconds",
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
              onBlur={() => persist(setLog.id)}
            />
            <Input
              type="number"
              min={0}
              step="0.1"
              placeholder="—"
              className={numberInputClass}
              disabled={isCompleted}
              value={setLog.distanceMeters ?? ""}
              onChange={(event) =>
                updateField(
                  setLog.id,
                  "distanceMeters",
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
              onBlur={() => persist(setLog.id)}
            />
          </>
        ) : (
          <>
            <Input
              type="number"
              min={0}
              placeholder="—"
              className={numberInputClass}
              disabled={isCompleted}
              value={setLog.reps ?? ""}
              onChange={(event) =>
                updateField(
                  setLog.id,
                  "reps",
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
              onBlur={() => persist(setLog.id)}
            />
            <Input
              type="number"
              min={0}
              step="0.5"
              placeholder="—"
              className={numberInputClass}
              disabled={isCompleted}
              value={setLog.weight ?? ""}
              onChange={(event) =>
                updateField(
                  setLog.id,
                  "weight",
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
              onBlur={() => persist(setLog.id)}
            />
          </>
        )}

        <Input
          type="number"
          min={1}
          max={10}
          step="0.5"
          placeholder="—"
          className={numberInputClass}
          disabled={isCompleted}
          value={setLog.rpe ?? ""}
          onChange={(event) =>
            updateField(
              setLog.id,
              "rpe",
              event.target.value === "" ? null : Number(event.target.value),
            )
          }
          onBlur={() => persist(setLog.id)}
        />

        <Input
          type="number"
          min={0}
          max={10}
          step="0.5"
          placeholder="—"
          className={numberInputClass}
          disabled={isCompleted}
          value={setLog.rir ?? ""}
          onChange={(event) =>
            updateField(
              setLog.id,
              "rir",
              event.target.value === "" ? null : Number(event.target.value),
            )
          }
          onBlur={() => persist(setLog.id)}
        />

        <Input
          type="number"
          min={0}
          placeholder="—"
          className={numberInputClass}
          disabled={isCompleted}
          value={setLog.restSeconds ?? ""}
          onChange={(event) =>
            updateField(
              setLog.id,
              "restSeconds",
              event.target.value === "" ? null : Number(event.target.value),
            )
          }
          onBlur={() => persist(setLog.id)}
        />

        <Input
          placeholder="Нотатки..."
          className={notesInputClass}
          disabled={isCompleted}
          value={setLog.notes ?? ""}
          onChange={(event) => updateField(setLog.id, "notes", event.target.value)}
          onBlur={() => persist(setLog.id)}
        />
      </div>

      {pastSet && (
        <div className="hidden md:flex items-center gap-1.5 pl-13 text-[10px] text-zinc-500 font-mono select-none">
          <span>Минулого разу:</span>
          {isTimeBased ? (
            <span className="text-zinc-400">
              {pastSet.durationSeconds ? `${pastSet.durationSeconds}с` : "—"}
              {pastSet.distanceMeters ? ` / ${pastSet.distanceMeters}м` : ""}
            </span>
          ) : (
            <span className="text-zinc-400 font-bold">
              {pastSet.weight !== null ? `${pastSet.weight}кг` : "—"}
              {" х "}
              {pastSet.reps !== null ? `${pastSet.reps}` : "—"}
            </span>
          )}
          {pastSet.rpe && <span className="text-zinc-500">@ RPE {pastSet.rpe}</span>}
          {pastSet.rir != null && <span className="text-zinc-500">@ RIR {pastSet.rir}</span>}
          {!isTimeBased && !setLog.isWarmup && (
            <span className={repRangeHintClass}>
              ({pastRepsInRange ? "✓" : "ціль"} {repRange.min}-{repRange.max})
            </span>
          )}
        </div>
      )}

      {/* Mobile Layout */}
      <div className="flex md:hidden flex-col gap-2.5 w-full">
        {/* Header: Set Number, Completed Checkbox, Past Set Info */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleCompleted(setLog.id)}
              disabled={isCompleted}
              className={setToggleClass}
            >
              <Check size={16} />
            </button>
            <span className="font-mono text-sm font-semibold text-zinc-300">
              {setLog.isWarmup ? "Розминка" : `Сет ${setLog.setNumber}`}
            </span>
            <button
              onClick={() => toggleWarmup(setLog.id)}
              disabled={isCompleted}
              title={`Розминочний підхід (~${Math.round(WARMUP_WEIGHT_PERCENT * 100)}% ваги, ${WARMUP_REPS} повт)`}
              className={warmupToggleClass}
            >
              <Flame size={12} />
            </button>
          </div>

          {pastSet && (
            <div className="text-[11px] text-zinc-500 font-mono select-none flex items-center gap-1 bg-white/[0.02] px-2 py-0.5 rounded border border-white/[0.04]">
              <span className="text-zinc-500">Минулого разу:</span>
              {isTimeBased ? (
                <span className="text-zinc-400 font-medium">
                  {pastSet.durationSeconds ? `${pastSet.durationSeconds}с` : "—"}
                  {pastSet.distanceMeters ? ` / ${pastSet.distanceMeters}м` : ""}
                </span>
              ) : (
                <span className="text-zinc-400 font-bold">
                  {pastSet.weight !== null ? `${pastSet.weight}кг` : "—"}
                  {" х "}
                  {pastSet.reps !== null ? `${pastSet.reps}` : "—"}
                </span>
              )}
              {pastSet.rpe && <span className="text-zinc-500">@ {pastSet.rpe}</span>}
              {pastSet.rir != null && <span className="text-zinc-500">/ RIR {pastSet.rir}</span>}
              {!isTimeBased && !setLog.isWarmup && (
                <span className={repRangeHintClass}>
                  ({pastRepsInRange ? "✓" : "ціль"} {repRange.min}-{repRange.max})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Input 1: Reps / Time */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 text-center">
              {isTimeBased ? "Час (с)" : "Повт"}
            </label>
            <Input
              type="number"
              min={0}
              placeholder="—"
              className="w-full text-center text-sm px-1 h-9 rounded-lg"
              disabled={isCompleted}
              value={isTimeBased ? (setLog.durationSeconds ?? "") : (setLog.reps ?? "")}
              onChange={(event) =>
                updateField(
                  setLog.id,
                  isTimeBased ? "durationSeconds" : "reps",
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
              onBlur={() => persist(setLog.id)}
            />
          </div>

          {/* Input 2: Weight / Distance */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 text-center">
              {isTimeBased ? "Дист (м)" : "Вага"}
            </label>
            <Input
              type="number"
              min={0}
              step={isTimeBased ? "0.1" : "0.5"}
              placeholder="—"
              className="w-full text-center text-sm px-1 h-9 rounded-lg"
              disabled={isCompleted}
              value={isTimeBased ? (setLog.distanceMeters ?? "") : (setLog.weight ?? "")}
              onChange={(event) =>
                updateField(
                  setLog.id,
                  isTimeBased ? "distanceMeters" : "weight",
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
              onBlur={() => persist(setLog.id)}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Input 3: RPE */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 text-center">
              RPE
            </label>
            <Input
              type="number"
              min={1}
              max={10}
              step="0.5"
              placeholder="—"
              className="w-full text-center text-sm px-1 h-9 rounded-lg"
              disabled={isCompleted}
              value={setLog.rpe ?? ""}
              onChange={(event) =>
                updateField(
                  setLog.id,
                  "rpe",
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
              onBlur={() => persist(setLog.id)}
            />
          </div>

          {/* Input 4: RIR */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 text-center">
              RIR
            </label>
            <Input
              type="number"
              min={0}
              max={10}
              step="0.5"
              placeholder="—"
              className="w-full text-center text-sm px-1 h-9 rounded-lg"
              disabled={isCompleted}
              value={setLog.rir ?? ""}
              onChange={(event) =>
                updateField(
                  setLog.id,
                  "rir",
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
              onBlur={() => persist(setLog.id)}
            />
          </div>

          {/* Input 5: Rest */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 text-center">
              Відпоч
            </label>
            <Input
              type="number"
              min={0}
              placeholder="—"
              className="w-full text-center text-sm px-1 h-9 rounded-lg"
              disabled={isCompleted}
              value={setLog.restSeconds ?? ""}
              onChange={(event) =>
                updateField(
                  setLog.id,
                  "restSeconds",
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
              onBlur={() => persist(setLog.id)}
            />
          </div>
        </div>

        {/* Full-width Notes Textarea */}
        <div className="flex flex-col gap-1 w-full">
          <Textarea
            placeholder="Нотатки до підходу..."
            className="w-full text-xs min-h-[44px] py-2 px-2.5 rounded-lg border border-white/[0.04] bg-black/15 focus:bg-black/25 placeholder:text-zinc-600 focus:glass-input-focus transition-all duration-150 resize-none"
            disabled={isCompleted}
            value={setLog.notes ?? ""}
            onChange={(event) => updateField(setLog.id, "notes", event.target.value)}
            onBlur={() => persist(setLog.id)}
          />
        </div>
      </div>
    </div>
  );
}
