"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Compass,
  CheckCircle2,
  ArrowRightLeft,
  Trash2,
  GitBranch,
  CheckSquare,
  Sparkles,
  Zap,
  Save,
  MessageSquareQuote,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  ListChecks,
  Gauge,
  Feather,
  Bot,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { upsertTaskAction, deleteTaskAction } from "@/features/life/actions/task-actions";
import { saveSprintReviewAction } from "@/features/life/actions/sprint-actions";
import type { TaskData, WeekSummary, DailyVector } from "@/features/life/types";
import type { Prisma } from "@/app/generated/prisma";

const VECTOR_PROMPTS: {
  key: keyof DailyVector;
  icon: LucideIcon;
  label: string;
  placeholder: string;
}[] = [
  {
    key: "toImprove",
    icon: TrendingUp,
    label: "Improve",
    placeholder: "What do I need to improve?",
  },
  { key: "toDo", icon: ListChecks, label: "Do", placeholder: "What do I need to do?" },
  {
    key: "toIncreaseEfficiency",
    icon: Gauge,
    label: "Efficiency",
    placeholder: "How do I increase efficiency?",
  },
  {
    key: "toReduceEffort",
    icon: Feather,
    label: "Reduce Effort",
    placeholder: "How do I reduce effort?",
  },
  { key: "toAutomate", icon: Bot, label: "Automate", placeholder: "What do I need to automate?" },
  { key: "toDelegate", icon: Users, label: "Delegate", placeholder: "What do I need to delegate?" },
  { key: "toFix", icon: Wrench, label: "Fix", placeholder: "What do I need to fix?" },
];

interface KaizenTabProps {
  tasks: TaskData[];
  activeSprint: {
    id: string;
    number: number;
    year: number;
    startDate: Date;
    endDate: Date;
    status: string;
  } | null;
  sprintReviews: {
    id: string;
    sprintId: string;
    weekNumber: number;
    score: number | null;
    wins: string | null;
    challenges: string | null;
    adjustments: string | null;
    kaizenVector: DailyVector | null;
  }[];
  weekStart: Date;
  summary: WeekSummary;
}

export function KaizenTab({
  tasks,
  activeSprint,
  sprintReviews,
  weekStart,
  summary,
}: KaizenTabProps) {
  const router = useRouter();
  const [localTasks, setLocalTasks] = useState<TaskData[]>(tasks);
  const [decomposingTaskId, setDecomposingTaskId] = useState<string | null>(null);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  // Calculate week number of active sprint
  const weekNum = activeSprint
    ? Math.floor(
        (new Date(weekStart).getTime() - new Date(activeSprint.startDate).getTime()) /
          (7 * 24 * 60 * 60 * 1000),
      ) + 1
    : null;

  // Find existing review for this sprint and week
  const currentReview = activeSprint
    ? (sprintReviews.find((r) => r.sprintId === activeSprint.id && r.weekNumber === weekNum) ??
      null)
    : null;

  return (
    <KaizenFormInner
      key={`kaizen-form-${weekNum ?? "none"}`}
      tasks={tasks}
      activeSprint={activeSprint}
      weekStart={weekStart}
      weekNum={weekNum}
      currentReview={currentReview}
      summary={summary}
      localTasks={localTasks}
      setLocalTasks={setLocalTasks}
      decomposingTaskId={decomposingTaskId}
      setDecomposingTaskId={setDecomposingTaskId}
      subtaskTitle={subtaskTitle}
      setSubtaskTitle={setSubtaskTitle}
      isPending={isPending}
      startTransition={startTransition}
      router={router}
    />
  );
}

// Inner form component with re-keyed state
interface KaizenFormInnerProps {
  tasks: TaskData[];
  activeSprint: {
    id: string;
    number: number;
    year: number;
    startDate: Date;
    endDate: Date;
    status: string;
  } | null;
  weekStart: Date;
  weekNum: number | null;
  currentReview: {
    id: string;
    sprintId: string;
    weekNumber: number;
    score: number | null;
    wins: string | null;
    challenges: string | null;
    adjustments: string | null;
    kaizenVector: DailyVector | null;
  } | null;
  summary: WeekSummary;
  localTasks: TaskData[];
  setLocalTasks: React.Dispatch<React.SetStateAction<TaskData[]>>;
  decomposingTaskId: string | null;
  setDecomposingTaskId: (id: string | null) => void;
  subtaskTitle: string;
  setSubtaskTitle: (title: string) => void;
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
  router: ReturnType<typeof import("next/navigation").useRouter>;
}

