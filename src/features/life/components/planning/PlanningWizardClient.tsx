"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sparkles,
  Lightbulb,
  CheckCircle2,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  Play,
  Layers,
  Zap,
  HelpCircle,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import {
  quickCaptureAction,
  routeThoughtAction,
  decomposeThoughtAction,
} from "@/features/life/actions/thought-actions";
import type { LifeSphereData } from "@/features/life/types";
import { KanbanBoardClient } from "../sprints/KanbanBoardClient";
import { ThoughtFields } from "@/features/life/components/thoughts/ThoughtFields";
import type { ThoughtType } from "@/features/life/logic/thought-types";
import { ThoughtDetailDialog } from "@/features/life/components/thoughts/ThoughtDetailDialog";
import { upsertThoughtAction } from "@/features/life/actions/thought-actions";

interface ThoughtItem {
  id: string;
  content: string;
  statusId: string;
  status: {
    id: string;
    name: string;
  };
  sphereId: string | null;
  type?: ThoughtType | null;
  templateData?: Record<string, string> | null;
}

interface PlanningWizardClientProps {
  initialThoughts: ThoughtItem[];
  spheres: LifeSphereData[];
  activeSprint: any;
  initialBacklogProjects: any[];
  initialColumns: any;
}

export function PlanningWizardClient({
  initialThoughts,
  spheres,
  activeSprint,
  initialBacklogProjects,
  initialColumns,
}: PlanningWizardClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0: Intro, 1: Brain Dump, 2: Filter, 3: Decompose, 4: Finish
  const [thoughts, setThoughts] = useState<ThoughtItem[]>(initialThoughts);

  // Step 1: Brain Dump state
  const [newThoughtText, setNewThoughtText] = useState("");
  const [showDetailedFields, setShowDetailedFields] = useState(false);
  const [newThoughtSphereId, setNewThoughtSphereId] = useState<string | null>(null);
  const [newThoughtType, setNewThoughtType] = useState<ThoughtType | null>(null);
  const [newThoughtTemplateData, setNewThoughtTemplateData] = useState<Record<string, string> | null>(null);
  const [editingThought, setEditingThought] = useState<ThoughtItem | null>(null);
  const [activeFilterSphereId, setActiveFilterSphereId] = useState<string | null>(null);
  const [isGroupedBySphere, setIsGroupedBySphere] = useState(false);
  const [isActionPending, startActionTransition] = useTransition();

  const displayedThoughts = useMemo(() => {
    if (!activeFilterSphereId) return thoughts;
    return thoughts.filter((currentThought) => currentThought.sphereId === activeFilterSphereId);
  }, [thoughts, activeFilterSphereId]);

  const groupedThoughts = useMemo(() => {
    const groups: Record<string, ThoughtItem[]> = {};
    thoughts.forEach((thoughtItem) => {
      const key = thoughtItem.sphereId || "uncategorized";
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(thoughtItem);
    });
    return groups;
  }, [thoughts]);

  // Step 2: Filter states
  const inboxThoughts = useMemo(() => {
    const baseThoughts = thoughts.filter((currentThought) => currentThought.status.name === "Inbox" || currentThought.status.name === "Інбокс");
    if (!activeFilterSphereId) return baseThoughts;
    return baseThoughts.filter((currentThought) => currentThought.sphereId === activeFilterSphereId);
  }, [thoughts, activeFilterSphereId]);
  const [filterIndex, setFilterIndex] = useState(0);

  // Step 3: Decompose states
  const decomposableThoughts = useMemo(() => {
    const baseThoughts = thoughts.filter((currentThought) => currentThought.status.name === "Хочу" || currentThought.status.name === "Повинен" || currentThought.status.name === "Want" || currentThought.status.name === "Must");
    if (!activeFilterSphereId) return baseThoughts;
    return baseThoughts.filter((currentThought) => currentThought.sphereId === activeFilterSphereId);
  }, [thoughts, activeFilterSphereId]);
  const [decomposeIndex, setDecomposeIndex] = useState(0);

  // Decomposition Form states
  const [decomposeType, setDecomposeType] = useState<"task" | "project">("task");
  // Task fields
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  // Project fields
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [firstAtomTitle, setFirstAtomTitle] = useState("");
  const [firstAtomDesc, setFirstAtomDesc] = useState("");

  const [selectedSphereId, setSelectedSphereId] = useState<string>(spheres[0]?.id || "");
  const [resistance, setResistance] = useState<number>(3); // 1-5

  // Handlers
  const handleDetailedFieldsChange = (patch: {
    sphereId?: string | null;
    type?: ThoughtType | null;
    templateData?: Record<string, string> | null;
  }) => {
    if (patch.sphereId !== undefined) setNewThoughtSphereId(patch.sphereId);
    if (patch.type !== undefined) setNewThoughtType(patch.type);
    if (patch.templateData !== undefined) setNewThoughtTemplateData(patch.templateData);
  };

  const handleEditClick = (thoughtItem: ThoughtItem) => {
    setEditingThought(thoughtItem);
  };

  const handleSaveEditedThought = (updatedFields: {
    content: string;
    sphereId: string | null;
    type: ThoughtType | null;
    templateData: Record<string, string> | null;
  }) => {
    if (!editingThought) return;

    startActionTransition(async () => {
      const result = await upsertThoughtAction({
        id: editingThought.id,
        content: updatedFields.content,
        sphereId: updatedFields.sphereId,
        type: updatedFields.type,
        templateData: updatedFields.templateData,
      });

      if (result.success) {
        toast.success("Thought updated!");
        setThoughts((previousThoughts) =>
          previousThoughts.map((currentThought) =>
            currentThought.id === editingThought.id
              ? {
                  ...currentThought,
                  content: result.data.content,
                  sphereId: result.data.sphereId,
                  type: result.data.type,
                  templateData: result.data.templateData as Record<string, string> | null,
                }
              : currentThought
          )
        );
      } else {
        toast.error(result.error || "Failed to update thought");
      }
    });
  };

  const handleAddThought = () => {
    const text = newThoughtText.trim();
    if (!text) return;

    startActionTransition(async () => {
      const extraFields = showDetailedFields
        ? {
            sphereId: newThoughtSphereId,
            type: newThoughtType,
            templateData: newThoughtTemplateData,
          }
        : activeFilterSphereId
          ? {
              sphereId: activeFilterSphereId,
            }
          : undefined;

      const result = await quickCaptureAction(text, extraFields);
      if (result.success) {
        toast.success("Thought captured!");
        const newThought: ThoughtItem = {
          id: result.data.id,
          content: result.data.content,
          statusId: result.data.statusId,
          status: {
            id: result.data.statusId,
            name: "Inbox",
          },
          sphereId: result.data.sphereId,
          type: result.data.type,
          templateData: result.data.templateData as Record<string, string> | null,
        };
        setThoughts((previousThoughts) => [...previousThoughts, newThought]);
        setNewThoughtText("");
        setNewThoughtSphereId(activeFilterSphereId);
        setNewThoughtType(null);
        setNewThoughtTemplateData(null);
        setShowDetailedFields(false);
      } else {
        toast.error(result.error || "Failed to capture thought");
      }
    });
  };

  // Keep filterIndex and decomposeIndex in bounds when inboxThoughts/decomposableThoughts change
  useEffect(() => {
    if (filterIndex >= inboxThoughts.length && inboxThoughts.length > 0) {
      setFilterIndex(inboxThoughts.length - 1);
    }
  }, [inboxThoughts.length, filterIndex]);

  useEffect(() => {
    if (decomposeIndex >= decomposableThoughts.length && decomposableThoughts.length > 0) {
      setDecomposeIndex(decomposableThoughts.length - 1);
    }
  }, [decomposableThoughts.length, decomposeIndex]);

  const handleFilterThought = (thoughtId: string, outcome: "KEEP_WANT" | "KEEP_MUST" | "NOT_MINE") => {
    startActionTransition(async () => {
      const result = await routeThoughtAction(thoughtId, outcome);
      if (result.success) {
        toast.success("Thought filtered");
        const statusNameMap = {
          KEEP_WANT: "Want",
          KEEP_MUST: "Must",
          NOT_MINE: "Basket",
        };
        setThoughts((prev) =>
          prev.map((t) =>
            t.id === thoughtId
              ? { ...t, status: { ...t.status, name: statusNameMap[outcome] } }
              : t
          )
        );

        if (filterIndex < inboxThoughts.length - 1) {
          setFilterIndex((prev) => prev + 1);
        } else {
          toast.success("All thoughts from Inbox filtered!");
        }
      } else {
        toast.error(result.error || "Failed to filter thought");
      }
    });
  };

  // Run decomposition
  const handleDecompose = (thoughtId: string) => {
    const isProject = decomposeType === "project";

    const title = isProject ? projectTitle.trim() : taskTitle.trim();
    if (!title) return;

    startActionTransition(async () => {
      const result = await decomposeThoughtAction({
        thoughtId,
        type: decomposeType,
        projectTitle: isProject ? title : undefined,
        description: isProject ? projectDesc : taskDesc,
        atomTitle: isProject ? firstAtomTitle.trim() : title,
        atomDescription: isProject ? firstAtomDesc.trim() : undefined,
        sphereId: selectedSphereId,
        priority: "MEDIUM",
      });

      if (result.success) {
        toast.success(isProject ? "Project created successfully!" : "Atom created successfully!");

        // Remove the decomposed thought locally
        setThoughts((prev) => prev.filter((t) => t.id !== thoughtId));

        // Reset form states
        setTaskTitle("");
        setTaskDesc("");
        setProjectTitle("");
        setProjectDesc("");
        setFirstAtomTitle("");
        setFirstAtomDesc("");
        setResistance(3);

        if (decomposeIndex < decomposableThoughts.length - 1) {
          // Keep index bounds checked
        } else {
          setDecomposeIndex(0);
        }
      } else {
        toast.error(result.error || "Error during decomposition");
      }
    });
  };

  const currentDecomposeThought = decomposableThoughts[decomposeIndex];
  useMemo(() => {
    if (currentDecomposeThought) {
      setTaskTitle(currentDecomposeThought.content);
      setProjectTitle(currentDecomposeThought.content);
      setFirstAtomTitle("First action for: " + currentDecomposeThought.content.slice(0, 30));
    }
  }, [currentDecomposeThought]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Step Indicator */}
      {step > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/[0.06] pb-4 gap-3">
          <div className="flex flex-wrap items-center gap-1.5 md:gap-4 text-xs font-mono text-zinc-500">
            <span className={step === 1 ? "text-accent font-bold" : thoughts.length > 0 ? "text-zinc-300" : ""}>
              1. BRAIN DUMP
            </span>
            <ChevronRight size={12} />
            <span className={step === 2 ? "text-accent font-bold" : inboxThoughts.length === 0 ? "text-zinc-300" : ""}>
              2. PRIME FILTER
            </span>
            <ChevronRight size={12} />
            <span className={step === 3 ? "text-accent font-bold" : decomposableThoughts.length === 0 ? "text-zinc-300" : ""}>
              3. DECOMPOSITION
            </span>
            <ChevronRight size={12} />
            <span className={step === 4 ? "text-accent font-bold" : ""}>
              4. DISTRIBUTE
            </span>
          </div>

          <div className="flex items-center gap-3">
            {activeFilterSphereId && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-mono text-accent uppercase tracking-wider">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                  style={{
                    backgroundColor: spheres.find(
                      (currentSphere) => currentSphere.id === activeFilterSphereId
                    )?.color,
                  }}
                />
                <span>
                  Context:{" "}
                  {
                    spheres.find((currentSphere) => currentSphere.id === activeFilterSphereId)
                      ?.name
                  }
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilterSphereId(null);
                    if (!showDetailedFields) {
                      setNewThoughtSphereId(null);
                    }
                  }}
                  className="ml-1 hover:text-zinc-200 transition-colors font-bold"
                  title="Clear context filter"
                >
                  &times;
                </button>
              </div>
            )}

            <Button variant="ghost" size="sm" onClick={() => setStep(0)} className="text-xs">
              Restart Flow
            </Button>
          </div>
        </div>
      )}

      {/* STEP 0: INTRO */}
      {step === 0 && (
        <div className="glass-card p-6 md:p-8 flex flex-col gap-6 items-center text-center bg-white/[0.01] max-w-3xl mx-auto w-full">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center animate-float">
            <Sparkles size={32} />
          </div>

          <div className="flex flex-col gap-2 max-w-lg">
            <h2 className="text-2xl font-bold text-zinc-100 font-mono">Kaizen Planning Cycle</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Do not try to plan the chaos in your head. Let's declutter your mind, sift thoughts through the Prime Filter, and break them down into atoms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full text-left mt-4">
            <div className="glass-card p-4 flex gap-3 border-white/[0.04] bg-white/[0.01]">
              <span className="text-xl">✍️</span>
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-300">1. Brain Dump</h4>
                <p className="text-[11px] text-zinc-500 mt-1">Write down everything on your mind without analysis or limits.</p>
              </div>
            </div>
            <div className="glass-card p-4 flex gap-3 border-white/[0.04] bg-white/[0.01]">
              <span className="text-xl">🔍</span>
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-300">2. Prime Filter</h4>
                <p className="text-[11px] text-zinc-500 mt-1">Separate true desires from external obligations. Discard informational clutter.</p>
              </div>
            </div>
            <div className="glass-card p-4 flex gap-3 border-white/[0.04] bg-white/[0.01]">
              <span className="text-xl">🔬</span>
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-300">3. Decomposition</h4>
                <p className="text-[11px] text-zinc-500 mt-1">Convert raw ideas into projects or concrete physical actions (atoms).</p>
              </div>
            </div>
            <div className="glass-card p-4 flex gap-3 border-white/[0.04] bg-white/[0.01]">
              <span className="text-xl">📅</span>
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-300">4. Distribution (Kanban)</h4>
                <p className="text-[11px] text-zinc-500 mt-1">Set weekly plans and distribute daily workloads.</p>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setStep(1)}
            className="mt-4 px-8 py-2.5 font-semibold text-sm flex items-center gap-2"
          >
            Start Planning <ArrowRight size={16} />
          </Button>
        </div>
      )}

      {/* STEP 1: BRAIN DUMP */}
      {step === 1 && (
        <div className="flex flex-col gap-6 w-full">
          {/* Top Form */}
          <div className="glass-card p-6 bg-black/15 border border-white/[0.04] rounded-2xl flex flex-col gap-4 w-full">
            <div>
              <h3 className="text-panel-title font-semibold text-zinc-200">Step 1: Brain Dump</h3>
              <p className="text-caption text-xs mt-1">
                Write down everything on your mind: tasks, shopping, thoughts, ideas, obligations. Write quickly.
              </p>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex gap-3 items-start">
                <Textarea
                  value={newThoughtText}
                  onChange={(e) => setNewThoughtText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      if (e.metaKey || e.ctrlKey || !showDetailedFields) {
                        e.preventDefault();
                        handleAddThought();
                      }
                    }
                  }}
                  placeholder="Capture thought... (Ctrl+Enter to save)"
                  autoFocus
                  disabled={isActionPending}
                  rows={2}
                  className="flex-1 min-h-[60px]"
                />
                <div className="flex flex-col gap-2 shrink-0">
                  <Button
                    variant="primary"
                    onClick={handleAddThought}
                    disabled={!newThoughtText.trim() || isActionPending}
                    className="h-9 px-4"
                  >
                    Add
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => setShowDetailedFields(!showDetailedFields)}
                    className="text-[11px] font-mono h-8 border border-white/[0.04] bg-white/[0.01]"
                  >
                    {showDetailedFields ? "Hide details" : "Add details"}
                  </Button>
                </div>
              </div>

              {showDetailedFields && (
                <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.01] flex flex-col gap-4 animate-fade-up">
                  <ThoughtFields
                    spheres={spheres}
                    sphereId={newThoughtSphereId}
                    type={newThoughtType}
                    templateData={newThoughtTemplateData}
                    onChange={handleDetailedFieldsChange}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-white/[0.04]">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                💡 Life Areas (click to filter and pre-select):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {spheres.map((currentSphere) => {
                  const isSelected = activeFilterSphereId === currentSphere.id;
                  return (
                    <button
                      key={currentSphere.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setActiveFilterSphereId(null);
                          if (!showDetailedFields) {
                            setNewThoughtSphereId(null);
                          }
                        } else {
                          setActiveFilterSphereId(currentSphere.id);
                          setNewThoughtSphereId(currentSphere.id);
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono uppercase tracking-wide border transition-all duration-150 ${
                        isSelected
                          ? "bg-accent/15 text-accent border-accent/40 shadow-sm"
                          : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-zinc-300 hover:bg-white/5"
                      }`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: currentSphere.color }}
                      />
                      <span>{currentSphere.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Inbox List (3-column grid) */}
          <div className="glass-card p-5 bg-black/10 border border-white/[0.04] rounded-2xl flex flex-col gap-4 w-full">
            <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
              <div className="flex items-center gap-3">
                <h4 className="text-xs font-mono font-semibold uppercase text-zinc-400">Current Inbox</h4>
                {!activeFilterSphereId && thoughts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsGroupedBySphere(!isGroupedBySphere)}
                    className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded border transition-colors duration-150 ${
                      isGroupedBySphere
                        ? "bg-accent/15 text-accent border-accent/30"
                        : "text-zinc-500 border-white/[0.06] hover:text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    Group by sphere
                  </button>
                )}
              </div>
              <span className="text-[11px] font-mono text-zinc-500 bg-white/[0.03] px-2 py-0.5 rounded">
                {activeFilterSphereId ? `${displayedThoughts.length} of ${thoughts.length}` : thoughts.length}
              </span>
            </div>

            {displayedThoughts.length === 0 ? (
              <div className="text-zinc-500 text-xs italic py-12 text-center">
                {activeFilterSphereId 
                  ? "No thoughts captured in this sphere yet." 
                  : "Your thoughts will appear here. Write something above!"}
              </div>
            ) : isGroupedBySphere && !activeFilterSphereId ? (
              <div className="flex flex-col gap-6 overflow-y-auto max-h-[350px] pr-1">
                {/* 1. Uncategorized Group */}
                {groupedThoughts["uncategorized"]?.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2 border-b border-white/[0.04] pb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0" />
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                        Uncategorized ({groupedThoughts["uncategorized"].length})
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[...groupedThoughts["uncategorized"]].reverse().map((thoughtItem) => (
                        <div
                          key={thoughtItem.id}
                          className="glass-card p-3 text-xs bg-white/[0.01] border-white/[0.04] flex flex-col gap-2 min-h-[48px] relative group"
                        >
                          <div className="flex items-start justify-between gap-3 w-full">
                            <span className="text-zinc-305 leading-normal break-words flex-1 whitespace-pre-wrap">
                              {thoughtItem.content}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleEditClick(thoughtItem)}
                                className="p-1 rounded text-zinc-500 hover:text-zinc-350 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                title="Edit thought"
                              >
                                <Pencil size={12} />
                              </button>
                              <span className="text-[9px] font-mono text-zinc-500 bg-white/[0.03] px-1.5 py-0.5 rounded h-fit">
                                {thoughtItem.status.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Spheres Groups */}
                {spheres.map((currentSphere) => {
                  const thoughtsInSphere = groupedThoughts[currentSphere.id] || [];
                  if (thoughtsInSphere.length === 0) return null;

                  return (
                    <div key={currentSphere.id} className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-2 border-b border-white/[0.04] pb-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: currentSphere.color }}
                        />
                        <span className="text-[10px] font-mono text-zinc-450 uppercase tracking-wider font-semibold">
                          {currentSphere.name} ({thoughtsInSphere.length})
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[...thoughtsInSphere].reverse().map((thoughtItem) => (
                          <div
                            key={thoughtItem.id}
                            className="glass-card p-3 text-xs bg-white/[0.01] border-white/[0.04] flex flex-col gap-2 min-h-[48px] relative group"
                          >
                            <div className="flex items-start justify-between gap-3 w-full">
                              <span className="text-zinc-305 leading-normal break-words flex-1 whitespace-pre-wrap">
                                {thoughtItem.content}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleEditClick(thoughtItem)}
                                  className="p-1 rounded text-zinc-500 hover:text-zinc-350 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                  title="Edit thought"
                                >
                                  <Pencil size={12} />
                                </button>
                                <span className="text-[9px] font-mono text-zinc-500 bg-white/[0.03] px-1.5 py-0.5 rounded h-fit">
                                  {thoughtItem.status.name}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto max-h-[350px] pr-1">
                {[...displayedThoughts].reverse().map((thoughtItem) => {
                  const sphere = spheres.find((currentSphere) => currentSphere.id === thoughtItem.sphereId);
                  return (
                    <div
                      key={thoughtItem.id}
                      className="glass-card p-3 text-xs bg-white/[0.01] border-white/[0.04] flex flex-col gap-2 min-h-[48px] relative group"
                    >
                      <div className="flex items-start justify-between gap-3 w-full">
                        <span className="text-zinc-305 leading-normal break-words flex-1 whitespace-pre-wrap">
                          {thoughtItem.content}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditClick(thoughtItem)}
                            className="p-1 rounded text-zinc-500 hover:text-zinc-350 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                            title="Edit thought"
                          >
                            <Pencil size={12} />
                          </button>
                          <span className="text-[9px] font-mono text-zinc-500 bg-white/[0.03] px-1.5 py-0.5 rounded h-fit">
                            {thoughtItem.status.name}
                          </span>
                        </div>
                      </div>
                      {sphere && (
                        <div className="flex items-center gap-1.5 self-start mt-auto">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: sphere.color }}
                          />
                          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide">
                            {sphere.name}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {thoughts.length > 0 && (
              <div className="flex justify-end border-t border-white/[0.04] pt-3 mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(2)}
                  className="w-full md:w-auto"
                >
                  Next to Filtering ({inboxThoughts.length} in Inbox) <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: PRIME FILTER */}
      {step === 2 && (
        <div className="glass-card p-6 md:p-8 bg-black/15 border border-white/[0.04] rounded-2xl flex flex-col gap-6 items-center max-w-2xl mx-auto w-full">
          <div className="w-full flex items-center justify-between border-b border-white/[0.04] pb-3 mb-2">
            <h3 className="text-panel-title font-semibold text-zinc-200">Step 2: Prime Filter</h3>
            <span className="text-xs font-mono text-zinc-500">
              Card {inboxThoughts.length > 0 ? filterIndex + 1 : 0} of {inboxThoughts.length}
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
              <div className="glass-card p-6 w-full border-white/10 bg-white/[0.02] shadow-xl text-center min-h-[120px] flex items-center justify-center relative group">
                <p className="text-lg font-medium text-zinc-150 leading-relaxed font-sans whitespace-pre-wrap">
                  &ldquo;{inboxThoughts[filterIndex]?.content}&rdquo;
                </p>
                {inboxThoughts[filterIndex] && (
                  <button
                    type="button"
                    onClick={() => handleEditClick(inboxThoughts[filterIndex])}
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
                  style={{ width: `${((filterIndex + 1) / inboxThoughts.length) * 100}%` }}
                />
              </div>

              <p className="text-xs font-mono text-zinc-400 text-center uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle size={13} className="text-accent" /> What is this thought?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleFilterThought(inboxThoughts[filterIndex].id, "KEEP_WANT")}
                  className="border-emerald-500/20 text-emerald-400 bg-emerald-500/[0.02] hover:bg-emerald-500/10 h-12"
                >
                  💚 WANT (Desire)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleFilterThought(inboxThoughts[filterIndex].id, "KEEP_MUST")}
                  className="border-amber-500/20 text-amber-400 bg-amber-500/[0.02] hover:bg-amber-500/10 h-12"
                >
                  💙 MUST (Obligation)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleFilterThought(inboxThoughts[filterIndex].id, "NOT_MINE")}
                  className="border-zinc-500/20 text-zinc-400 bg-white/[0.01] hover:bg-white/[0.03] h-12"
                >
                  🗑️ NOT MINE (To Basket)
                </Button>
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
      )}

      {/* STEP 3: DECOMPOSITION */}
      {step === 3 && (
        <div className="glass-card p-6 md:p-8 bg-black/15 border border-white/[0.04] rounded-2xl flex flex-col gap-6">
          <div className="w-full flex items-center justify-between border-b border-white/[0.04] pb-3 mb-2">
            <div>
              <h3 className="text-panel-title font-semibold text-zinc-200">Step 3: Kaizen Decomposition</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">We split raw thoughts into large Projects and tiny physical steps (Atoms).</p>
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
                  You have successfully decomposed all filtered desires and obligations into actionable items.
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
                <div className="glass-card p-4 border-amber-500/10 bg-amber-500/[0.01] rounded-xl flex flex-col gap-2 relative group">
                  <div className="flex justify-between items-center text-[9px] font-mono text-amber-400 font-semibold uppercase">
                    <span>Raw thought ({decomposableThoughts[decomposeIndex]?.status.name})</span>
                    <span>Thought {decomposeIndex + 1} of {decomposableThoughts.length}</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-150 leading-relaxed font-sans whitespace-pre-wrap">
                    &ldquo;{decomposableThoughts[decomposeIndex]?.content}&rdquo;
                  </p>
                  {decomposableThoughts[decomposeIndex] && (
                    <button
                      type="button"
                      onClick={() => handleEditClick(decomposableThoughts[decomposeIndex])}
                      className="absolute top-3 right-3 p-1.5 rounded text-zinc-500 hover:text-zinc-350 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                      title="Edit thought"
                    >
                      <Pencil size={13} />
                    </button>
                  )}
                </div>

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
                        <span className="text-[9px] opacity-75 block mt-0.5">Done in one sitting, &lt; 30 min.</span>
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
                        <span className="text-[9px] opacity-75 block mt-0.5">Requires multiple steps.</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-white/[0.04] pt-4 mt-2 text-xs">
                  <button
                    type="button"
                    disabled={decomposeIndex === 0}
                    onClick={() => setDecomposeIndex((i) => i - 1)}
                    className="text-zinc-500 hover:text-zinc-300 disabled:opacity-30 flex items-center gap-1"
                  >
                    <ChevronLeft size={14} /> Back
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

              <div className="glass-card p-5 bg-black/20 border-white/[0.06] rounded-xl flex flex-col gap-4">
                {decomposeType === "task" ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-zinc-300 uppercase">Formulate physical step</label>
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
                      <label className="text-[10px] font-mono text-zinc-300 uppercase">Description / Details (optional)</label>
                      <Textarea
                        value={taskDesc}
                        onChange={(e) => setTaskDesc(e.target.value)}
                        placeholder="Useful links, notes, etc..."
                        rows={2}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-zinc-300 uppercase">Project title</label>
                      <Input
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        placeholder="e.g. Relocate to new office"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-zinc-300 uppercase">Project description (optional)</label>
                      <Textarea
                        value={projectDesc}
                        onChange={(e) => setProjectDesc(e.target.value)}
                        placeholder="Desired outcome that defines success..."
                        rows={2}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 border-t border-white/[0.04] pt-3">
                      <label className="text-[10px] font-mono text-amber-400 uppercase font-semibold">
                        What is the very first physical action needed to get started?
                      </label>
                      <Input
                        value={firstAtomTitle}
                        onChange={(e) => setFirstAtomTitle(e.target.value)}
                        placeholder="Start with a verb: Call realtor, Pack boxes..."
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 border-t border-white/[0.04] pt-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-zinc-300 uppercase">Life sphere</label>
                    <div className="flex flex-wrap gap-1.5">
                      {spheres.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedSphereId(s.id)}
                          className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                            selectedSphereId === s.id
                              ? "bg-accent/15 text-accent border-accent/30"
                              : "text-zinc-500 border-white/[0.06] hover:text-zinc-300 hover:bg-white/5"
                          }`}
                        >
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                            style={{ backgroundColor: s.color }}
                          />
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>

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
                        <span>Resistance is high: better split this step into an even simpler one!</span>
                      </p>
                    )}
                  </div>
                </div>

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
            </div>
          )}
        </div>
      )}

      {/* 📅 STEP 4: KANBAN DISTRIBUTION */}
      {step === 4 && (
        <div className="flex flex-col gap-6">
          <div className="glass-card p-4 bg-emerald-500/5 border-emerald-500/10 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">🎉</span>
              <div>
                <h4 className="text-sm font-bold text-zinc-100 font-mono">Decomposition complete! Step 4: Distribute</h4>
                <p className="text-xs text-zinc-400">
                  All your new projects are added to the Backlog, and atoms to the Weekly Plan. Distribute them now:
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push("/life/planning/kanban")}
              className="flex items-center gap-1.5"
            >
              Finish Planning <CheckCircle2 size={14} />
            </Button>
          </div>

          <KanbanBoardClient
            initialSprint={activeSprint}
            initialBacklogProjects={initialBacklogProjects}
            initialColumns={initialColumns}
            spheres={spheres}
          />
        </div>
      )}

      {editingThought && (
        <ThoughtDetailDialog
          isOpen={true}
          onClose={() => setEditingThought(null)}
          thought={{
            id: editingThought.id,
            statusId: editingThought.statusId,
            content: editingThought.content,
            order: 0,
            type: editingThought.type ?? null,
            templateData: editingThought.templateData ?? null,
            sphereId: editingThought.sphereId,
            sphere: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }}
          spheres={spheres}
          onSave={handleSaveEditedThought}
        />
      )}
    </div>
  );
}
