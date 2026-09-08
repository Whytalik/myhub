import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Pencil,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import type { LifeSphereData } from "@/features/life/types";
import type { ThoughtTypeConfig } from "@/features/life/logic/thought-types";
import type { ThoughtItem } from "../types";

type FilterStage = "q1" | "q1b" | "q_conflict" | "q2" | "q3";

export function StepPrimeFilter({
  inboxThoughts,
  decomposableThoughts,
  initialFilterCount,
  currentFilterThought,
  filterThoughtSphere,
  filterThoughtTypeConfig,
  FilterThoughtIcon,
  handleEditClick,
  filterStage,
  getQuestionStep,
  setWantType,
  wantType,
  setFilterStageHistory,
  filterStageHistory,
  setFilterStage,
  handleFilterThought,
  filterIndex,
  setFilterIndex,
  setStep,
  missionContent,
  activeThoughts,
}: {
  inboxThoughts: ThoughtItem[];
  decomposableThoughts: ThoughtItem[];
  initialFilterCount: number | null;
  currentFilterThought: ThoughtItem;
  filterThoughtSphere: LifeSphereData | null | undefined;
  filterThoughtTypeConfig: ThoughtTypeConfig | null | undefined;
  FilterThoughtIcon: LucideIcon | null;
  handleEditClick: (thoughtItem: ThoughtItem) => void;
  filterStage: FilterStage;
  getQuestionStep: () => number;
  setWantType: (value: "want" | "must" | null) => void;
  wantType: "want" | "must" | null;
  setFilterStageHistory: (
    value: FilterStage[] | ((previous: FilterStage[]) => FilterStage[]),
  ) => void;
  filterStageHistory: FilterStage[];
  setFilterStage: (value: FilterStage) => void;
  handleFilterThought: (
    thoughtId: string,
    outcome: "KEEP_WANT" | "KEEP_MUST" | "NOT_MINE" | "SOMEDAY",
  ) => void;
  filterIndex: number;
  setFilterIndex: (value: number | ((previous: number) => number)) => void;
  setStep: (step: number) => void;
  missionContent?: string | null;
  activeThoughts: ThoughtItem[];
}) {
  return (
    <div className="glass-card p-6 md:p-8 bg-black/15 border border-white/[0.04] rounded-2xl flex flex-col gap-6 items-center max-w-2xl mx-auto w-full">
      {missionContent && (
        <div className="w-full flex items-center gap-2 min-w-0 text-caption text-zinc-400 border-b border-white/[0.04] pb-3">
          <Compass size={13} className="shrink-0 text-accent" />
          <span className="truncate">{missionContent}</span>
        </div>
      )}
      <div className="w-full flex items-center justify-between border-b border-white/[0.04] pb-3 mb-2">
        <h3 className="text-panel-title font-semibold text-zinc-200">Step 2: Prime Filter</h3>
        <span className="text-xs font-mono text-zinc-500">
          Card{" "}
          {initialFilterCount && inboxThoughts.length > 0
            ? initialFilterCount - inboxThoughts.length + 1
            : 0}{" "}
          of {initialFilterCount || 0}
        </span>
      </div>

      {inboxThoughts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <CheckCircle2 size={36} className="text-emerald-400" />
          <div className="flex flex-col gap-1 max-w-sm">
            <h4 className="text-sm font-semibold text-zinc-200 font-mono">Inbox is empty!</h4>
            <p className="text-xs text-zinc-400">
              All your thoughts have passed the Prime Filter. They are ready to be decomposed.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setStep(3)} className="mt-2">
            Next to Decomposition ({decomposableThoughts.length} waiting) <ChevronRight size={14} />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6 w-full max-w-lg items-center">
          <div className="glass-card p-6 w-full border-white/10 bg-white/[0.02] shadow-xl min-h-[140px] flex flex-col items-start justify-start relative group">
            {/* Top Sphere & Type indicators */}
            {(filterThoughtSphere || filterThoughtTypeConfig) && (
              <div className="flex flex-wrap gap-2 mb-3">
                {filterThoughtSphere && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono uppercase tracking-wider text-zinc-300">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: filterThoughtSphere.color }}
                    />
                    {filterThoughtSphere.name}
                  </span>
                )}
                {filterThoughtTypeConfig && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono uppercase tracking-wider text-zinc-300">
                    {FilterThoughtIcon && <FilterThoughtIcon size={10} className="text-accent" />}
                    {filterThoughtTypeConfig.label}
                  </span>
                )}
              </div>
            )}

            <p className="text-base font-medium text-zinc-150 leading-relaxed font-sans whitespace-pre-wrap text-left w-full">
              {currentFilterThought.content}
            </p>

            {/* Template Fields Data */}
            {filterThoughtTypeConfig && currentFilterThought.templateData && (
              <div className="w-full flex flex-col gap-2.5 mt-4 pt-4 border-t border-white/[0.04] text-left">
                {filterThoughtTypeConfig.fields.map((field) => {
                  const fieldValue = currentFilterThought.templateData?.[field.key];
                  if (!fieldValue) return null;
                  return (
                    <div key={field.key} className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                        {field.label}
                      </span>
                      <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        {fieldValue}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {currentFilterThought && (
              <button
                type="button"
                onClick={() => handleEditClick(currentFilterThought)}
                className="absolute top-3 right-3 p-1.5 rounded text-zinc-500 hover:text-zinc-350 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                title="Edit thought"
              >
                <Pencil size={14} />
              </button>
            )}
          </div>

          <div className="w-full h-1 bg-black/35 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{
                width: `${
                  initialFilterCount && initialFilterCount > 0
                    ? ((initialFilterCount - inboxThoughts.length) / initialFilterCount) * 100
                    : 0
                }%`,
              }}
            />
          </div>

          {/* Question flow based on filterStage */}
          <div className="flex flex-col gap-4 w-full mt-2 items-center">
            {/* 4-step questionnaire progress bar */}
            <div className="flex gap-1.5 w-full max-w-[160px] mb-1">
              {[1, 2, 3, 4].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    stepNum <= getQuestionStep() ? "bg-accent" : "bg-white/[0.08]"
                  }`}
                />
              ))}
            </div>
            {filterStage === "q1" && (
              <div className="flex flex-col gap-3 w-full items-center">
                <p className="text-sm font-mono text-zinc-300 text-center uppercase tracking-wider font-semibold">
                  ❓ Whose desire is this?
                </p>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setWantType("want");
                      setFilterStageHistory((previousHistory) => [...previousHistory, "q1"]);
                      setFilterStage("q_conflict");
                    }}
                    className="border-emerald-500/20 text-emerald-400 bg-emerald-500/[0.02] hover:bg-emerald-500/10 h-11 text-xs"
                  >
                    💚 Want (Mine)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFilterStageHistory((previousHistory) => [...previousHistory, "q1"]);
                      setFilterStage("q1b");
                    }}
                    className="border-amber-500/20 text-amber-400 bg-amber-500/[0.02] hover:bg-amber-500/10 h-11 text-xs"
                  >
                    👥 Imposed
                  </Button>
                </div>
              </div>
            )}

            {filterStage === "q1b" && (
              <div className="flex flex-col gap-3 w-full items-center">
                <p className="text-sm font-mono text-zinc-300 text-center uppercase tracking-wider font-semibold">
                  ❓ What happens if I just ignore it and don&apos;t do it?
                </p>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleFilterThought(inboxThoughts[filterIndex].id, "NOT_MINE")}
                    className="border-zinc-500/20 text-zinc-400 bg-white/[0.01] hover:bg-white/[0.03] h-11 text-xs"
                  >
                    🗑️ Nothing bad
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setWantType("must");
                      setFilterStageHistory((previousHistory) => [...previousHistory, "q1b"]);
                      setFilterStage("q_conflict");
                    }}
                    className="border-red-500/20 text-rose-450 bg-rose-500/[0.02] hover:bg-rose-500/10 h-11 text-xs"
                  >
                    ⚠️ Real consequence
                  </Button>
                </div>
              </div>
            )}

            {filterStage === "q_conflict" && (
              <div className="flex flex-col gap-3 w-full items-center">
                <p className="text-sm font-mono text-zinc-300 text-center uppercase tracking-wider font-semibold">
                  ❓ Does this conflict with my mission or values?
                </p>
                {activeThoughts.length > 0 && (
                  <div className="flex flex-col gap-1.5 w-full text-left">
                    <span className="text-label text-zinc-500">
                      Вже прийнято ({activeThoughts.length})
                    </span>
                    <div className="flex flex-col gap-1 max-h-40 overflow-y-auto rounded-lg bg-white/[0.02] border border-white/[0.06] p-2">
                      {activeThoughts.map((thought) => (
                        <p key={thought.id} className="text-caption truncate">
                          {thought.content}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleFilterThought(inboxThoughts[filterIndex].id, "NOT_MINE")}
                    className="border-red-500/20 text-rose-450 bg-rose-500/[0.02] hover:bg-rose-500/10 h-11 text-xs"
                  >
                    ❌ Yes, conflict
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFilterStageHistory((previousHistory) => [
                        ...previousHistory,
                        "q_conflict",
                      ]);
                      setFilterStage("q2");
                    }}
                    className="border-emerald-500/20 text-emerald-455 bg-emerald-500/[0.02] hover:bg-emerald-500/10 h-11 text-xs"
                  >
                    ✅ No, fully aligned
                  </Button>
                </div>
              </div>
            )}

            {filterStage === "q2" && (
              <div className="flex flex-col gap-3 w-full items-center">
                <p className="text-sm font-mono text-zinc-300 text-center uppercase tracking-wider font-semibold">
                  ❓ Does this bring direct benefit to me or my close ones?
                </p>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFilterStageHistory((previousHistory) => [...previousHistory, "q2"]);
                      setFilterStage("q3");
                    }}
                    className="border-emerald-500/20 text-emerald-400 bg-emerald-500/[0.02] hover:bg-emerald-500/10 h-11 text-xs"
                  >
                    👍 Yes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleFilterThought(inboxThoughts[filterIndex].id, "NOT_MINE")}
                    className="border-zinc-500/20 text-zinc-400 bg-white/[0.01] hover:bg-white/[0.03] h-11 text-xs"
                  >
                    👎 No
                  </Button>
                </div>
              </div>
            )}

            {filterStage === "q3" && (
              <div className="flex flex-col gap-3 w-full items-center">
                <p className="text-sm font-mono text-zinc-300 text-center uppercase tracking-wider font-semibold">
                  ❓ Do I have the resources for this in the near future?
                </p>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      handleFilterThought(
                        inboxThoughts[filterIndex].id,
                        wantType === "must" ? "KEEP_MUST" : "KEEP_WANT",
                      )
                    }
                    className="border-emerald-500/20 text-emerald-400 bg-emerald-500/[0.02] hover:bg-emerald-500/10 h-11 text-xs"
                  >
                    ⚡ Yes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleFilterThought(inboxThoughts[filterIndex].id, "SOMEDAY")}
                    className="border-purple-500/20 text-purple-400 bg-purple-500/[0.02] hover:bg-purple-500/10 h-11 text-xs"
                  >
                    ⏳ Not now (Someday)
                  </Button>
                </div>
              </div>
            )}

            {/* Back button within questionnaire */}
            {filterStageHistory.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const previousStage = filterStageHistory[filterStageHistory.length - 1];
                  setFilterStageHistory((previousHistory) => previousHistory.slice(0, -1));
                  setFilterStage(previousStage);
                }}
                className="text-[10px] font-mono text-zinc-500 hover:text-zinc-350 transition-colors duration-150 uppercase tracking-wider mt-1"
              >
                ↩️ Back to previous question
              </button>
            )}
          </div>

          <div className="flex gap-4 justify-between w-full text-xs text-zinc-500 border-t border-white/[0.04] pt-4 mt-2">
            <button
              type="button"
              disabled={filterIndex === 0}
              onClick={() => setFilterIndex((i) => i - 1)}
              className="hover:text-zinc-300 disabled:opacity-30 disabled:hover:text-zinc-500 flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Previous thought
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="text-zinc-400 hover:text-zinc-200 font-semibold"
            >
              Skip filtering and proceed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