function KaizenFormInner({
  tasks,
  activeSprint,
  weekStart,
  weekNum,
  currentReview,
  summary,
  localTasks,
  setLocalTasks,
  decomposingTaskId,
  setDecomposingTaskId,
  subtaskTitle,
  setSubtaskTitle,
  isPending,
  startTransition,
  router,
}: KaizenFormInnerProps) {
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks, setLocalTasks]);

  // Form states
  const [score, setScore] = useState<number>(currentReview?.score ?? 7);
  const [wins, setWins] = useState<string>(currentReview?.wins ?? "");
  const [challenges, setChallenges] = useState<string>(currentReview?.challenges ?? "");
  const [adjustments, setAdjustments] = useState<string>(currentReview?.adjustments ?? "");
  const [isVectorExpanded, setIsVectorExpanded] = useState(false);
  const [kaizenVector, setKaizenVector] = useState<DailyVector>(
    currentReview?.kaizenVector ?? {
      toImprove: null,
      toDo: null,
      toIncreaseEfficiency: null,
      toReduceEffort: null,
      toAutomate: null,
      toDelegate: null,
      toFix: null,
    },
  );

  // Checklist states
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  // Filter stuck tasks
  const stuckTasks = localTasks.filter(
    (t) =>
      t.status !== "DONE" &&
      t.status !== "CANCELLED" &&
      t.plannedDate &&
      new Date(t.plannedDate) >= new Date(weekStart) &&
      new Date(t.plannedDate) < new Date(new Date(weekStart).getTime() + 7 * 24 * 60 * 60 * 1000),
  );

  const completedTasksCount = localTasks.filter(
    (t) =>
      t.status === "DONE" &&
      t.completedAt &&
      new Date(t.completedAt) >= new Date(weekStart) &&
      new Date(t.completedAt) < new Date(new Date(weekStart).getTime() + 7 * 24 * 60 * 60 * 1000),
  ).length;

  const handleMoveToBacklog = (taskId: string) => {
    startTransition(async () => {
      const result = await upsertTaskAction({
        id: taskId,
        plannedDate: null,
      });
      if (result.success) {
        toast.success("Task moved to Global Backlog");
        setLocalTasks((prev) => prev.filter((t) => t.id !== taskId));
      } else {
        toast.error(result.error || "Failed to move task to backlog");
      }
    });
  };

  const handleDeleteTask = (taskId: string) => {
    startTransition(async () => {
      const result = await deleteTaskAction(taskId);
      if (result.success) {
        toast.success("Task deleted successfully");
        setLocalTasks((prev) => prev.filter((t) => t.id !== taskId));
      } else {
        toast.error(result.error || "Failed to delete task");
      }
    });
  };

  const handleDecompose = (parentTask: TaskData) => {
    const title = subtaskTitle.trim();
    if (!title) return;

    startTransition(async () => {
      const subtaskResult = await upsertTaskAction({
        title,
        parentId: parentTask.id,
        sphereId: parentTask.sphereId,
        status: "TODO",
        priority: "MEDIUM",
        plannedDate: weekStart.toISOString(),
      });

      if (subtaskResult.success) {
        toast.success("Created a smaller atom!");
        setSubtaskTitle("");
        setDecomposingTaskId(null);
        const newSub: TaskData = subtaskResult.data as TaskData;
        setLocalTasks((prev) => [newSub, ...prev]);
      } else {
        toast.error(subtaskResult.error || "Failed to create subtask");
      }
    });
  };

  const handleSaveReview = () => {
    if (!activeSprint || !weekNum) {
      toast.error("No active sprint to save review");
      return;
    }

    startTransition(async () => {
      const result = await saveSprintReviewAction(
        activeSprint.id,
        weekNum,
        weekStart.toISOString(),
        {
          score,
          wins,
          challenges,
          adjustments,
          kaizenVector: kaizenVector as unknown as Prisma.InputJsonValue,
        },
      );

      if (result.success) {
        toast.success("Weekly review saved successfully!");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save review");
      }
    });
  };

  const toggleCheck = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderCheckboxItem = (id: string, text: string) => {
    const isChecked = !!checklist[id];
    return (
      <label
        key={id}
        className={`flex items-start gap-3 p-2.5 rounded-xl border transition-colors cursor-pointer ${
          isChecked
            ? "bg-emerald-500/5 border-emerald-500/20 text-zinc-300"
            : "bg-white/[0.01] border-white/[0.06] text-zinc-150 hover:bg-white/[0.03]"
        }`}
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => toggleCheck(id)}
          className="mt-1 accent-emerald-500 cursor-pointer rounded"
        />
        <span className="text-xs leading-snug">{text}</span>
      </label>
    );
  };

  const renderChecklistHeader = () => {
    if (!weekNum || weekNum < 1 || weekNum > 12) {
      return (
        <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <CheckSquare size={14} className="text-orange-400" />
          Weekly Review Checklist
        </h4>
      );
    }
    if (weekNum === 4 || weekNum === 8) {
      return (
        <h4 className="text-sm font-semibold text-orange-400 flex items-center gap-2 font-mono">
          <Compass size={14} />
          Monthly Checkpoint (Week {weekNum} / 12)
        </h4>
      );
    }
    if (weekNum === 12) {
      return (
        <h4 className="text-sm font-semibold text-purple-400 flex items-center gap-2 font-mono">
          <Sparkles size={14} />
          Sprint Review / &quot;Annual&quot; Analysis (Week 12 / 12)
        </h4>
      );
    }
    return (
      <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2 font-mono">
        <Zap size={14} className="text-orange-400" />
        Week {weekNum} / 12 — Kaizen Review
      </h4>
    );
  };

  const renderChecklistItems = () => {
    if (!weekNum || weekNum < 1 || weekNum > 12) {
      return (
        <>
          {renderCheckboxItem(
            "w-1",
            `Metric collection: Review completed atoms (${completedTasksCount} done). Feel the win!`,
          )}
          {renderCheckboxItem(
            "w-2",
            "Kaizen audit: Analyze stuck atoms in the list on the left. Why did they stall?",
          )}
          {renderCheckboxItem("w-3", "Planning: Slice 5-10 new kaizen atoms for the next week.")}
        </>
      );
    }
    if (weekNum === 4 || weekNum === 8) {
      return (
        <>
          <p className="text-[10px] text-orange-400 font-mono mb-1">
            ⚠️ SPRINT MILESTONE. EVALUATE YOUR PROGRESS:
          </p>
          {renderCheckboxItem(
            "m-1",
            `Compass check: Have you completed ${weekNum === 4 ? "33%" : "66%"} of your Sprint goals?`,
          )}
          {renderCheckboxItem(
            "m-2",
            "Hard priority: Are you ready to freeze secondary projects to save the primary?",
          )}
          {renderCheckboxItem(
            "m-3",
            "Plan correction: Officially adjust or reassign Sprint projects.",
          )}
        </>
      );
    }
    if (weekNum === 12) {
      return (
        <>
          <p className="text-[10px] text-purple-400 font-mono mb-1">
            🎉 THIS IS YOUR NEW YEAR! TIME FOR STRATEGY & CELEBRATION:
          </p>
          {renderCheckboxItem(
            "s-1",
            "Celebration: Review and write down all achievements this Sprint. Feel the win!",
          )}
          {renderCheckboxItem(
            "s-2",
            "Deep Kaizen: What habits/processes blocked you? Define one new rule for the next Sprint.",
          )}
          {renderCheckboxItem(
            "s-3",
            "Backlog cleaning: Review Global Backlog and ruthlessly delete stale ideas.",
          )}
          {renderCheckboxItem(
            "s-4",
            "New Sprint: Select 2-3 new goals/projects from the Backlog for the next 12 weeks.",
          )}
          {renderCheckboxItem(
            "s-5",
            "Week 13 (Rest): Make the next week buffer. No planning — rest for the brain.",
          )}
        </>
      );
    }
    return (
      <>
        {renderCheckboxItem(
          "w-1",
          `Metric collection: Review completed atoms (${completedTasksCount} done). Feel the win!`,
        )}
        {renderCheckboxItem(
          "w-2",
          "Kaizen audit: Analyze stuck atoms in the list on the left. Why did they stall?",
        )}
        {renderCheckboxItem("w-3", "Planning: Slice new atoms for Sprint goals for the next week.")}
      </>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr] gap-6 items-start">
      {/* Column 1: Kaizen Audit (Stuck Tasks) */}
      <div className="glass-card p-5 bg-black/15 border border-white/[0.04] rounded-2xl flex flex-col gap-4">
        <div>
          <h3 className="text-panel-title font-semibold text-zinc-200">
            🔎 Kaizen Audit (Stuck Atoms)
          </h3>
          <p className="text-caption text-xs mt-1">
            Tasks that were planned but not completed this week. Find systemic failures.
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-1 max-h-[500px] overflow-y-auto pr-1">
          {stuckTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-xs italic bg-white/[0.01] border border-white/[0.04] rounded-xl">
              <CheckCircle2 size={22} className="text-emerald-400 mb-2" />
              All planned atoms completed! Great job.
            </div>
          ) : (
            stuckTasks.map((task) => (
              <div
                key={task.id}
                className="glass-card p-3.5 bg-white/[0.01] border-white/[0.06] rounded-xl flex flex-col gap-3 relative hover:border-white/10 transition-colors"
              >
                <div>
                  <h5 className="text-xs font-semibold text-zinc-200 leading-normal">
                    {task.title}
                  </h5>
                  {task.project && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9px] font-mono uppercase">
                      Project: {task.project.title}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 border-t border-white/[0.04] pt-2 flex-wrap">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setDecomposingTaskId(decomposingTaskId === task.id ? null : task.id)
                    }
                    className="h-6 px-2 text-[11px] text-orange-400 hover:text-orange-300"
                  >
                    <GitBranch size={10} className="mr-1" /> Decompose
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveToBacklog(task.id)}
                    className="h-6 px-2 text-[11px] text-zinc-400 hover:text-zinc-300"
                  >
                    <ArrowRightLeft size={10} className="mr-1" /> To Backlog
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                    className="h-6 px-2 text-[11px] text-rose-400 hover:text-rose-300 ml-auto"
                  >
                    <Trash2 size={10} className="mr-1" /> Delete
                  </Button>
                </div>

                {decomposingTaskId === task.id && (
                  <div className="mt-2 p-2.5 rounded-lg bg-black/30 border border-white/5 flex flex-col gap-2">
                    <label className="text-[9px] font-mono text-orange-400">
                      Create a smaller physical subtask (atom):
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={subtaskTitle}
                        onChange={(e) => setSubtaskTitle(e.target.value)}
                        placeholder="e.g. Find password for cabinet..."
                        className="text-xs h-7 flex-1"
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleDecompose(task)}
                        disabled={!subtaskTitle.trim() || isPending}
                        className="h-7"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Column 2: Reflection & written conclusions */}
      <div className="glass-card p-5 bg-black/15 border border-white/[0.04] rounded-2xl flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          {renderChecklistHeader()}
          <div className="flex flex-col gap-2">{renderChecklistItems()}</div>
        </div>

        {activeSprint && weekNum ? (
          <div className="flex flex-col gap-4 border-t border-white/[0.06] pt-4">
            <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <MessageSquareQuote size={14} className="text-accent" />
              Written Conclusions ({currentReview ? "Edit" : "Create"})
            </h4>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                <span>Week Score</span>
                <span className="text-accent font-bold text-sm">{score}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full accent-accent h-1.5 rounded bg-black/35 cursor-pointer"
              />
            </div>

            {(summary.wins.length > 0 || summary.improvements.length > 0) && (
              <div className="bg-white/[0.01] border border-white/[0.04] rounded-xl p-3 flex flex-col gap-2 text-xs">
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wide">
                  📌 Material from Journal for the Week:
                </span>
                {summary.wins.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-emerald-400 font-medium text-[10px]">Wins:</span>
                    <ul className="list-disc list-inside text-zinc-400 pl-1 space-y-0.5 max-h-20 overflow-y-auto">
                      {summary.wins.map((w, idx) => (
                        <li key={idx} className="truncate">
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.improvements.length > 0 && (
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-amber-400 font-medium text-[10px]">
                      Needs Improvement:
                    </span>
                    <ul className="list-disc list-inside text-zinc-400 pl-1 space-y-0.5 max-h-20 overflow-y-auto">
                      {summary.improvements.map((imp, idx) => (
                        <li key={idx} className="truncate">
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                1. Your wins and achievements (Wins)
              </label>
              <Textarea
                value={wins}
                onChange={(e) => setWins(e.target.value)}
                placeholder="What went well? What are you proud of?.."
                rows={2}
                className="text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                2. Main challenges and obstacles (Challenges)
              </label>
              <Textarea
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                placeholder="What blocked you? Where did the system fail?.."
                rows={2}
                className="text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                3. Kaizen adjustments for the future (Adjustments)
              </label>
              <Textarea
                value={adjustments}
                onChange={(e) => setAdjustments(e.target.value)}
                placeholder={
                  weekNum === 12
                    ? "What global conclusions will you apply next Sprint? What one rule will you implement?.."
                    : "What will you adjust next week to ease processes? How to slice steps?.."
                }
                rows={2}
                className="text-xs"
              />
            </div>

            {/* Kaizen Vector Section */}
            <div className="border-t border-white/[0.06] pt-4 mt-2">
              <button
                type="button"
                onClick={() => setIsVectorExpanded((v) => !v)}
                className="flex items-center justify-between w-full text-left py-2 hover:bg-white/[0.02] rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Compass size={14} className="text-zinc-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                    Systemic Upgrades (Kaizen Vector)
                  </span>
                  {Object.values(kaizenVector || {}).filter(Boolean).length > 0 && (
                    <span className="text-[10px] bg-accent/15 text-accent px-1.5 py-0.5 rounded-full font-mono">
                      {Object.values(kaizenVector || {}).filter(Boolean).length}/7
                    </span>
                  )}
                </div>
                {isVectorExpanded ? (
                  <ChevronUp size={14} className="text-zinc-500" />
                ) : (
                  <ChevronDown size={14} className="text-zinc-500" />
                )}
              </button>

              {isVectorExpanded && (
                <div className="grid grid-cols-1 gap-4 mt-4 bg-white/[0.01] border border-white/[0.04] p-4 rounded-xl">
                  {VECTOR_PROMPTS.map(({ key, icon: Icon, label, placeholder }) => {
                    const value = kaizenVector ? kaizenVector[key] : null;
                    const hasValue = !!value;
                    const labelClass = `text-[11px] font-mono ${hasValue ? "text-accent font-semibold" : "text-zinc-500"}`;

                    return (
                      <div key={key} className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <Icon size={12} className={hasValue ? "text-accent" : "text-zinc-500"} />
                          <label className={labelClass}>{label}</label>
                        </div>
                        <Textarea
                          value={value ?? ""}
                          onChange={(e) =>
                            setKaizenVector((prev: DailyVector) => ({
                              ...(prev || {}),
                              [key]: e.target.value || null,
                            }))
                          }
                          placeholder={placeholder}
                          rows={2}
                          className="text-xs"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSaveReview}
              disabled={isPending}
              className="mt-2 flex items-center justify-center gap-1.5"
            >
              <Save size={14} />
              {currentReview ? "Update conclusions" : "Save conclusions"}{" "}
              {weekNum ? `for week ${weekNum}` : ""}
            </Button>
          </div>
        ) : (
          <div className="text-zinc-500 text-xs italic py-8 text-center border-t border-white/[0.06] mt-4">
            No active sprint found for this period to write conclusions.
          </div>
        )}
      </div>
    </div>
  );
}
