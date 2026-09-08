"use client";

import { useState, useTransition, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, CheckCircle2, ChevronRight, AlertTriangle, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { DatePicker } from "@/components/ui/inputs/date-picker";
import {
  quickCaptureAction,
  routeThoughtAction,
  decomposeThoughtAction,
  upsertThoughtAction,
  deleteThoughtAction,
} from "@/features/life/actions/thought-actions";
import {
  assignProjectToObjectiveAction,
  createSprintObjectiveAction,
  deleteProjectAction,
  updateProjectAction,
  updateProjectStatusAction,
  updateSprintDatesAction,
} from "@/features/life/actions/sprint-actions";
import { upsertTaskAction, deleteTaskAction } from "@/features/life/actions/task-actions";
import type { LifeSphereData } from "@/features/life/types";
import { THOUGHT_TYPE_CONFIGS, type ThoughtType } from "@/features/life/logic/thought-types";
import { ThoughtDetailDialog } from "@/features/life/components/thoughts/ThoughtDetailDialog";
import { ConfirmationDialog, Dialog } from "@/components/ui/overlays/dialog";
import {
  format,
  addWeeks,
  startOfWeek,
  addDays,
  endOfWeek,
  isSameWeek,
  isToday,
  isSameDay,
} from "date-fns";
import type { TaskCreateFormData } from "./TaskCreateForm";
import { useConfirmDialog } from "@/lib/hooks/use-confirm-dialog";
import { StepIntro } from "./steps/StepIntro";
import { StepBrainDump } from "./steps/StepBrainDump";
import { StepPrimeFilter } from "./steps/StepPrimeFilter";
import { StepDecomposition } from "./steps/StepDecomposition";
import { StepSprintObjectives } from "./steps/StepSprintObjectives";
import { StepDeconstruction } from "./steps/StepDeconstruction";
import { StepWeeklyKanban } from "./steps/StepWeeklyKanban";
import type { ThoughtItem, SprintTask, SprintProject, SprintObjective, SprintData } from "./types";

const FILTER_TYPE_ICONS: Record<string, LucideIcon> = {
  AlertTriangle,
  Sparkles,
  CheckCircle2,
};

interface PlanningWizardClientProps {
  initialThoughts: ThoughtItem[];
  spheres: LifeSphereData[];
  activeSprint: SprintData;
  initialBacklogProjects: SprintProject[];
  initialColumns: Record<string, unknown>;
  initialStandaloneAtoms?: SprintTask[];
  dailyResistanceBudget?: number;
  missionContent?: string | null;
}

export function PlanningWizardClient({
  initialThoughts,
  spheres,
  activeSprint,
  initialBacklogProjects,
  initialColumns: _initialColumns,
  initialStandaloneAtoms,
  dailyResistanceBudget = 8,
  missionContent,
}: PlanningWizardClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("planning-wizard-step");
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (parsed >= 0 && parsed <= 6) return parsed;
      }
    }
    return 0; // 0: Intro, 1: Brain Dump, 2: Filter, 3: Decompose, 4: Sprint Goals, 5: Project Deconstruct, 6: Distribute
  });
  const [thoughts, setThoughts] = useState<ThoughtItem[]>(initialThoughts || []);
  const [sprint, setSprint] = useState<SprintData>({
    ...activeSprint,
    objectives: activeSprint?.objectives || [],
  } as SprintData);
  const [backlogProjects, setBacklogProjects] = useState<SprintProject[]>(
    initialBacklogProjects || [],
  );
  const [standaloneAtoms, setStandaloneAtoms] = useState<SprintTask[]>(
    initialStandaloneAtoms || [],
  );

  // Step 4 state
  const [newObjectiveTitle, setNewObjectiveTitle] = useState("");
  const [newObjectiveSphereId, setNewObjectiveSphereId] = useState(spheres?.[0]?.id || "");
  const [newObjectiveDesc, setNewObjectiveDesc] = useState("");
  const [showAddObjectiveForm, setShowAddObjectiveForm] = useState(false);
  const [backlogSearch, setBacklogSearch] = useState("");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjectTitle, setEditProjectTitle] = useState("");
  const [editProjectDesc, setEditProjectDesc] = useState("");
  const deleteProjectId = useConfirmDialog<string>();
  const deleteTaskId = useConfirmDialog<string>();

  // Step 5 state
  const activeSprintProjects = useMemo(() => {
    const objectives = sprint?.objectives || [];
    return objectives.flatMap((obj: SprintObjective) => obj.projects || []);
  }, [sprint]);
  const [selectedDeconstructProjectId, setSelectedDeconstructProjectId] = useState<string | null>(
    null,
  );

  // Set default selected project when entering Step 5
  useEffect(() => {
    if (step === 5 && !selectedDeconstructProjectId && activeSprintProjects.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedDeconstructProjectId(activeSprintProjects[0].id);
    }
  }, [step, activeSprintProjects, selectedDeconstructProjectId]);

  const selectedDeconstructProject = useMemo(() => {
    return (
      activeSprintProjects.find((p: SprintProject) => p.id === selectedDeconstructProjectId) || null
    );
  }, [activeSprintProjects, selectedDeconstructProjectId]);

  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDesc, setEditTaskDesc] = useState("");
  const [editTaskResistance, setEditTaskResistance] = useState(3);
  const [editTaskMode, setEditTaskMode] = useState<"group" | "atom">("atom");
  const [editTaskHasChildren, setEditTaskHasChildren] = useState(false);

  // Step 6 state
  const [sprintStartDate, _setSprintStartDate] = useState(
    sprint?.startDate ? format(new Date(sprint.startDate), "yyyy-MM-dd") : "",
  );
  const [schedulingTaskId, setSchedulingTaskId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(() => {
    if (!activeSprint?.startDate) return 0;
    const start = new Date(activeSprint.startDate);
    if (isNaN(start.getTime())) return 0;
    const startOfWeekDate = startOfWeek(start, { weekStartsOn: 1 });
    const today = new Date();
    const todayStartOfWeek = startOfWeek(today, { weekStartsOn: 1 });
    const differenceMilliseconds = todayStartOfWeek.getTime() - startOfWeekDate.getTime();
    const differenceWeeks = Math.round(differenceMilliseconds / (7 * 24 * 60 * 60 * 1000));
    return Math.max(0, Math.min(11, differenceWeeks));
  });
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [batchScheduleAtomIds, setBatchScheduleAtomIds] = useState<string[] | null>(null);
  const [batchScheduleDate, setBatchScheduleDate] = useState("");

  const toggleProjectCollapse = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };
  const toggleGroupCollapse = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  // Step 1: Brain Dump state
  const [newThoughtText, setNewThoughtText] = useState("");
  const [showDetailedFields, setShowDetailedFields] = useState(false);
  const [newThoughtSphereId, setNewThoughtSphereId] = useState<string | null>(null);
  const [newThoughtType, setNewThoughtType] = useState<ThoughtType | null>(null);
  const [newThoughtTemplateData, setNewThoughtTemplateData] = useState<Record<
    string,
    string
  > | null>(null);
  const [editingThought, setEditingThought] = useState<ThoughtItem | null>(null);
  const [activeFilterSphereId, setActiveFilterSphereId] = useState<string | null>(null);
  const [isGroupedBySphere, setIsGroupedBySphere] = useState(false);
  const [isActionPending, startActionTransition] = useTransition();
  const [_isSavePending, startSaveTransition] = useTransition();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const deleteThoughtId = useConfirmDialog<string>();

  useEffect(() => {
    localStorage.setItem("planning-wizard-step", String(step));
  }, [step]);

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

  // Collect all atoms from projects + standalone for Step 6
  const allAtomsForDistribution = useMemo(() => {
    const seen = new Set<string>();
    const atoms: (SprintTask & { projectName?: string; groupName?: string })[] = [];

    // Atoms from projects (both standalone and inside groups)
    for (const project of activeSprintProjects) {
      for (const task of (project.tasks || []).filter((task) => !task.parentId)) {
        if (task.resistance !== null && !seen.has(task.id)) {
          seen.add(task.id);
          atoms.push({ ...task, projectName: project.title });
        }
        for (const child of task.children || []) {
          if (!seen.has(child.id)) {
            seen.add(child.id);
            atoms.push({ ...child, projectName: project.title, groupName: task.title });
          }
        }
      }
    }

    // Standalone atoms (skip if already included via a project)
    for (const atom of standaloneAtoms) {
      if (!seen.has(atom.id)) {
        seen.add(atom.id);
        atoms.push({ ...atom });
      }
    }

    return atoms;
  }, [activeSprintProjects, standaloneAtoms]);

  const isPendingAtom = (atom: SprintTask) =>
    !atom.plannedDate && atom.status !== "DONE" && atom.status !== "CANCELLED";

  // Daily resistance budget: sum of all atom resistance values on a single day.
  // Each atom has resistance 0-5, and the daily budget guides sustainable load.
  const DAILY_RESISTANCE_BUDGET = dailyResistanceBudget;

  const atomResistanceForDate = (dateStr: string): number => {
    const date = new Date(dateStr);
    return allAtomsForDistribution
      .filter((atom) => {
        if (atom.status === "CANCELLED") return false;
        if (atom.id === schedulingTaskId) return false;
        if (batchScheduleAtomIds?.includes(atom.id)) return false;
        return atom.plannedDate ? isSameDay(new Date(atom.plannedDate), date) : false;
      })
      .reduce((sum, atom) => sum + (atom.resistance ?? 0), 0);
  };

  const atomCountForDate = (dateStr: string): number => {
    const date = new Date(dateStr);
    return allAtomsForDistribution.filter((atom) => {
      if (atom.status === "CANCELLED") return false;
      if (atom.id === schedulingTaskId) return false;
      if (batchScheduleAtomIds?.includes(atom.id)) return false;
      return atom.plannedDate ? isSameDay(new Date(atom.plannedDate), date) : false;
    }).length;
  };

  // Step 6 week navigation
  const sprintStart = useMemo(() => {
    if (!sprint?.startDate) return null;
    const d = new Date(sprint.startDate);
    return isNaN(d.getTime()) ? null : startOfWeek(d, { weekStartsOn: 1 });
  }, [sprint]);
  const weekStart = useMemo(
    () => (sprintStart ? addDays(sprintStart, selectedWeekIndex * 7) : null),
    [sprintStart, selectedWeekIndex],
  );
  const sprintWeeks = useMemo(() => {
    if (!sprintStart) return [];
    return Array.from({ length: 12 }, (_, i) => {
      const start = addDays(sprintStart, i * 7);
      const end = endOfWeek(start, { weekStartsOn: 1 });
      return {
        index: i,
        label: `W${i + 1}`,
        dateRange: `${format(start, "dd.MM")} - ${format(end, "dd.MM")}`,
      };
    });
  }, [sprintStart]);
  const overdueScheduledAtoms = useMemo(() => {
    if (!weekStart) return [];
    return allAtomsForDistribution.filter((atom) => {
      if (!atom.plannedDate) return false;
      if (atom.status === "DONE" || atom.status === "CANCELLED") return false;
      const planned = new Date(atom.plannedDate);
      return planned < weekStart && !isSameWeek(planned, weekStart, { weekStartsOn: 1 });
    });
  }, [allAtomsForDistribution, weekStart]);

  // Step 2: Filter states
  const inboxThoughts = useMemo(() => {
    const baseThoughts = thoughts.filter((currentThought) => {
      const lowerName = currentThought.status.name.toLowerCase();
      return (
        lowerName === "inbox" ||
        lowerName === "інбокс" ||
        lowerName === "беклог" ||
        lowerName === "backlog" ||
        lowerName === "вхідні"
      );
    });
    if (!activeFilterSphereId) return baseThoughts;
    return baseThoughts.filter(
      (currentThought) => currentThought.sphereId === activeFilterSphereId,
    );
  }, [thoughts, activeFilterSphereId]);
  const [filterIndex, setFilterIndex] = useState(0);
  const [initialFilterCount, setInitialFilterCount] = useState<number | null>(null);
  const [filterStage, setFilterStage] = useState<"q1" | "q1b" | "q_conflict" | "q2" | "q3">("q1");
  const [filterStageHistory, setFilterStageHistory] = useState<
    ("q1" | "q1b" | "q_conflict" | "q2" | "q3")[]
  >([]);
  const [wantType, setWantType] = useState<"want" | "must" | null>(null);

  // Accepted thoughts shown as reference context for the "does this conflict
  // with something I already committed to?" step (same statuses as the
  // decomposition pickup, but unfiltered by sphere).
  const activeThoughts = useMemo(
    () =>
      thoughts.filter(
        (currentThought) =>
          currentThought.status.name === "Хочу" ||
          currentThought.status.name === "Повинен" ||
          currentThought.status.name === "Want" ||
          currentThought.status.name === "Must",
      ),
    [thoughts],
  );

  // Step 3: Decompose states
  const decomposableThoughts = useMemo(() => {
    const baseThoughts = thoughts.filter(
      (currentThought) =>
        currentThought.status.name === "Хочу" ||
        currentThought.status.name === "Повинен" ||
        currentThought.status.name === "Want" ||
        currentThought.status.name === "Must",
    );
    if (!activeFilterSphereId) return baseThoughts;
    return baseThoughts.filter(
      (currentThought) => currentThought.sphereId === activeFilterSphereId,
    );
  }, [thoughts, activeFilterSphereId]);
  const [decomposeIndex, setDecomposeIndex] = useState(0);

  const getQuestionStep = () => {
    switch (filterStage) {
      case "q1":
      case "q1b":
        return 1;
      case "q_conflict":
        return 2;
      case "q2":
        return 3;
      case "q3":
        return 4;
      default:
        return 1;
    }
  };

  // Decomposition Form states
  const [decomposeType, setDecomposeType] = useState<"task" | "project">("task");
  // Task fields
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  // Project fields
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");

  const [selectedSphereId, setSelectedSphereId] = useState<string>(spheres?.[0]?.id || "");
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
              : currentThought,
          ),
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
        const existingStatusName =
          thoughts.find((currentThought) => currentThought.statusId === result.data.statusId)
            ?.status.name || "Inbox";

        const newThought: ThoughtItem = {
          id: result.data.id,
          content: result.data.content,
          statusId: result.data.statusId,
          status: {
            id: result.data.statusId,
            name: existingStatusName,
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilterIndex(inboxThoughts.length - 1);
    }
  }, [inboxThoughts.length, filterIndex]);

  useEffect(() => {
    if (decomposeIndex >= decomposableThoughts.length && decomposableThoughts.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDecomposeIndex(decomposableThoughts.length - 1);
    }
  }, [decomposableThoughts.length, decomposeIndex]);

  useEffect(() => {
    if (step === 2) {
      if (initialFilterCount === null || initialFilterCount < inboxThoughts.length) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setInitialFilterCount(inboxThoughts.length);
      }
    } else {
      setInitialFilterCount(null);
    }
  }, [step, inboxThoughts.length, initialFilterCount]);

  const currentFilterThoughtId = inboxThoughts[filterIndex]?.id;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilterStage("q1");
    setFilterStageHistory([]);
    setWantType(null);
  }, [currentFilterThoughtId]);

  const saveThought = (
    thoughtId: string,
    finalSphereId: string | null,
    finalType: ThoughtType | null,
    finalTemplateData: Record<string, string> | null,
  ) => {
    startSaveTransition(async () => {
      await upsertThoughtAction({
        id: thoughtId,
        content: thoughts.find((t) => t.id === thoughtId)?.content || "",
        sphereId: finalSphereId,
        type: finalType,
        templateData: finalTemplateData,
      });
    });
  };

  const handleFilterThought = (
    thoughtId: string,
    outcome: "KEEP_WANT" | "KEEP_MUST" | "NOT_MINE" | "SOMEDAY",
  ) => {
    const previousThoughts = [...thoughts];
    const isLastThought = inboxThoughts.length <= 1;

    const statusNameMap = {
      KEEP_WANT: "Want",
      KEEP_MUST: "Must",
      NOT_MINE: "Basket",
      SOMEDAY: "Someday",
    };

    // Optimistically update status name
    setThoughts((previousThoughtsState) =>
      previousThoughtsState.map((currentThought) =>
        currentThought.id === thoughtId
          ? {
              ...currentThought,
              status: { ...currentThought.status, name: statusNameMap[outcome] },
            }
          : currentThought,
      ),
    );

    startActionTransition(async () => {
      const result = await routeThoughtAction(thoughtId, outcome);
      if (result.success) {
        toast.success("Thought filtered");
        if (isLastThought) {
          toast.success("All thoughts from Inbox filtered!");
        }
      } else {
        // Rollback on failure
        setThoughts(previousThoughts);
        toast.error(result.error || "Failed to filter thought");
      }
    });
  };

  const handleDeleteThought = (thoughtId: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    const previousThoughts = [...thoughts];

    // Optimistically remove the deleted thought
    setThoughts((previousThoughtsState) =>
      previousThoughtsState.filter((currentThought) => currentThought.id !== thoughtId),
    );

    startActionTransition(async () => {
      const result = await deleteThoughtAction(thoughtId);
      if (result.success) {
        toast.success("Thought deleted successfully!");
      } else {
        // Rollback on failure
        setThoughts(previousThoughts);
        toast.error(result.error || "Failed to delete thought");
      }
    });
  };

  // Run decomposition
  const handleDecompose = (thoughtId: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    const isProject = decomposeType === "project";
    const title = isProject ? projectTitle.trim() : taskTitle.trim();
    if (!title) return;

    const previousThoughts = [...thoughts];

    // Optimistically remove the decomposed thought
    setThoughts((previousThoughtsState) =>
      previousThoughtsState.filter((currentThought) => currentThought.id !== thoughtId),
    );

    // Reset form states immediately
    setTaskTitle("");
    setTaskDesc("");
    setProjectTitle("");
    setProjectDesc("");
    setResistance(3);

    startActionTransition(async () => {
      const result = await decomposeThoughtAction({
        thoughtId,
        type: decomposeType,
        projectTitle: isProject ? title : undefined,
        description: isProject ? projectDesc : taskDesc,
        atomTitle: isProject ? undefined : title,
        atomDescription: undefined,
        sphereId: selectedSphereId,
        priority: "MEDIUM",
        resistance: isProject ? undefined : resistance,
      });

      if (result.success) {
        toast.success(isProject ? "Project created successfully!" : "Atom created successfully!");
        if (isProject && result.data?.project) {
          // Add project to backlog state
          setBacklogProjects((prev) => [result.data.project as unknown as SprintProject, ...prev]);
        }
      } else {
        // Rollback on failure
        setThoughts(previousThoughts);
        toast.error(result.error || "Error during decomposition");
      }
    });
  };

  // Step 4 Handlers
  const handleCreateObjective = () => {
    const title = newObjectiveTitle.trim();
    if (!title || !sprint) return;

    startActionTransition(async () => {
      const result = await createSprintObjectiveAction(
        sprint.id,
        title,
        newObjectiveSphereId,
        newObjectiveDesc,
      );
      if (result.success) {
        toast.success("Objective created successfully!");
        setNewObjectiveTitle("");
        setNewObjectiveDesc("");
        setShowAddObjectiveForm(false);
        const newObj = {
          ...result.data,
          sphere: spheres.find((s) => s.id === newObjectiveSphereId) ?? null,
          projects: [],
        };
        setSprint((prev: SprintData) => ({
          ...prev,
          objectives: [...(prev?.objectives || []), newObj],
        }));
      } else {
        toast.error(result.error || "Failed to create objective");
      }
    });
  };

  const handleAssignProject = (projectId: string, objectiveId: string | null) => {
    startActionTransition(async () => {
      const result = await assignProjectToObjectiveAction(projectId, objectiveId);
      if (result.success) {
        toast.success(objectiveId ? "Project assigned to objective!" : "Project moved to backlog!");

        let projectToMove: SprintProject | null = null;

        const backlogIndex = backlogProjects.findIndex((p) => p.id === projectId);
        if (backlogIndex !== -1) {
          projectToMove = backlogProjects[backlogIndex];
        } else {
          for (const obj of sprint.objectives) {
            const idx = obj.projects.findIndex((p: SprintProject) => p.id === projectId);
            if (idx !== -1) {
              projectToMove = obj.projects[idx];
              break;
            }
          }
        }

        if (!projectToMove) return;

        const updatedProject = {
          ...projectToMove,
          objectiveId: objectiveId,
          tasks: projectToMove.tasks || [],
        };

        setBacklogProjects((prev) => prev.filter((p) => p.id !== projectId));
        setSprint((prev: SprintData) => ({
          ...prev,
          objectives: prev.objectives.map((obj: SprintObjective) => ({
            ...obj,
            projects: obj.projects.filter((p: SprintProject) => p.id !== projectId),
          })),
        }));

        if (objectiveId === null) {
          setBacklogProjects((prev) => [updatedProject, ...prev]);
        } else {
          setSprint((prev: SprintData) => ({
            ...prev,
            objectives: prev.objectives.map((obj: SprintObjective) => {
              if (obj.id === objectiveId) {
                return {
                  ...obj,
                  projects: [...obj.projects, updatedProject],
                };
              }
              return obj;
            }),
          }));
        }
      } else {
        toast.error(result.error || "Failed to assign project");
      }
    });
  };

  const handleEditProject = () => {
    const title = editProjectTitle.trim();
    if (!title || !editingProjectId) return;

    startActionTransition(async () => {
      const result = await updateProjectAction(
        editingProjectId,
        title,
        editProjectDesc.trim() || undefined,
      );
      if (result.success) {
        toast.success("Project updated!");
        setEditingProjectId(null);

        const updateInList = (projects: SprintProject[]) =>
          projects.map((p: SprintProject) =>
            p.id === editingProjectId
              ? { ...p, title, description: editProjectDesc.trim() || null }
              : p,
          );

        setSprint((prev: SprintData) => ({
          ...prev,
          objectives: prev.objectives.map((obj: SprintObjective) => ({
            ...obj,
            projects: updateInList(obj.projects),
          })),
        }));
        setBacklogProjects((prev) => updateInList(prev));
      } else {
        toast.error(result.error || "Failed to update project");
      }
    });
  };

  const handleDeleteProject = (projectId: string) => {
    startActionTransition(async () => {
      const result = await deleteProjectAction(projectId);
      if (result.success) {
        toast.success("Project deleted!");
        deleteProjectId.close();

        setSprint((prev: SprintData) => ({
          ...prev,
          objectives: prev.objectives.map((obj: SprintObjective) => ({
            ...obj,
            projects: obj.projects.filter((p: SprintProject) => p.id !== projectId),
          })),
        }));
        setBacklogProjects((prev) => prev.filter((p) => p.id !== projectId));

        if (selectedDeconstructProjectId === projectId) {
          setSelectedDeconstructProjectId(null);
        }
      } else {
        toast.error(result.error || "Failed to delete project");
      }
    });
  };

  const handleOpenEditProject = (project: {
    id: string;
    title: string;
    description?: string | null;
  }) => {
    setEditingProjectId(project.id);
    setEditProjectTitle(project.title);
    setEditProjectDesc(project.description || "");
  };

  // Step 5 Handlers
  const handleAddTopLevelTask = (data: TaskCreateFormData) => {
    const title = data.title.trim();
    if (!title || !data.projectId || !sprint) return;
    const isGroup = data.mode === "group";

    startActionTransition(async () => {
      let sphereId: string | null = null;
      for (const obj of sprint.objectives) {
        if (obj.projects.some((p: SprintProject) => p.id === data.projectId)) {
          sphereId = obj.sphereId;
          break;
        }
      }

      const result = await upsertTaskAction({
        title,
        description: data.description.trim() || null,
        projectId: data.projectId,
        sphereId,
        status: "TODO",
        priority: "MEDIUM",
        resistance: isGroup ? null : data.resistance,
        parentId: isGroup ? null : data.groupId || null,
      });

      if (result.success) {
        toast.success(isGroup ? "Group created!" : "Atom created!");

        const newTask = result.data;
        setSprint((prev: SprintData) => ({
          ...prev,
          objectives: prev.objectives.map((obj: SprintObjective) => ({
            ...obj,
            projects: obj.projects.map((p: SprintProject) => {
              if (p.id === data.projectId) {
                if (data.groupId) {
                  return {
                    ...p,
                    tasks: (p.tasks || []).map((t: SprintTask) => {
                      if (t.id === data.groupId) {
                        return { ...t, children: [...(t.children || []), newTask] };
                      }
                      return t;
                    }),
                  };
                }
                return {
                  ...p,
                  tasks: [...(p.tasks || []), newTask],
                };
              }
              return p;
            }),
          })),
        }));
      } else {
        toast.error(result.error || "Failed to create");
      }
    });
  };

  const handleMarkProjectPlanned = (projectId: string) => {
    if (!sprint) return;
    const project = activeSprintProjects.find((p: SprintProject) => p.id === projectId);
    if (!project) return;
    const newStatus = project.status === "DONE" ? "TODO" : "DONE";

    startActionTransition(async () => {
      const result = await updateProjectStatusAction(projectId, newStatus);
      if (result.success) {
        toast.success(newStatus === "DONE" ? "Project marked as planned!" : "Project unmarked");
        setSprint((prev: SprintData) => ({
          ...prev,
          objectives: prev.objectives.map((obj: SprintObjective) => ({
            ...obj,
            projects: obj.projects.map((p: SprintProject) =>
              p.id === projectId ? { ...p, status: newStatus } : p,
            ),
          })),
        }));
      } else {
        toast.error(result.error || "Failed to update project");
      }
    });
  };

  const handleOpenEditTask = (task: SprintTask, mode: "group" | "atom") => {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskDesc(task.description || "");
    setEditTaskResistance(task.resistance || 3);
    setEditTaskMode(mode);
    setEditTaskHasChildren((task.children || []).length > 0);
  };

  const handleEditTask = () => {
    const title = editTaskTitle.trim();
    if (!title || !editingTaskId || !sprint) return;

    startActionTransition(async () => {
      const result = await upsertTaskAction({
        id: editingTaskId,
        title,
        description: editTaskDesc.trim() || null,
        resistance: editTaskMode === "atom" ? editTaskResistance : null,
      });

      if (result.success) {
        toast.success(editTaskMode === "group" ? "Group updated!" : "Atom updated!");
        setEditingTaskId(null);

        setSprint((prev: SprintData) => ({
          ...prev,
          objectives: prev.objectives.map((obj: SprintObjective) => ({
            ...obj,
            projects: obj.projects.map((p: SprintProject) => ({
              ...p,
              tasks: p.tasks.map((t: SprintTask) => {
                if (t.id === editingTaskId) {
                  return {
                    ...t,
                    title,
                    description: editTaskDesc.trim() || null,
                    resistance: editTaskMode === "atom" ? editTaskResistance : null,
                  };
                }
                return {
                  ...t,
                  children: (t.children || []).map((c: SprintTask) =>
                    c.id === editingTaskId
                      ? { ...c, title, description: editTaskDesc.trim() || null }
                      : c,
                  ),
                };
              }),
            })),
          })),
        }));
        setStandaloneAtoms((prev) =>
          prev.map((atom) =>
            atom.id === editingTaskId
              ? {
                  ...atom,
                  title,
                  description: editTaskDesc.trim() || null,
                  resistance: editTaskMode === "atom" ? editTaskResistance : null,
                }
              : atom,
          ),
        );
      } else {
        toast.error(result.error || "Failed to update");
      }
    });
  };

  const handleConvertTask = () => {
    if (!editingTaskId || !sprint) return;
    if (editTaskMode === "group" && editTaskHasChildren) {
      toast.error("Cannot convert a group that has atoms. Remove all atoms first.");
      return;
    }
    const newMode = editTaskMode === "group" ? "atom" : "group";
    const newResistance = newMode === "atom" ? editTaskResistance : null;

    startActionTransition(async () => {
      const result = await upsertTaskAction({
        id: editingTaskId,
        resistance: newResistance,
      });

      if (result.success) {
        setEditTaskMode(newMode);
        setEditTaskHasChildren(false);
        toast.success(newMode === "group" ? "Converted to Group" : "Converted to Atom");

        setSprint((prev: SprintData) => ({
          ...prev,
          objectives: prev.objectives.map((obj: SprintObjective) => ({
            ...obj,
            projects: obj.projects.map((p: SprintProject) => ({
              ...p,
              tasks: p.tasks.map((t: SprintTask) => {
                if (t.id === editingTaskId) {
                  return { ...t, resistance: newResistance };
                }
                return {
                  ...t,
                  children: (t.children || []).map((c: SprintTask) =>
                    c.id === editingTaskId ? { ...c, resistance: newResistance } : c,
                  ),
                };
              }),
            })),
          })),
        }));
        setStandaloneAtoms((prev) =>
          prev.map((atom) =>
            atom.id === editingTaskId ? { ...atom, resistance: newResistance } : atom,
          ),
        );
      } else {
        toast.error(result.error || "Failed to convert");
      }
    });
  };

  const handleDeleteTaskAnywhere = (taskId: string) => {
    startActionTransition(async () => {
      const result = await deleteTaskAction(taskId);
      if (result.success) {
        toast.success("Task deleted");
        setSprint((prev: SprintData) => {
          if (!prev || !prev.objectives) return prev;
          return {
            ...prev,
            objectives: prev.objectives.map((obj: SprintObjective) => ({
              ...obj,
              projects: (obj.projects || []).map((p: SprintProject) => ({
                ...p,
                tasks: (p.tasks || [])
                  .filter((t: SprintTask) => t.id !== taskId)
                  .map((t: SprintTask) => ({
                    ...t,
                    children: (t.children || []).filter((c: SprintTask) => c.id !== taskId),
                  })),
              })),
            })),
          };
        });
        setStandaloneAtoms((prev) => prev.filter((a) => a.id !== taskId));
      } else {
        toast.error(result.error || "Failed to delete task");
      }
    });
  };

  const handleOpenEditTaskFromAnywhere = (task: SprintTask) => {
    const isAtom = task.resistance !== null;
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskDesc(task.description || "");
    setEditTaskResistance(task.resistance ?? 3);
    setEditTaskMode(isAtom ? "atom" : "group");
    setEditTaskHasChildren((task.children || []).length > 0);
  };

  const _handleSaveSprintDates = () => {
    if (!sprintStartDate || !sprint) return;
    const start = new Date(sprintStartDate);
    const end = addWeeks(start, 12);
    startActionTransition(async () => {
      const result = await updateSprintDatesAction(
        sprint.id,
        start.toISOString(),
        end.toISOString(),
      );
      if (result.success) {
        toast.success("Sprint dates updated!");
        setSprint((prev: SprintData) => ({
          ...prev,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        }));
      } else {
        toast.error(result.error || "Failed to update sprint dates");
      }
    });
  };

  const handleScheduleTask = () => {
    if (!schedulingTaskId || !scheduleDate) return;
    startActionTransition(async () => {
      const result = await upsertTaskAction({
        id: schedulingTaskId,
        plannedDate: scheduleDate,
      });
      if (result.success) {
        toast.success("Task scheduled!");
        setSchedulingTaskId(null);
        setScheduleDate("");
        setSprint((prev: SprintData) => {
          if (!prev || !prev.objectives) return prev;
          return {
            ...prev,
            objectives: prev.objectives.map((obj: SprintObjective) => ({
              ...obj,
              projects: (obj.projects || []).map((p: SprintProject) => ({
                ...p,
                tasks: (p.tasks || []).map((t: SprintTask) => {
                  if (t.id === schedulingTaskId) {
                    return { ...t, plannedDate: scheduleDate };
                  }
                  return {
                    ...t,
                    children: (t.children || []).map((c: SprintTask) =>
                      c.id === schedulingTaskId ? { ...c, plannedDate: scheduleDate } : c,
                    ),
                  };
                }),
              })),
            })),
          };
        });
        setStandaloneAtoms((prev) =>
          prev.map((atom) =>
            atom.id === schedulingTaskId ? { ...atom, plannedDate: scheduleDate } : atom,
          ),
        );
      } else {
        toast.error(result.error || "Failed to schedule task");
      }
    });
  };

  const handleBatchScheduleTasks = () => {
    if (!batchScheduleAtomIds || batchScheduleAtomIds.length === 0 || !batchScheduleDate) return;
    const date = batchScheduleDate;
    const ids = batchScheduleAtomIds;

    startActionTransition(async () => {
      let successCount = 0;
      for (const atomId of ids) {
        const result = await upsertTaskAction({
          id: atomId,
          plannedDate: date,
        });
        if (result.success) successCount++;
      }

      if (successCount > 0) {
        toast.success(
          `Scheduled ${successCount} atom${successCount > 1 ? "s" : ""} for ${format(new Date(date), "dd.MM")}!`,
        );
        setBatchScheduleAtomIds(null);
        setBatchScheduleDate("");

        setSprint((prev: SprintData) => {
          if (!prev || !prev.objectives) return prev;
          return {
            ...prev,
            objectives: prev.objectives.map((obj: SprintObjective) => ({
              ...obj,
              projects: (obj.projects || []).map((p: SprintProject) => ({
                ...p,
                tasks: (p.tasks || []).map((t: SprintTask) => {
                  if (ids.includes(t.id)) {
                    return { ...t, plannedDate: date };
                  }
                  return {
                    ...t,
                    children: (t.children || []).map((c: SprintTask) =>
                      ids.includes(c.id) ? { ...c, plannedDate: date } : c,
                    ),
                  };
                }),
              })),
            })),
          };
        });
        setStandaloneAtoms((prev) =>
          prev.map((atom) => (ids.includes(atom.id) ? { ...atom, plannedDate: date } : atom)),
        );
      } else {
        toast.error("Failed to schedule atoms");
      }
    });
  };

  const currentDecomposeThought = decomposableThoughts[decomposeIndex];
  useEffect(() => {
    if (currentDecomposeThought) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTaskTitle(currentDecomposeThought.content);
      setProjectTitle(currentDecomposeThought.content);
      setSelectedSphereId(currentDecomposeThought.sphereId || "");
    }
  }, [currentDecomposeThought]);

  const currentFilterThought = inboxThoughts[filterIndex];
  const filterThoughtSphere = currentFilterThought
    ? spheres.find((currentSphere) => currentSphere.id === currentFilterThought.sphereId)
    : null;
  const filterThoughtTypeConfig = currentFilterThought?.type
    ? THOUGHT_TYPE_CONFIGS.find((config) => config.id === currentFilterThought.type)
    : null;
  const FilterThoughtIcon = filterThoughtTypeConfig
    ? FILTER_TYPE_ICONS[filterThoughtTypeConfig.icon]
    : null;

  const decomposeThoughtSphere = currentDecomposeThought
    ? spheres.find((currentSphere) => currentSphere.id === currentDecomposeThought.sphereId)
    : null;
  const decomposeThoughtTypeConfig = currentDecomposeThought?.type
    ? THOUGHT_TYPE_CONFIGS.find((config) => config.id === currentDecomposeThought.type)
    : null;
  const DecomposeThoughtIcon = decomposeThoughtTypeConfig
    ? FILTER_TYPE_ICONS[decomposeThoughtTypeConfig.icon]
    : null;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Step Indicator */}
      {step > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/[0.06] pb-4 gap-3">
          <div className="flex flex-wrap items-center gap-1.5 md:gap-3 text-xs font-mono text-zinc-500">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`hover:text-zinc-200 transition-colors duration-150 ${
                step === 1 ? "text-accent font-bold" : thoughts.length > 0 ? "text-zinc-300" : ""
              }`}
            >
              1. BRAIN DUMP
            </button>
            <ChevronRight size={10} />
            <button
              type="button"
              onClick={() => setStep(2)}
              className={`hover:text-zinc-200 transition-colors duration-150 ${
                step === 2
                  ? "text-accent font-bold"
                  : inboxThoughts.length === 0
                    ? "text-zinc-300"
                    : ""
              }`}
            >
              2. PRIME FILTER
            </button>
            <ChevronRight size={10} />
            <button
              type="button"
              onClick={() => setStep(3)}
              className={`hover:text-zinc-200 transition-colors duration-150 ${
                step === 3
                  ? "text-accent font-bold"
                  : decomposableThoughts.length === 0
                    ? "text-zinc-300"
                    : ""
              }`}
            >
              3. DECOMPOSITION
            </button>
            <ChevronRight size={10} />
            <button
              type="button"
              onClick={() => setStep(4)}
              className={`hover:text-zinc-200 transition-colors duration-150 ${
                step === 4 ? "text-accent font-bold" : "text-zinc-300"
              }`}
            >
              4. SPRINT PROJECTS
            </button>
            <ChevronRight size={10} />
            <button
              type="button"
              onClick={() => setStep(5)}
              className={`hover:text-zinc-200 transition-colors duration-150 ${
                step === 5 ? "text-accent font-bold" : "text-zinc-300"
              }`}
            >
              5. DECONSTRUCTION
            </button>
            <ChevronRight size={10} />
            <button
              type="button"
              onClick={() => setStep(6)}
              className={`hover:text-zinc-200 transition-colors duration-150 ${
                step === 6 ? "text-accent font-bold" : "text-zinc-300"
              }`}
            >
              6. DISTRIBUTE
            </button>
          </div>

          <div className="flex items-center gap-3">
            {activeFilterSphereId && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-mono text-accent uppercase tracking-wider">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                  style={{
                    backgroundColor: spheres.find(
                      (currentSphere) => currentSphere.id === activeFilterSphereId,
                    )?.color,
                  }}
                />
                <span>
                  Context:{" "}
                  {spheres.find((currentSphere) => currentSphere.id === activeFilterSphereId)?.name}
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
      {step === 0 && <StepIntro setStep={setStep} />}

      {/* STEP 1: BRAIN DUMP */}
      {step === 1 && (
        <StepBrainDump
          spheres={spheres}
          thoughts={thoughts}
          displayedThoughts={displayedThoughts}
          groupedThoughts={groupedThoughts}
          isGroupedBySphere={isGroupedBySphere}
          setIsGroupedBySphere={setIsGroupedBySphere}
          activeFilterSphereId={activeFilterSphereId}
          setActiveFilterSphereId={setActiveFilterSphereId}
          newThoughtText={newThoughtText}
          setNewThoughtText={setNewThoughtText}
          newThoughtSphereId={newThoughtSphereId}
          setNewThoughtSphereId={setNewThoughtSphereId}
          newThoughtType={newThoughtType}
          newThoughtTemplateData={newThoughtTemplateData}
          handleDetailedFieldsChange={handleDetailedFieldsChange}
          showDetailedFields={showDetailedFields}
          setShowDetailedFields={setShowDetailedFields}
          handleAddThought={handleAddThought}
          isActionPending={isActionPending}
          handleEditClick={handleEditClick}
          inboxThoughts={inboxThoughts}
          setStep={setStep}
        />
      )}

      {/* STEP 2: PRIME FILTER */}
      {step === 2 && (
        <StepPrimeFilter
          inboxThoughts={inboxThoughts}
          decomposableThoughts={decomposableThoughts}
          initialFilterCount={initialFilterCount}
          currentFilterThought={currentFilterThought}
          filterThoughtSphere={filterThoughtSphere}
          filterThoughtTypeConfig={filterThoughtTypeConfig}
          FilterThoughtIcon={FilterThoughtIcon}
          handleEditClick={handleEditClick}
          filterStage={filterStage}
          getQuestionStep={getQuestionStep}
          setWantType={setWantType}
          wantType={wantType}
          setFilterStageHistory={setFilterStageHistory}
          filterStageHistory={filterStageHistory}
          setFilterStage={setFilterStage}
          handleFilterThought={handleFilterThought}
          filterIndex={filterIndex}
          setFilterIndex={setFilterIndex}
          setStep={setStep}
          missionContent={missionContent}
          activeThoughts={activeThoughts}
        />
      )}

      {/* STEP 3: DECOMPOSITION */}
      {step === 3 && (
        <StepDecomposition
          decomposableThoughts={decomposableThoughts}
          currentDecomposeThought={currentDecomposeThought}
          decomposeIndex={decomposeIndex}
          setDecomposeIndex={setDecomposeIndex}
          decomposeThoughtSphere={decomposeThoughtSphere}
          decomposeThoughtTypeConfig={decomposeThoughtTypeConfig}
          DecomposeThoughtIcon={DecomposeThoughtIcon}
          handleEditClick={handleEditClick}
          setDeleteThoughtId={deleteThoughtId.open}
          isActionPending={isActionPending}
          startActionTransition={startActionTransition}
          router={router}
          setStep={setStep}
          decomposeType={decomposeType}
          setDecomposeType={setDecomposeType}
          spheres={spheres}
          selectedSphereId={selectedSphereId}
          setSelectedSphereId={setSelectedSphereId}
          setThoughts={setThoughts}
          saveTimeoutRef={saveTimeoutRef}
          saveThought={saveThought}
          taskTitle={taskTitle}
          setTaskTitle={setTaskTitle}
          taskDesc={taskDesc}
          setTaskDesc={setTaskDesc}
          projectTitle={projectTitle}
          setProjectTitle={setProjectTitle}
          projectDesc={projectDesc}
          setProjectDesc={setProjectDesc}
          resistance={resistance}
          setResistance={setResistance}
          handleDecompose={handleDecompose}
        />
      )}

      {/* STEP 4: SPRINT OBJECTIVES & PROJECTS */}
      {step === 4 && (
        <StepSprintObjectives
          showAddObjectiveForm={showAddObjectiveForm}
          setShowAddObjectiveForm={setShowAddObjectiveForm}
          setStep={setStep}
          newObjectiveTitle={newObjectiveTitle}
          setNewObjectiveTitle={setNewObjectiveTitle}
          newObjectiveSphereId={newObjectiveSphereId}
          setNewObjectiveSphereId={setNewObjectiveSphereId}
          newObjectiveDesc={newObjectiveDesc}
          setNewObjectiveDesc={setNewObjectiveDesc}
          spheres={spheres}
          handleCreateObjective={handleCreateObjective}
          isActionPending={isActionPending}
          sprint={sprint}
          handleOpenEditProject={handleOpenEditProject}
          setDeleteProjectId={deleteProjectId.open}
          handleAssignProject={handleAssignProject}
          backlogProjects={backlogProjects}
          backlogSearch={backlogSearch}
          setBacklogSearch={setBacklogSearch}
        />
      )}

      {/* STEP 5: PROJECT DECONSTRUCTION */}
      {step === 5 && (
        <StepDeconstruction
          router={router}
          startActionTransition={startActionTransition}
          isActionPending={isActionPending}
          setStep={setStep}
          activeSprintProjects={activeSprintProjects}
          selectedDeconstructProjectId={selectedDeconstructProjectId}
          setSelectedDeconstructProjectId={setSelectedDeconstructProjectId}
          selectedDeconstructProject={selectedDeconstructProject}
          handleMarkProjectPlanned={handleMarkProjectPlanned}
          handleOpenEditProject={handleOpenEditProject}
          setDeleteProjectId={deleteProjectId.open}
          expandedGroupId={expandedGroupId}
          setExpandedGroupId={setExpandedGroupId}
          handleAddTopLevelTask={handleAddTopLevelTask}
          handleOpenEditTask={handleOpenEditTask}
          setDeleteTaskId={deleteTaskId.open}
        />
      )}

      {/* 📅 STEP 6: WEEKLY KANBAN DISTRIBUTION */}
      {step === 6 && sprintStart && weekStart && (
        <StepWeeklyKanban
          router={router}
          weekStart={weekStart}
          sprintWeeks={sprintWeeks}
          selectedWeekIndex={selectedWeekIndex}
          setSelectedWeekIndex={setSelectedWeekIndex}
          allAtomsForDistribution={allAtomsForDistribution}
          spheres={spheres}
          handleOpenEditTaskFromAnywhere={handleOpenEditTaskFromAnywhere}
          setDeleteTaskId={deleteTaskId.open}
          setSprint={setSprint}
          setStandaloneAtoms={setStandaloneAtoms}
          overdueScheduledAtoms={overdueScheduledAtoms}
          setSchedulingTaskId={setSchedulingTaskId}
          isPendingAtom={isPendingAtom}
          activeSprintProjects={activeSprintProjects}
          expandedProjects={expandedProjects}
          toggleProjectCollapse={toggleProjectCollapse}
          expandedGroups={expandedGroups}
          toggleGroupCollapse={toggleGroupCollapse}
          setBatchScheduleAtomIds={setBatchScheduleAtomIds}
          setBatchScheduleDate={setBatchScheduleDate}
          standaloneAtoms={standaloneAtoms}
        />
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

      {deleteThoughtId.isOpen && (
        <ConfirmationDialog
          isOpen={deleteThoughtId.isOpen}
          onClose={deleteThoughtId.close}
          onConfirm={() => {
            if (deleteThoughtId.target) {
              handleDeleteThought(deleteThoughtId.target);
            }
          }}
          title="Delete Thought"
          description="Are you sure you want to permanently delete this thought? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
        />
      )}

      {editingProjectId && (
        <Dialog
          isOpen={true}
          onClose={() => setEditingProjectId(null)}
          title="Edit Project"
          description="Update the project title and description."
          maxWidth="480px"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase">Title</label>
              <Input
                value={editProjectTitle}
                onChange={(e) => setEditProjectTitle(e.target.value)}
                placeholder="Project title"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleEditProject();
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase">Description</label>
              <Textarea
                value={editProjectDesc}
                onChange={(e) => setEditProjectDesc(e.target.value)}
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end mt-1">
              <Button variant="ghost" size="sm" onClick={() => setEditingProjectId(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleEditProject}
                disabled={!editProjectTitle.trim() || isActionPending}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {editingTaskId && (
        <Dialog
          isOpen={true}
          onClose={() => setEditingTaskId(null)}
          title={`Edit ${editTaskMode === "group" ? "Group" : "Atom"}`}
          description={`Update the ${editTaskMode} title and description.`}
          maxWidth="480px"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase">Title</label>
              <Input
                value={editTaskTitle}
                onChange={(e) => setEditTaskTitle(e.target.value)}
                placeholder={`${editTaskMode === "group" ? "Group" : "Atom"} title`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleEditTask();
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase">Description</label>
              <Textarea
                value={editTaskDesc}
                onChange={(e) => setEditTaskDesc(e.target.value)}
                placeholder="Optional description"
                rows={3}
              />
            </div>

            {editTaskMode === "atom" && (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-mono text-zinc-300 uppercase">
                  <span>Resistance (1-5)</span>
                  <span className="text-orange-400 font-bold">{editTaskResistance} / 5</span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setEditTaskResistance(r)}
                      className={`w-8 h-8 rounded-lg text-xs font-mono transition-all duration-150 ${
                        editTaskResistance === r
                          ? "bg-accent/20 border border-accent/40 text-accent font-semibold"
                          : "bg-white/[0.04] border border-white/[0.06] text-zinc-500 hover:bg-white/[0.06]"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-between mt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleConvertTask}
                disabled={editTaskMode === "group" && editTaskHasChildren}
                className="text-[10px]"
                title={
                  editTaskMode === "group" && editTaskHasChildren
                    ? "Remove all atoms first"
                    : undefined
                }
              >
                {editTaskMode === "group" ? "Convert to Atom" : "Convert to Group"}
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditingTaskId(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleEditTask}
                  disabled={!editTaskTitle.trim() || isActionPending}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {deleteTaskId.isOpen && (
        <ConfirmationDialog
          isOpen={deleteTaskId.isOpen}
          onClose={deleteTaskId.close}
          onConfirm={() => {
            if (deleteTaskId.target) {
              handleDeleteTaskAnywhere(deleteTaskId.target);
              deleteTaskId.close();
            }
          }}
          title="Delete Task"
          description="Are you sure you want to delete this task? All child atoms will also be permanently deleted."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
        />
      )}

      {schedulingTaskId && (
        <Dialog
          isOpen={true}
          onClose={() => {
            setSchedulingTaskId(null);
            setScheduleDate("");
          }}
          title="Schedule Atom"
          maxWidth="420px"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-zinc-400 uppercase">
                Pick a day (Week {selectedWeekIndex + 1})
              </label>
              <div className="grid grid-cols-7 gap-1.5">
                {weekStart &&
                  Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const isSelected = scheduleDate === dateStr;
                    const isTodayDate = isToday(day);
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => setScheduleDate(dateStr)}
                        className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg border text-xs transition-all duration-150 ${
                          isSelected
                            ? "border-accent bg-accent/10 text-accent font-semibold"
                            : isTodayDate
                              ? "border-accent/40 bg-accent/5 text-zinc-200"
                              : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
                        }`}
                      >
                        <span className="text-[9px] font-mono uppercase">{format(day, "EEE")}</span>
                        <span className="text-sm">
                          {format(day, "d")}
                          {isTodayDate && (
                            <span className="ml-0.5 inline-block w-1 h-1 rounded-full bg-accent align-middle" />
                          )}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-zinc-400 uppercase">
                Or pick any date
              </label>
              <DatePicker
                value={scheduleDate}
                onChange={setScheduleDate}
                placeholder="Select date"
              />
            </div>

            {scheduleDate && (
              <div className="text-[10px] text-zinc-500 font-mono">
                Scheduled for:{" "}
                {format(new Date(scheduleDate), "dd.MM.yyyy (EEE)", { weekStartsOn: 1 })}
              </div>
            )}
            {scheduleDate &&
              (() => {
                const schedulingAtom = allAtomsForDistribution.find(
                  (a) => a.id === schedulingTaskId,
                );
                const currentResistance = atomResistanceForDate(scheduleDate);
                const atomResistance = schedulingAtom?.resistance ?? 0;
                const totalResistance = currentResistance + atomResistance;
                const atomCount = atomCountForDate(scheduleDate);

                if (!schedulingAtom?.resistance && schedulingAtom?.resistance !== 0) {
                  return (
                    <div className="text-[10px] text-red-400 font-mono flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/5 border border-red-500/20">
                      <AlertTriangle size={11} className="shrink-0" />
                      Cannot schedule: resistance not set. Edit the atom to set resistance first.
                    </div>
                  );
                }

                if (totalResistance > DAILY_RESISTANCE_BUDGET) {
                  return (
                    <div className="text-[10px] text-amber-400 font-mono flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <AlertTriangle size={11} className="shrink-0" />
                      This day has {currentResistance} resistance (+{atomResistance} ={" "}
                      {totalResistance}) — exceeds {DAILY_RESISTANCE_BUDGET} daily budget (
                      {atomCount + 1} atoms).
                    </div>
                  );
                }

                return null;
              })()}
            <div className="flex gap-2 justify-end mt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSchedulingTaskId(null);
                  setScheduleDate("");
                }}
              >
                Cancel
              </Button>
              {scheduleDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (schedulingTaskId) {
                      startActionTransition(async () => {
                        const result = await upsertTaskAction({
                          id: schedulingTaskId,
                          plannedDate: null,
                        });
                        if (result.success) {
                          toast.success("Schedule cleared");
                          setSchedulingTaskId(null);
                          setScheduleDate("");
                          setSprint((prev: SprintData) => ({
                            ...prev,
                            objectives: prev.objectives.map((obj: SprintObjective) => ({
                              ...obj,
                              projects: obj.projects.map((p: SprintProject) => ({
                                ...p,
                                tasks: p.tasks.map((t: SprintTask) => {
                                  if (t.id === schedulingTaskId) {
                                    return { ...t, plannedDate: null };
                                  }
                                  return {
                                    ...t,
                                    children: (t.children || []).map((c: SprintTask) =>
                                      c.id === schedulingTaskId ? { ...c, plannedDate: null } : c,
                                    ),
                                  };
                                }),
                              })),
                            })),
                          }));
                          setStandaloneAtoms((prev) =>
                            prev.map((atom) =>
                              atom.id === schedulingTaskId ? { ...atom, plannedDate: null } : atom,
                            ),
                          );
                        }
                      });
                    }
                  }}
                >
                  Clear
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleScheduleTask}
                disabled={
                  !scheduleDate ||
                  isActionPending ||
                  (() => {
                    const atom = allAtomsForDistribution.find((a) => a.id === schedulingTaskId);
                    return !atom?.resistance && atom?.resistance !== 0;
                  })()
                }
              >
                Schedule
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {batchScheduleAtomIds && (
        <Dialog
          isOpen={true}
          onClose={() => {
            setBatchScheduleAtomIds(null);
            setBatchScheduleDate("");
          }}
          title={`Schedule ${batchScheduleAtomIds.length} atoms`}
          maxWidth="420px"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-zinc-400 uppercase">
                Pick a day (Week {selectedWeekIndex + 1})
              </label>
              <div className="grid grid-cols-7 gap-1.5">
                {weekStart &&
                  Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const isSelected = batchScheduleDate === dateStr;
                    const isTodayDate = isToday(day);
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => setBatchScheduleDate(dateStr)}
                        className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg border text-xs transition-all duration-150 ${
                          isSelected
                            ? "border-accent bg-accent/10 text-accent font-semibold"
                            : isTodayDate
                              ? "border-accent/40 bg-accent/5 text-zinc-200"
                              : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
                        }`}
                      >
                        <span className="text-[9px] font-mono uppercase">{format(day, "EEE")}</span>
                        <span className="text-sm">
                          {format(day, "d")}
                          {isTodayDate && (
                            <span className="ml-0.5 inline-block w-1 h-1 rounded-full bg-accent align-middle" />
                          )}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-zinc-400 uppercase">
                Or pick any date
              </label>
              <DatePicker
                value={batchScheduleDate}
                onChange={setBatchScheduleDate}
                placeholder="Select date"
              />
            </div>

            {batchScheduleDate && (
              <div className="text-[10px] text-zinc-500 font-mono">
                {batchScheduleAtomIds.length} atoms will be scheduled for{" "}
                {format(new Date(batchScheduleDate), "dd.MM.yyyy (EEE)", { weekStartsOn: 1 })}
              </div>
            )}
            {batchScheduleDate &&
              (() => {
                const batchAtoms = allAtomsForDistribution.filter((a) =>
                  batchScheduleAtomIds?.includes(a.id),
                );
                const atomsWithoutResistance = batchAtoms.filter(
                  (a) => !a.resistance && a.resistance !== 0,
                );
                const currentResistance = atomResistanceForDate(batchScheduleDate);
                const batchResistance = batchAtoms.reduce((sum, a) => sum + (a.resistance ?? 0), 0);
                const totalResistance = currentResistance + batchResistance;
                const totalAtoms =
                  atomCountForDate(batchScheduleDate) + batchScheduleAtomIds.length;

                if (atomsWithoutResistance.length > 0) {
                  return (
                    <div className="text-[10px] text-red-400 font-mono flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/5 border border-red-500/20">
                      <AlertTriangle size={11} className="shrink-0" />
                      Cannot schedule: {atomsWithoutResistance.length} atom(s) have no resistance
                      set.
                    </div>
                  );
                }

                if (totalResistance > DAILY_RESISTANCE_BUDGET) {
                  return (
                    <div className="text-[10px] text-amber-400 font-mono flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <AlertTriangle size={11} className="shrink-0" />
                      This day will have {currentResistance} resistance (+{batchResistance} ={" "}
                      {totalResistance}) — exceeds {DAILY_RESISTANCE_BUDGET} daily budget (
                      {totalAtoms} atoms).
                    </div>
                  );
                }

                return null;
              })()}
            <div className="flex gap-2 justify-end mt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBatchScheduleAtomIds(null);
                  setBatchScheduleDate("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleBatchScheduleTasks}
                disabled={
                  !batchScheduleDate ||
                  isActionPending ||
                  (() => {
                    const batchAtoms = allAtomsForDistribution.filter((a) =>
                      batchScheduleAtomIds?.includes(a.id),
                    );
                    return batchAtoms.some((a) => !a.resistance && a.resistance !== 0);
                  })()
                }
              >
                Schedule All
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {deleteProjectId.isOpen && (
        <ConfirmationDialog
          isOpen={deleteProjectId.isOpen}
          onClose={deleteProjectId.close}
          onConfirm={() => {
            if (deleteProjectId.target) {
              handleDeleteProject(deleteProjectId.target);
            }
          }}
          title="Delete Project"
          description="Are you sure you want to delete this project? All associated groups and atoms will also be permanently deleted."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
        />
      )}
    </div>
  );
}
