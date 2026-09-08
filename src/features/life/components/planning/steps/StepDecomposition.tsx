import type { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ArrowRight,
  CheckSquare,
  FolderKanban,
  ChevronLeft,
  Trash2,
  AlertTriangle,
  Pencil,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { ThoughtFields } from "@/features/life/components/thoughts/ThoughtFields";
import type { LifeSphereData } from "@/features/life/types";
import type { ThoughtType, ThoughtTypeConfig } from "@/features/life/logic/thought-types";
import type { ThoughtItem } from "../types";

type Router = ReturnType<typeof useRouter>;

export function StepDecomposition({
  decomposableThoughts,
  currentDecomposeThought,
  decomposeIndex,
  setDecomposeIndex,
  decomposeThoughtSphere,
  decomposeThoughtTypeConfig,
  DecomposeThoughtIcon,
  handleEditClick,
  setDeleteThoughtId,
  isActionPending,
  startActionTransition,
  router,
  setStep,
  decomposeType,
  setDecomposeType,
  spheres,
  selectedSphereId,
  setSelectedSphereId,
  setThoughts,
  saveTimeoutRef,
  saveThought,
  taskTitle,
  setTaskTitle,
  taskDesc,
  setTaskDesc,
  projectTitle,
  setProjectTitle,
  projectDesc,
  setProjectDesc,
  resistance,
  setResistance,
  handleDecompose,
}: {
  decomposableThoughts: ThoughtItem[];
  currentDecomposeThought: ThoughtItem;
  decomposeIndex: number;
  setDecomposeIndex: (value: number | ((previous: number) => number)) => void;
  decomposeThoughtSphere: LifeSphereData | null | undefined;
  decomposeThoughtTypeConfig: ThoughtTypeConfig | null | undefined;
  DecomposeThoughtIcon: LucideIcon | null;
  handleEditClick: (thoughtItem: ThoughtItem) => void;
  setDeleteThoughtId: (id: string | null) => void;
  isActionPending: boolean;
  startActionTransition: (callback: () => Promise<void> | void) => void;
  router: Router;
  setStep: (step: number) => void;
  decomposeType: "task" | "project";
  setDecomposeType: (value: "task" | "project") => void;
  spheres: LifeSphereData[];
  selectedSphereId: string;
  setSelectedSphereId: (value: string) => void;
  setThoughts: (updater: (previousThoughts: ThoughtItem[]) => ThoughtItem[]) => void;
  saveTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  saveThought: (
    thoughtId: string,
    finalSphereId: string | null,
    finalType: ThoughtType | null,
    finalTemplateData: Record<string, string> | null,
  ) => void;
  taskTitle: string;
  setTaskTitle: (value: string) => void;
  taskDesc: string;
  setTaskDesc: (value: string) => void;
  projectTitle: string;
  setProjectTitle: (value: string) => void;
  projectDesc: string;
  setProjectDesc: (value: string) => void;
  resistance: number;
  setResistance: (value: number) => void;
  handleDecompose: (thoughtId: string) => void;
}) {
  return (
    <div className="glass-card p-6 md:p-8 bg-black/15 border border-white/[0.04] rounded-2xl flex flex-col gap-6">
      <div className="w-full flex items-center justify-between border-b border-white/[0.04] pb-3 mb-2">
        <div>
          <h3 className="text-panel-title font-semibold text-zinc-200">
            Step 3: Kaizen Decomposition
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            We split raw thoughts into large Projects and tiny physical steps (Atoms).
          </p>
        </div>
        <span className="text-xs font-mono text-zinc-500 shrink-0">
          Remaining: {decomposableThoughts.length} thoughts
        </span>
      </div>

      {decomposableThoughts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <CheckCircle2 size={36} className="text-emerald-400" />
          <div className="flex flex-col gap-1 max-w-sm">
            <h4 className="text-sm font-semibold text-zinc-200 font-mono">All decomposed!</h4>
            <p className="text-xs text-zinc-400">
              You have successfully decomposed all filtered desires and obligations into actionable
              items.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              startActionTransition(async () => {
                router.refresh();
                setStep(4);
              });
            }}
            disabled={isActionPending}
            className="mt-2"
          >
            Next to Sprint Planning <ArrowRight size={14} />
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr] gap-8 items-start">
          <div className="flex flex-col gap-4">
            <div className="glass-card p-4 border-amber-500/10 bg-amber-500/[0.01] rounded-xl flex flex-col gap-3 relative group">
              <div className="flex justify-between items-center text-[9px] font-mono text-amber-400 font-semibold uppercase">
                <span>Raw thought ({currentDecomposeThought?.status.name})</span>
                <span>
                  Thought {decomposeIndex + 1} of {decomposableThoughts.length}
                </span>
              </div>

              {/* Top Sphere & Type indicators */}
              {(decomposeThoughtSphere || decomposeThoughtTypeConfig) && (
                <div className="flex flex-wrap gap-2">
                  {decomposeThoughtSphere && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: decomposeThoughtSphere.color }}
                      />
                      {decomposeThoughtSphere.name}
                    </span>
                  )}
                  {decomposeThoughtTypeConfig && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                      {DecomposeThoughtIcon && (
                        <DecomposeThoughtIcon size={9} className="text-amber-500" />
                      )}
                      {decomposeThoughtTypeConfig.label}
                    </span>
                  )}
                </div>
              )}

              <p className="text-sm font-medium text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap">
                {currentDecomposeThought?.content}
              </p>

              {/* Template Fields Data */}
              {decomposeThoughtTypeConfig && currentDecomposeThought?.templateData && (
                <div className="w-full flex flex-col gap-2 pt-2 border-t border-white/[0.04] text-left">
                  {decomposeThoughtTypeConfig.fields.map((field) => {
                    const fieldValue = currentDecomposeThought.templateData?.[field.key];
                    if (!fieldValue) return null;
                    return (
                      <div key={field.key} className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                          {field.label}
                        </span>
                        <p className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">
                          {fieldValue}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {currentDecomposeThought && (
                <button
                  type="button"
                  onClick={() => handleEditClick(currentDecomposeThought)}
                  className="absolute top-3 right-3 p-1.5 rounded text-zinc-500 hover:text-zinc-400 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  title="Edit thought"
                >
                  <Pencil size={13} />
                </button>
              )}
            </div>

            {currentDecomposeThought?.type && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wide">
                  Define scope of thought:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecomposeType("task")}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all duration-150 ${
                      decomposeType === "task"
                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                        : "bg-white/[0.01] border-white/[0.06] text-zinc-400 hover:bg-white/[0.02]"
                    }`}
                  >
                    <CheckSquare size={16} />
                    <div>
                      <span className="text-xs font-semibold block">Kaizen Step (Atom)</span>
                      <span className="text-[9px] opacity-75 block mt-0.5">
                        Done in one sitting, &lt; 30 min.
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecomposeType("project")}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all duration-150 ${
                      decomposeType === "project"
                        ? "bg-amber-500/5 border-amber-500/20 text-amber-400"
                        : "bg-white/[0.01] border-white/[0.06] text-zinc-400 hover:bg-white/[0.02]"
                    }`}
                  >
                    <FolderKanban size={16} />
                    <div>
                      <span className="text-xs font-semibold block">Project (&gt;1 step)</span>
                      <span className="text-[9px] opacity-75 block mt-0.5">
                        Requires multiple steps.
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center border-t border-white/[0.04] pt-4 mt-2 text-xs">
              <button
                type="button"
                disabled={decomposeIndex === 0}
                onClick={() => setDecomposeIndex((i) => i - 1)}
                className="text-zinc-500 hover:text-zinc-300 disabled:opacity-30 flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Back
              </button>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setDeleteThoughtId(currentDecomposeThought.id)}
                  disabled={isActionPending}
                  className="text-rose-400 hover:text-rose-500 font-medium flex items-center gap-1.5 transition-colors duration-150"
                  title="Delete this thought"
                >
                  <Trash2 size={13} /> Delete
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (decomposeIndex < decomposableThoughts.length - 1) {
                      setDecomposeIndex((i) => i + 1);
                    } else {
                      setDecomposeIndex(0);
                    }
                  }}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  Skip this thought
                </button>
              </div>
            </div>

            <div className="flex justify-between text-xs text-zinc-500 border-t border-white/[0.04] pt-4 mt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-zinc-500 hover:text-zinc-400"
              >
                &larr; Back to Filtering
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="text-zinc-400 hover:text-zinc-200 font-semibold"
              >
                Skip decomposition and proceed &rarr;
              </button>
            </div>
          </div>

          <div className="glass-card p-5 bg-black/20 border-white/[0.06] rounded-xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1 border-b border-white/[0.04] pb-2">
                <span className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
                  📝 Clarify & Detail Thought
                </span>
                <p className="text-[10px] text-zinc-500">
                  Specify the life sphere, template type, and details of this thought.
                </p>
              </div>

              <ThoughtFields
                spheres={spheres}
                sphereId={selectedSphereId}
                type={currentDecomposeThought?.type || null}
                templateData={currentDecomposeThought?.templateData || null}
                onChange={(updatedFields) => {
                  if (updatedFields.sphereId !== undefined) {
                    setSelectedSphereId(updatedFields.sphereId || "");
                  }

                  const targetSphereId =
                    updatedFields.sphereId !== undefined
                      ? updatedFields.sphereId
                      : currentDecomposeThought.sphereId;
                  const targetType =
                    updatedFields.type !== undefined
                      ? updatedFields.type
                      : currentDecomposeThought.type;
                  const targetTemplateData =
                    updatedFields.templateData !== undefined
                      ? updatedFields.templateData
                      : currentDecomposeThought.templateData;

                  // Update thoughts state optimistically
                  setThoughts((previousThoughts) =>
                    previousThoughts.map((currentThought) =>
                      currentThought.id === currentDecomposeThought.id
                        ? {
                            ...currentThought,
                            sphereId: targetSphereId ?? null,
                            type: targetType ?? null,
                            templateData: (targetTemplateData ?? null) as Record<
                              string,
                              string
                            > | null,
                          }
                        : currentThought,
                    ),
                  );

                  // Debounce save in database
                  if (saveTimeoutRef.current) {
                    clearTimeout(saveTimeoutRef.current);
                  }
                  saveTimeoutRef.current = setTimeout(() => {
                    saveThought(
                      currentDecomposeThought.id,
                      targetSphereId ?? null,
                      targetType ?? null,
                      targetTemplateData ?? null,
                    );
                  }, 500);
                }}
              />
            </div>

            {currentDecomposeThought?.type && (
              <div className="flex flex-col gap-4 border-t border-white/[0.04] pt-4">
                {decomposeType === "task" ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-zinc-300 uppercase">
                        Formulate physical step
                      </label>
                      <Input
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        placeholder="Start with a verb: Write email, Buy tickets..."
                      />
                      <p className="text-[10px] text-zinc-500 italic">
                        💡 The step must be so simple that you feel zero friction.
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-zinc-300 uppercase">
                        Description / Details (optional)
                      </label>
                      <Textarea
                        value={taskDesc}
                        onChange={(e) => setTaskDesc(e.target.value)}
                        placeholder="Add links, context or reference..."
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-zinc-300 uppercase">
                        Project Title
                      </label>
                      <Input
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        placeholder="e.g. Set up trading workstation"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-zinc-300 uppercase">
                        Project Description (optional)
                      </label>
                      <Textarea
                        value={projectDesc}
                        onChange={(e) => setProjectDesc(e.target.value)}
                        placeholder="Goal of the project..."
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {decomposeType === "task" && (
                  <div className="flex flex-col gap-3 border-t border-white/[0.04] pt-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[10px] font-mono text-zinc-300 uppercase">
                        <span>Internal resistance before action</span>
                        <span className="text-orange-400 font-bold">{resistance} / 5</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setResistance(val)}
                            className={`flex-1 h-7 rounded text-xs font-mono transition-colors ${
                              resistance === val
                                ? val >= 4
                                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                  : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                : "bg-white/[0.01] border-white/[0.06] text-zinc-500 hover:bg-white/[0.03]"
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                      {resistance >= 4 && (
                        <p className="text-[10px] text-rose-400 font-mono flex items-center gap-1 bg-rose-500/5 p-1.5 rounded border border-rose-500/10">
                          <AlertTriangle size={11} className="shrink-0" />
                          <span>
                            Resistance is high: better split this step into an even simpler one!
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleDecompose(decomposableThoughts[decomposeIndex].id)}
                  disabled={isActionPending}
                  className="w-full mt-2"
                >
                  Decompose and create {decomposeType === "project" ? "Project" : "Atom"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
