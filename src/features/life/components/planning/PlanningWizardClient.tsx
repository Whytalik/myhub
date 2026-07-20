"use client";

import { useState, useTransition, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sparkles,
  Lightbulb,
  CheckCircle2,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowRight,
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  Play,
  Layers,
  Zap,
  HelpCircle,
  Pencil,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import {
  quickCaptureAction,
  routeThoughtAction,
  decomposeThoughtAction,
  upsertThoughtAction,
  deleteThoughtAction,
} from "@/features/life/actions/thought-actions";
import {
  createProjectAction,
  assignProjectToObjectiveAction,
  createSprintObjectiveAction,
  deleteProjectAction,
  updateProjectAction,
} from "@/features/life/actions/sprint-actions";
import { upsertTaskAction, deleteTaskAction } from "@/features/life/actions/task-actions";
import type { LifeSphereData } from "@/features/life/types";
import { KanbanBoardClient } from "../sprints/KanbanBoardClient";
import { ThoughtFields } from "@/features/life/components/thoughts/ThoughtFields";
import { THOUGHT_TYPE_CONFIGS, type ThoughtType } from "@/features/life/logic/thought-types";
import { ThoughtDetailDialog } from "@/features/life/components/thoughts/ThoughtDetailDialog";
import { ConfirmationDialog, Dialog } from "@/components/ui/overlays/dialog";

const FILTER_TYPE_ICONS: Record<string, LucideIcon> = {
  AlertTriangle,
  Sparkles,
  CheckCircle2,
};

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
  const [thoughts, setThoughts] = useState<ThoughtItem[]>(initialThoughts);
  const [sprint, setSprint] = useState<any>(activeSprint);
  const [backlogProjects, setBacklogProjects] = useState<any[]>(initialBacklogProjects);

  // Step 4 state
  const [newObjectiveTitle, setNewObjectiveTitle] = useState("");
  const [newObjectiveSphereId, setNewObjectiveSphereId] = useState(spheres[0]?.id || "");
  const [newObjectiveDesc, setNewObjectiveDesc] = useState("");
  const [showAddObjectiveForm, setShowAddObjectiveForm] = useState(false);
  const [backlogSearch, setBacklogSearch] = useState("");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjectTitle, setEditProjectTitle] = useState("");
  const [editProjectDesc, setEditProjectDesc] = useState("");
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  // Step 5 state
  const activeSprintProjects = useMemo(() => {
    if (!sprint?.objectives) return [];
    return sprint.objectives.flatMap((obj: any) => obj.projects || []);
  }, [sprint]);
  const [selectedDeconstructProjectId, setSelectedDeconstructProjectId] = useState<string | null>(null);
  
  // Set default selected project when entering Step 5
  useEffect(() => {
    if (step === 5 && !selectedDeconstructProjectId && activeSprintProjects.length > 0) {
      setSelectedDeconstructProjectId(activeSprintProjects[0].id);
    }
  }, [step, activeSprintProjects, selectedDeconstructProjectId]);

  const selectedDeconstructProject = useMemo(() => {
    return activeSprintProjects.find((p: any) => p.id === selectedDeconstructProjectId) || null;
  }, [activeSprintProjects, selectedDeconstructProjectId]);

  const [newAtomTitle, setNewAtomTitle] = useState("");
  const [newAtomDesc, setNewAtomDesc] = useState("");
  const [newAtomResistance, setNewAtomResistance] = useState(3);
  const [newAtomPriority, setNewAtomPriority] = useState<any>("MEDIUM");
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [newSubAtomTitle, setNewSubAtomTitle] = useState("");
  const [newSubAtomDesc, setNewSubAtomDesc] = useState("");
  const [createMode, setCreateMode] = useState<"group" | "atom">("group");

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
  const [isSavePending, startSaveTransition] = useTransition();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [deleteThoughtId, setDeleteThoughtId] = useState<string | null>(null);

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
      setFilterIndex(inboxThoughts.length - 1);
    }
  }, [inboxThoughts.length, filterIndex]);

  useEffect(() => {
    if (decomposeIndex >= decomposableThoughts.length && decomposableThoughts.length > 0) {
      setDecomposeIndex(decomposableThoughts.length - 1);
    }
  }, [decomposableThoughts.length, decomposeIndex]);

  useEffect(() => {
    if (step === 2) {
      if (initialFilterCount === null || initialFilterCount < inboxThoughts.length) {
        setInitialFilterCount(inboxThoughts.length);
      }
    } else {
      setInitialFilterCount(null);
    }
  }, [step, inboxThoughts.length, initialFilterCount]);

  const currentFilterThoughtId = inboxThoughts[filterIndex]?.id;

  useEffect(() => {
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
    setFirstAtomTitle("");
    setFirstAtomDesc("");
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
          setBacklogProjects((prev) => [result.data.project, ...prev]);
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
      const result = await createSprintObjectiveAction(sprint.id, title, newObjectiveSphereId, newObjectiveDesc);
      if (result.success) {
        toast.success("Objective created successfully!");
        setNewObjectiveTitle("");
        setNewObjectiveDesc("");
        setShowAddObjectiveForm(false);
        const newObj = {
          ...result.data,
          sphere: spheres.find((s) => s.id === newObjectiveSphereId),
          projects: [],
        };
        setSprint((prev: any) => ({
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
        
        let projectToMove: any = null;
        
        const backlogIndex = backlogProjects.findIndex((p) => p.id === projectId);
        if (backlogIndex !== -1) {
          projectToMove = backlogProjects[backlogIndex];
        } else {
          for (const obj of sprint.objectives) {
            const idx = obj.projects.findIndex((p: any) => p.id === projectId);
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
        setSprint((prev: any) => ({
          ...prev,
          objectives: prev.objectives.map((obj: any) => ({
            ...obj,
            projects: obj.projects.filter((p: any) => p.id !== projectId),
          })),
        }));

        if (objectiveId === null) {
          setBacklogProjects((prev) => [updatedProject, ...prev]);
        } else {
          setSprint((prev: any) => ({
            ...prev,
            objectives: prev.objectives.map((obj: any) => {
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
      const result = await updateProjectAction(editingProjectId, title, editProjectDesc.trim() || undefined);
      if (result.success) {
        toast.success("Project updated!");
        setEditingProjectId(null);

        const updateInList = (projects: any[]) =>
          projects.map((p: any) =>
            p.id === editingProjectId ? { ...p, title, description: editProjectDesc.trim() || null } : p,
          );

        setSprint((prev: any) => ({
          ...prev,
          objectives: prev.objectives.map((obj: any) => ({
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
        setDeleteProjectId(null);

        setSprint((prev: any) => ({
          ...prev,
          objectives: prev.objectives.map((obj: any) => ({
            ...obj,
            projects: obj.projects.filter((p: any) => p.id !== projectId),
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

  const handleOpenEditProject = (project: { id: string; title: string; description?: string | null }) => {
    setEditingProjectId(project.id);
    setEditProjectTitle(project.title);
    setEditProjectDesc(project.description || "");
  };

  // Step 5 Handlers
  const handleAddTopLevelTask = () => {
    const title = newAtomTitle.trim();
    if (!title || !selectedDeconstructProjectId || !sprint) return;
    const isGroup = createMode === "group";

    startActionTransition(async () => {
      let sphereId: string | null = null;
      for (const obj of sprint.objectives) {
        if (obj.projects.some((p: any) => p.id === selectedDeconstructProjectId)) {
          sphereId = obj.sphereId;
          break;
        }
      }

      const result = await upsertTaskAction({
        title,
        description: newAtomDesc.trim() || null,
        projectId: selectedDeconstructProjectId,
        sphereId,
        status: "TODO",
        priority: newAtomPriority,
        resistance: newAtomResistance,
      });

      if (result.success) {
        toast.success(isGroup ? "Group created!" : "Atom created!");
        setNewAtomTitle("");
        setNewAtomDesc("");
        setNewAtomResistance(3);
        setNewAtomPriority("MEDIUM");

        const newTask = result.data;
        setSprint((prev: any) => ({
          ...prev,
          objectives: prev.objectives.map((obj: any) => ({
            ...obj,
            projects: obj.projects.map((p: any) => {
              if (p.id === selectedDeconstructProjectId) {
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

  const handleAddAtomToGroup = (parentGroupId: string) => {
    const title = newSubAtomTitle.trim();
    if (!title || !selectedDeconstructProjectId || !sprint) return;

    startActionTransition(async () => {
      let sphereId: string | null = null;
      for (const obj of sprint.objectives) {
        if (obj.projects.some((p: any) => p.id === selectedDeconstructProjectId)) {
          sphereId = obj.sphereId;
          break;
        }
      }

      const result = await upsertTaskAction({
        title,
        description: newSubAtomDesc.trim() || null,
        projectId: selectedDeconstructProjectId,
        parentId: parentGroupId,
        sphereId,
        status: "TODO",
        priority: "MEDIUM",
      });

      if (result.success) {
        toast.success("Atom added!");
        setNewSubAtomTitle("");
        setNewSubAtomDesc("");

        const newTask = result.data;
        setSprint((prev: any) => ({
          ...prev,
          objectives: prev.objectives.map((obj: any) => ({
            ...obj,
            projects: obj.projects.map((p: any) => {
              if (p.id === selectedDeconstructProjectId) {
                return {
                  ...p,
                  tasks: (p.tasks || []).map((t: any) => {
                    if (t.id === parentGroupId) {
                      return {
                        ...t,
                        children: [...(t.children || []), newTask],
                      };
                    }
                    return t;
                  }),
                };
              }
              return p;
            }),
          })),
        }));
      } else {
        toast.error(result.error || "Failed to add atom");
      }
    });
  };

  const handleDeleteAtomFromProject = (taskId: string) => {
    startActionTransition(async () => {
      const result = await deleteTaskAction(taskId);
      if (result.success) {
        toast.success("Task atom deleted");
        setSprint((prev: any) => ({
          ...prev,
          objectives: prev.objectives.map((obj: any) => ({
            ...obj,
            projects: obj.projects.map((p: any) => {
              if (p.id === selectedDeconstructProjectId) {
                return {
                  ...p,
                  tasks: (p.tasks || []).filter((t: any) => t.id !== taskId),
                };
              }
              return p;
            }),
          })),
        }));
      } else {
        toast.error(result.error || "Failed to delete task atom");
      }
    });
  };

  const currentDecomposeThought = decomposableThoughts[decomposeIndex];
  useEffect(() => {
    if (currentDecomposeThought) {
      setTaskTitle(currentDecomposeThought.content);
      setProjectTitle(currentDecomposeThought.content);
      setFirstAtomTitle("First action for: " + currentDecomposeThought.content.slice(0, 30));
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
      {step === 0 && (
        <div className="glass-card p-6 md:p-8 flex flex-col gap-6 items-center text-center bg-white/[0.01] max-w-3xl mx-auto w-full">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center animate-float">
            <Sparkles size={32} />
          </div>

          <div className="flex flex-col gap-2 max-w-lg">
            <h2 className="text-2xl font-bold text-zinc-100 font-mono">Kaizen Planning Cycle</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Do not try to plan the chaos in your head. Let&apos;s declutter your mind, sift thoughts
              through the Prime Filter, and break them down into atoms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full text-left mt-4">
            <div className="glass-card p-4 flex gap-3 border-white/[0.04] bg-white/[0.01]">
              <span className="text-xl">✍️</span>
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-300">
                  1. Brain Dump
                </h4>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Write down everything on your mind without analysis or limits.
                </p>
              </div>
            </div>
            <div className="glass-card p-4 flex gap-3 border-white/[0.04] bg-white/[0.01]">
              <span className="text-xl">🔍</span>
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-300">
                  2. Prime Filter
                </h4>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Separate true desires from obligations. Discard noise.
                </p>
              </div>
            </div>
            <div className="glass-card p-4 flex gap-3 border-white/[0.04] bg-white/[0.01]">
              <span className="text-xl">🔬</span>
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-300">
                  3. Decomposition
                </h4>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Convert thoughts into Projects or Standalone Tasks in your backlog.
                </p>
              </div>
            </div>
            <div className="glass-card p-4 flex gap-3 border-white/[0.04] bg-white/[0.01]">
              <span className="text-xl">🎯</span>
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-300">
                  4. Sprint Goals
                </h4>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Define sprint objectives and pull projects from backlog.
                </p>
              </div>
            </div>
            <div className="glass-card p-4 flex gap-3 border-white/[0.04] bg-white/[0.01]">
              <span className="text-xl">🛠️</span>
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-300">
                  5. Deconstruction
                </h4>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Break down sprint projects into simple actionable task atoms.
                </p>
              </div>
            </div>
            <div className="glass-card p-4 flex gap-3 border-white/[0.04] bg-white/[0.01]">
              <span className="text-xl">📅</span>
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-300">
                  6. Distribution
                </h4>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Distribute task atoms across the weeks and days of your sprint.
                </p>
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
                Write down everything on your mind: tasks, shopping, thoughts, ideas, obligations.
                Write quickly.
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
                <h4 className="text-xs font-mono font-semibold uppercase text-zinc-400">
                  Current Inbox
                </h4>
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
                {activeFilterSphereId
                  ? `${displayedThoughts.length} of ${thoughts.length}`
                  : thoughts.length}
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
                  const sphere = spheres.find(
                    (currentSphere) => currentSphere.id === thoughtItem.sphereId,
                  );
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
                  Next to Filtering ({inboxThoughts.length} in Inbox){" "}
                  <ChevronRight size={14} className="ml-1" />
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
                Next to Decomposition ({decomposableThoughts.length} waiting){" "}
                <ChevronRight size={14} />
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
                        {FilterThoughtIcon && (
                          <FilterThoughtIcon size={10} className="text-accent" />
                        )}
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
                        onClick={() =>
                          handleFilterThought(inboxThoughts[filterIndex].id, "NOT_MINE")
                        }
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
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          handleFilterThought(inboxThoughts[filterIndex].id, "NOT_MINE")
                        }
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
                        onClick={() =>
                          handleFilterThought(inboxThoughts[filterIndex].id, "NOT_MINE")
                        }
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
                        onClick={() =>
                          handleFilterThought(inboxThoughts[filterIndex].id, "SOMEDAY")
                        }
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
      )}

      {/* STEP 3: DECOMPOSITION */}
      {step === 3 && (
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
                  You have successfully decomposed all filtered desires and obligations into
                  actionable items.
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
                            <DecomposeThoughtIcon size={9} className="text-amber-450" />
                          )}
                          {decomposeThoughtTypeConfig.label}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-sm font-medium text-zinc-150 leading-relaxed font-sans whitespace-pre-wrap">
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
                            <p className="text-xs text-zinc-350 whitespace-pre-wrap leading-relaxed">
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
                      className="absolute top-3 right-3 p-1.5 rounded text-zinc-500 hover:text-zinc-350 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
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
                      className="text-rose-500 hover:text-rose-455 font-medium flex items-center gap-1.5 transition-colors duration-150"
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
                    className="text-zinc-450 hover:text-zinc-350"
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
      )}

      {/* STEP 4: SPRINT OBJECTIVES & PROJECTS */}
      {step === 4 && (
        <div className="glass-card p-6 md:p-8 bg-black/15 border border-white/[0.04] rounded-2xl flex flex-col gap-6">
          <div className="w-full flex items-center justify-between border-b border-white/[0.04] pb-3 mb-2">
            <div>
              <h3 className="text-panel-title font-semibold text-zinc-200">
                Step 4: Sprint Objectives & Projects
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Define your goals for the sprint and assign backlog projects to them.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddObjectiveForm(!showAddObjectiveForm)}
                className="text-xs flex items-center gap-1.5"
              >
                <Plus size={14} /> New Objective
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setStep(5)}
                className="text-xs"
              >
                Next: Deconstruct Projects <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>

          {showAddObjectiveForm && (
            <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] flex flex-col gap-4 animate-fade-up max-w-lg">
              <h4 className="text-xs font-mono font-semibold text-zinc-300 uppercase">
                Add Sprint Objective
              </h4>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-zinc-400">Title</label>
                  <Input
                    value={newObjectiveTitle}
                    onChange={(e) => setNewObjectiveTitle(e.target.value)}
                    placeholder="e.g. Master React Native navigation"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-zinc-400">Sphere (Area)</label>
                  <select
                    value={newObjectiveSphereId}
                    onChange={(e) => setNewObjectiveSphereId(e.target.value)}
                    className="bg-black/30 border border-white/8 rounded-lg px-3 py-1.5 text-sm text-zinc-150"
                  >
                    {spheres.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-zinc-400">Description</label>
                  <Textarea
                    value={newObjectiveDesc}
                    onChange={(e) => setNewObjectiveDesc(e.target.value)}
                    placeholder="What does success look like?"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2 justify-end mt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddObjectiveForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCreateObjective}
                    disabled={!newObjectiveTitle.trim() || isActionPending}
                  >
                    Create
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
            {/* Sprint Objectives Panel */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-mono font-semibold uppercase text-zinc-400 border-b border-white/[0.04] pb-2">
                Sprint Objectives & Active Projects
              </h4>

              {(!sprint?.objectives || sprint.objectives.length === 0) ? (
                <div className="text-zinc-500 text-xs italic py-8 text-center border border-dashed border-white/[0.06] rounded-xl">
                  No objectives defined for this sprint. Create one to assign projects.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {sprint.objectives.map((obj: any) => (
                    <div key={obj.id} className="glass-card p-4 border-white/[0.06] bg-white/[0.02] rounded-xl flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: obj.sphere?.color }}
                          />
                          <h5 className="text-sm font-semibold text-zinc-200">
                            {obj.title}
                          </h5>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase bg-white/[0.04] px-2 py-0.5 rounded">
                          {obj.sphere?.name}
                        </span>
                      </div>
                      
                      {obj.description && (
                        <p className="text-xs text-zinc-400 italic">
                          {obj.description}
                        </p>
                      )}

                      <div className="flex flex-col gap-2 mt-2">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                          Assigned Projects:
                        </span>
                        
                        {(!obj.projects || obj.projects.length === 0) ? (
                          <div className="text-[11px] text-zinc-500 italic py-2">
                            No projects linked. Assign a project from the backlog.
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {obj.projects.map((p: any) => (
                              <div key={p.id} className="group/item flex justify-between items-center bg-white/[0.01] border border-white/[0.04] p-2 rounded-lg text-xs hover:bg-white/[0.02] transition-colors duration-150">
                                <span className="text-zinc-200 font-medium truncate">
                                  📂 {p.title}
                                </span>
                                <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditProject(p)}
                                    className="p-1 rounded text-zinc-500 hover:text-accent hover:bg-accent/10 transition-colors duration-150"
                                    title="Edit project"
                                    disabled={isActionPending}
                                  >
                                    <Pencil size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteProjectId(p.id)}
                                    className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-150"
                                    title="Delete project"
                                    disabled={isActionPending}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAssignProject(p.id, null)}
                                    className="text-[10px] text-rose-450 hover:text-rose-400 font-mono ml-1"
                                    disabled={isActionPending}
                                  >
                                    Unassign
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Backlog Projects Panel */}
            <div className="flex flex-col gap-4 bg-black/10 border border-white/[0.04] p-4 rounded-xl">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-mono font-semibold uppercase text-zinc-400">
                  Project Backlog
                </h4>
                <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.03] px-2 py-0.5 rounded">
                  {backlogProjects.length} projects
                </span>
              </div>

              <Input
                value={backlogSearch}
                onChange={(e) => setBacklogSearch(e.target.value)}
                placeholder="Search backlog projects..."
                className="h-8 text-xs"
              />

              <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
                {backlogProjects.filter(p => p.title.toLowerCase().includes(backlogSearch.toLowerCase())).length === 0 ? (
                  <div className="text-zinc-500 text-xs italic py-8 text-center">
                    No backlog projects found.
                  </div>
                ) : (
                  backlogProjects
                    .filter(p => p.title.toLowerCase().includes(backlogSearch.toLowerCase()))
                    .map((p) => (
                      <div key={p.id} className="group/backlog glass-card p-3 border-white/[0.04] bg-white/[0.01] rounded-lg text-xs flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-zinc-200 font-medium break-words truncate">📂 {p.title}</span>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover/backlog:opacity-100 transition-opacity duration-150 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditProject(p)}
                              className="p-1 rounded text-zinc-500 hover:text-accent hover:bg-accent/10 transition-colors duration-150"
                              title="Edit project"
                              disabled={isActionPending}
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteProjectId(p.id)}
                              className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-150"
                              title="Delete project"
                              disabled={isActionPending}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        {p.description && (
                          <span className="text-[10px] text-zinc-505 line-clamp-2">{p.description}</span>
                        )}
                        {sprint.objectives.length > 0 ? (
                          <div className="flex flex-col gap-1 mt-1 pt-1.5 border-t border-white/[0.04]">
                            <span className="text-[8px] font-mono text-zinc-505 uppercase">
                              Assign to Objective:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {sprint.objectives.map((obj: any) => (
                                <button
                                  key={obj.id}
                                  type="button"
                                  onClick={() => handleAssignProject(p.id, obj.id)}
                                  className="text-[9px] font-mono bg-white/[0.03] hover:bg-accent/15 hover:text-accent border border-white/[0.06] rounded px-1.5 py-0.5 text-zinc-300 transition-colors duration-150 truncate max-w-[100px]"
                                  title={obj.title}
                                  disabled={isActionPending}
                                >
                                  {obj.title}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[8px] text-zinc-500 italic">Create an objective first</span>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: PROJECT DECONSTRUCTION */}
      {step === 5 && (
        <div className="glass-card p-6 md:p-8 bg-black/15 border border-white/[0.04] rounded-2xl flex flex-col gap-6">
          <div className="w-full flex items-center justify-between border-b border-white/[0.04] pb-3 mb-2">
            <div>
              <h3 className="text-panel-title font-semibold text-zinc-200">
                Step 5: Project Deconstruction
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Break down active sprint projects into groups and atomic actions to remove resistance.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(4)}
                className="text-xs"
              >
                <ChevronLeft size={14} className="mr-1" /> Back to Objectives
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  startActionTransition(async () => {
                    router.refresh();
                    setStep(6);
                  });
                }}
                disabled={isActionPending}
                className="text-xs"
              >
                Next: Weekly Planning <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>

          {activeSprintProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
              <AlertTriangle size={36} className="text-amber-400" />
              <div className="flex flex-col gap-1 max-w-sm">
                <h4 className="text-sm font-semibold text-zinc-200 font-mono">No active projects!</h4>
                <p className="text-xs text-zinc-400">
                  You haven&apos;t assigned any projects to this sprint. Go back and assign some to objectives.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setStep(4)} className="mt-2">
                <ChevronLeft size={14} className="mr-1" /> Back to Step 4
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
              {/* Left Project List */}
              <div className="flex flex-col gap-2 border-r border-white/[0.04] pr-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold mb-1">
                  Active Projects
                </span>
                {activeSprintProjects.map((p: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                  const isSelected = p.id === selectedDeconstructProjectId;
                  const taskCount = p.tasks?.length || 0;
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const subAtomCount = (p.tasks || []).reduce((sum: number, t: any) => sum + (t.children?.length || 0), 0);
                  return (
                    <div key={p.id} className="group/proj relative">
                      <button
                        type="button"
                        onClick={() => setSelectedDeconstructProjectId(p.id)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all duration-150 flex flex-col gap-1 ${
                          isSelected
                            ? "bg-accent/10 border-accent/30 text-accent font-semibold shadow-sm"
                            : "bg-white/[0.01] border-white/[0.04] text-zinc-400 hover:bg-white/[0.02]"
                        }`}
                      >
                        <span className="truncate w-full">📂 {p.title}</span>
                        <span className="text-[9px] opacity-75 font-mono">
                          {taskCount} tasks{subAtomCount > 0 ? `, ${subAtomCount} atoms` : ""}
                        </span>
                      </button>
                      <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover/proj:opacity-100 transition-opacity duration-150 z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditProject(p);
                          }}
                          className="p-1 rounded text-zinc-500 hover:text-accent hover:bg-accent/10 transition-colors duration-150 bg-canvas/80 backdrop-blur-sm"
                          title="Edit project"
                          disabled={isActionPending}
                        >
                          <Pencil size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteProjectId(p.id);
                          }}
                          className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-150 bg-canvas/80 backdrop-blur-sm"
                          title="Delete project"
                          disabled={isActionPending}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Deconstruction Panel */}
              {selectedDeconstructProject ? (
                <div className="flex flex-col gap-6 max-h-[calc(100vh-200px)] overflow-y-auto overscroll-contain pr-1">
                  {/* Selected Project Info */}
                  <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-mono text-accent uppercase tracking-wider block font-semibold mb-1">
                          Currently Deconstructing
                        </span>
                        <h4 className="text-base font-bold text-zinc-150 truncate">
                          📂 {selectedDeconstructProject.title}
                        </h4>
                        {selectedDeconstructProject.description && (
                          <p className="text-xs text-zinc-450 mt-1 whitespace-pre-wrap">
                            {selectedDeconstructProject.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProject(selectedDeconstructProject)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-accent hover:bg-accent/10 transition-colors duration-150"
                          title="Edit project"
                          disabled={isActionPending}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteProjectId(selectedDeconstructProject.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-150"
                          title="Delete project"
                          disabled={isActionPending}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Add Task Form */}
                  <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.01] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-wider font-semibold">
                        ➕ Add Task
                      </span>
                      <div className="flex items-center bg-white/[0.04] rounded-lg p-0.5 border border-white/[0.06]">
                        <button
                          type="button"
                          onClick={() => setCreateMode("group")}
                          className={`text-[10px] font-mono px-2.5 py-1 rounded-md transition-colors duration-150 ${
                            createMode === "group"
                              ? "bg-accent/15 text-accent"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          Group
                        </button>
                        <button
                          type="button"
                          onClick={() => setCreateMode("atom")}
                          className={`text-[10px] font-mono px-2.5 py-1 rounded-md transition-colors duration-150 ${
                            createMode === "atom"
                              ? "bg-accent/15 text-accent"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          Atom
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-mono text-zinc-450 uppercase">
                          {createMode === "group" ? "Group Title" : "Atom Title"}
                        </label>
                        <Input
                          value={newAtomTitle}
                          onChange={(e) => setNewAtomTitle(e.target.value)}
                          placeholder={createMode === "group" ? "e.g. Design phase, Backend setup..." : "e.g. Create wireframe, Write tests..."}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleAddTopLevelTask();
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-mono text-zinc-450 uppercase">Description / Links (optional)</label>
                        <Textarea
                          value={newAtomDesc}
                          onChange={(e) => setNewAtomDesc(e.target.value)}
                          placeholder="Notes, references or urls..."
                          rows={2}
                        />
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between text-[10px] font-mono text-zinc-300 uppercase">
                          <span>Internal resistance before action</span>
                          <span className="text-orange-400 font-bold">{newAtomResistance} / 5</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setNewAtomResistance(val)}
                              className={`flex-1 h-7 rounded text-xs font-mono transition-colors ${
                                newAtomResistance === val
                                  ? val >= 4
                                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                    : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                  : "bg-white/[0.01] border-white/[0.06] text-zinc-505 hover:bg-white/[0.03]"
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                        {newAtomResistance >= 4 && (
                          <p className="text-[10px] text-rose-400 font-mono flex items-center gap-1 bg-rose-500/5 p-1.5 rounded border border-rose-500/10">
                            <AlertTriangle size={11} className="shrink-0" />
                            <span>
                              Resistance is high: better split this step into an even simpler one!
                            </span>
                          </p>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleAddTopLevelTask}
                        disabled={!newAtomTitle.trim() || isActionPending}
                        className="w-fit self-end mt-1"
                      >
                        {createMode === "group" ? "Add Group to Project" : "Add Atom to Project"}
                      </Button>
                    </div>
                  </div>

                  {/* Groups List */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold border-b border-white/[0.04] pb-1">
                      Project Tasks ({(selectedDeconstructProject.tasks || []).filter((t: any) => !t.parentId).length})
                    </span>
                    {(!(selectedDeconstructProject.tasks || []).some((t: any) => !t.parentId)) ? (
                      <div className="text-zinc-500 text-xs italic py-6 text-center">
                        No tasks added yet. Use the form above to add a group or atom.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5 max-h-[500px] overflow-y-auto pr-1">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {selectedDeconstructProject.tasks.filter((t: any) => !t.parentId).map((task: any) => {
                          const isGroup = !!(task.description || task.resistance);
                          const hasChildren = (task.children || []).length > 0;
                          const isExpanded = expandedGroupId === task.id;
                          const children = task.children || [];
                          const childCount = children.length;
                          const doneCount = children.filter((c: any) => c.status === "DONE").length;

                          if (!isGroup) {
                            return (
                              <div key={task.id} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-white/[0.02] transition-colors duration-150 group">
                                <span className={`flex-1 truncate ${task.status === "DONE" ? "text-zinc-500 line-through" : "text-zinc-300"}`}>
                                  {task.status === "DONE" ? "✔️" : "○"} {task.title}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTaskId(task.id)}
                                  className="p-0.5 rounded text-zinc-505 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 duration-150 shrink-0"
                                  title="Delete atom"
                                  disabled={isActionPending}
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div key={task.id} className="border border-white/[0.04] rounded-lg overflow-hidden bg-white/[0.01]">
                              {/* Group header */}
                              <div className="flex items-center gap-2 p-3 text-xs group hover:bg-white/[0.02] transition-colors duration-150">
                                <button
                                  type="button"
                                  onClick={() => setExpandedGroupId(isExpanded ? null : task.id)}
                                  className="p-0.5 rounded text-zinc-500 hover:text-zinc-200 transition-colors shrink-0"
                                >
                                  <ChevronDown
                                    size={14}
                                    className={`transition-transform duration-150 ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                                  />
                                </button>
                                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                  <span className="text-zinc-200 font-medium truncate">📋 {task.title}</span>
                                  {task.description && (
                                    <span className="text-[10px] text-zinc-505 line-clamp-1">{task.description}</span>
                                  )}
                                </div>
                                {childCount > 0 && (
                                  <span className="text-[9px] font-mono text-zinc-500 shrink-0">
                                    {doneCount}/{childCount}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setDeleteTaskId(task.id)}
                                  className="p-1 rounded text-zinc-505 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 duration-150 shrink-0"
                                  title="Delete group"
                                  disabled={isActionPending}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              {/* Expanded: sub-atoms + inline form */}
                              {isExpanded && (
                                <div className="border-t border-white/[0.04] bg-black/10 px-3 py-2 flex flex-col gap-1.5">
                                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                  {children.length > 0 ? (
                                    children.map((atom: any) => (
                                      <div key={atom.id} className="flex items-center gap-2 pl-5 pr-1 py-1.5 rounded text-xs group/atom hover:bg-white/[0.02] transition-colors duration-150">
                                        <span className={`flex-1 truncate ${atom.status === "DONE" ? "text-zinc-500 line-through" : "text-zinc-300"}`}>
                                          {atom.status === "DONE" ? "✔️" : "○"} {atom.title}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => setDeleteTaskId(atom.id)}
                                          className="p-0.5 rounded text-zinc-505 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover/atom:opacity-100 duration-150 shrink-0"
                                          title="Delete atom"
                                          disabled={isActionPending}
                                        >
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="pl-5 py-1 text-[10px] text-zinc-500 italic">
                                      No atoms yet. Add one below.
                                    </div>
                                  )}

                                  {/* Inline add atom form */}
                                  <div className="flex flex-col gap-1.5 pl-5 pt-1">
                                    <div className="flex items-center gap-2">
                                      <Input
                                        value={expandedGroupId === task.id ? newSubAtomTitle : ""}
                                        onChange={(e) => {
                                          setExpandedGroupId(task.id);
                                          setNewSubAtomTitle(e.target.value);
                                        }}
                                        onFocus={() => setExpandedGroupId(task.id)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleAddAtomToGroup(task.id);
                                          }
                                        }}
                                        placeholder="Add an atom..."
                                        className="h-7 text-[11px]"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAddAtomToGroup(task.id)}
                                        disabled={!newSubAtomTitle.trim() || isActionPending}
                                        className="h-7 px-2 text-[10px]"
                                      >
                                        <Plus size={12} />
                                      </Button>
                                    </div>
                                    <Input
                                      value={expandedGroupId === task.id ? newSubAtomDesc : ""}
                                      onChange={(e) => {
                                        setExpandedGroupId(task.id);
                                        setNewSubAtomDesc(e.target.value);
                                      }}
                                      onFocus={() => setExpandedGroupId(task.id)}
                                      placeholder="Description (optional)..."
                                      className="h-7 text-[10px] text-zinc-400"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-zinc-505 text-xs italic py-16 text-center">
                  Select a project from the left to start deconstruction.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 📅 STEP 6: KANBAN DISTRIBUTION */}
      {step === 6 && (
        <div className="flex flex-col gap-6">
          <div className="glass-card p-4 bg-emerald-500/5 border-emerald-500/10 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">🎉</span>
              <div>
                <h4 className="text-sm font-bold text-zinc-100 font-mono">
                  Deconstruction complete! Step 6: Distribute
                </h4>
                <p className="text-xs text-zinc-400">
                  All your new projects are added to the Backlog, and atoms to the Weekly Plan.
                  Distribute them now:
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
            initialSprint={sprint}
            initialBacklogProjects={backlogProjects}
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

      {deleteThoughtId && (
        <ConfirmationDialog
          isOpen={deleteThoughtId !== null}
          onClose={() => setDeleteThoughtId(null)}
          onConfirm={() => {
            if (deleteThoughtId) {
              handleDeleteThought(deleteThoughtId);
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingProjectId(null)}
              >
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

      {deleteTaskId && (
        <ConfirmationDialog
          isOpen={deleteTaskId !== null}
          onClose={() => setDeleteTaskId(null)}
          onConfirm={() => {
            if (deleteTaskId) {
              handleDeleteAtomFromProject(deleteTaskId);
            }
          }}
          title="Delete Task"
          description="Are you sure you want to delete this task? All child tasks will also be permanently deleted."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
        />
      )}

      {deleteProjectId && (
        <ConfirmationDialog
          isOpen={deleteProjectId !== null}
          onClose={() => setDeleteProjectId(null)}
          onConfirm={() => {
            if (deleteProjectId) {
              handleDeleteProject(deleteProjectId);
            }
          }}
          title="Delete Project"
          description="Are you sure you want to delete this project? All associated tasks will also be permanently deleted."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
        />
      )}
    </div>
  );
}
