"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { Select } from "@/components/ui/inputs/select";
import { ConfirmationDialog } from "@/components/ui/overlays/dialog";
import { TaskCardBase } from "@/features/life/components/tasks/TaskCardBase";
import {
  updateProjectAction,
  assignProjectToObjectiveAction,
  deleteProjectAction,
} from "@/features/life/actions/sprint-actions";
import { upsertTaskAction } from "@/features/life/actions/task-actions";
import type { LifeSphereData, TaskData } from "@/features/life/types";

interface ObjectiveLite {
  id: string;
  title: string;
  sphere: { id: string; name: string; color: string };
}

interface ProjectDetailData {
  id: string;
  title: string;
  description: string | null;
  objectiveId: string | null;
  tasks: TaskData[];
  objective: (ObjectiveLite & { sprint?: { id: string; number: number; year: number } }) | null;
}

interface ProjectDetailClientProps {
  initialProject: ProjectDetailData;
  objectives: ObjectiveLite[];
  spheres: LifeSphereData[];
}

export function ProjectDetailClient({
  initialProject,
  objectives,
  spheres,
}: ProjectDetailClientProps) {
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const [title, setTitle] = useState(initialProject.title);
  const [description, setDescription] = useState(initialProject.description || "");
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [atomTitle, setAtomTitle] = useState("");
  const [resistance, setResistance] = useState(3);

  const hasUnsavedChanges = title !== project.title || description !== (project.description || "");

  const handleSaveDetails = () => {
    if (!title.trim()) return;
    startTransition(async () => {
      const result = await updateProjectAction(project.id, title.trim(), description.trim());
      if (result.success) {
        toast.success("Project updated");
        setProject((prev) => ({ ...prev, title: title.trim(), description: description.trim() }));
      } else {
        toast.error(result.error || "Failed to update project");
      }
    });
  };

  const handleReassign = (objectiveId: string | null) => {
    startTransition(async () => {
      const result = await assignProjectToObjectiveAction(project.id, objectiveId);
      if (result.success) {
        toast.success(objectiveId ? "Assigned to objective" : "Moved to backlog");
        const newObjective = objectiveId
          ? (objectives.find((o) => o.id === objectiveId) ?? null)
          : null;
        setProject((prev) => ({ ...prev, objectiveId, objective: newObjective }));
      } else {
        toast.error(result.error || "Failed to reassign project");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProjectAction(project.id);
      if (result.success) {
        toast.success("Project deleted");
        router.push("/life/planning/kanban");
      } else {
        toast.error(result.error || "Failed to delete project");
      }
    });
  };

  const handleAddAtom = () => {
    const trimmed = atomTitle.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const result = await upsertTaskAction({
        title: trimmed,
        projectId: project.id,
        sphereId: project.objective?.sphere.id || spheres[0]?.id || null,
        status: "TODO",
        resistance,
      });
      if (result.success) {
        toast.success("Atom added — assign a day when you're ready.");
        setProject((prev) => ({
          ...prev,
          tasks: [...prev.tasks, result.data as unknown as TaskData],
        }));
        setAtomTitle("");
        setResistance(3);
      } else {
        toast.error(result.error || "Failed to create atom");
      }
    });
  };

  const handleDeleteAtom = (taskId: string) => {
    setProject((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== taskId) }));
  };

  const completedCount = project.tasks.filter((t) => t.status === "DONE").length;
  const progressPct =
    project.tasks.length > 0 ? Math.round((completedCount / project.tasks.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="glass-card p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-label text-zinc-300">Project title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-label text-zinc-300">Description</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </div>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSaveDetails}
            disabled={!hasUnsavedChanges || !title.trim() || isPending}
          >
            Save changes
          </Button>

          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-rose-400 transition-colors"
          >
            <Trash2 size={12} /> Delete project
          </button>
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col gap-3">
        <span className="text-label text-zinc-300">Objective / Sprint</span>
        {project.objective ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: project.objective.sphere.color }}
              />
              <span className="text-sm text-zinc-200">{project.objective.title}</span>
            </div>
            <button
              type="button"
              onClick={() => handleReassign(null)}
              disabled={isPending}
              className="text-[10px] font-mono uppercase text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Move to backlog
            </button>
          </div>
        ) : (
          <span className="text-xs text-zinc-500 italic">In Global Backlog (no objective)</span>
        )}

        {objectives.length > 0 && (
          <Select
            onChange={(e) => handleReassign(e.target.value || null)}
            value=""
            variant="inline"
            className="text-xs text-zinc-400 font-mono"
          >
            <option value="" disabled className="bg-zinc-950 text-zinc-500">
              Assign to objective...
            </option>
            {objectives
              .filter((o) => o.id !== project.objectiveId)
              .map((o) => (
                <option key={o.id} value={o.id} className="bg-zinc-950 text-zinc-200">
                  {o.title}
                </option>
              ))}
          </Select>
        )}
      </div>

      <div className="glass-card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-label text-zinc-300">
            Atoms ({completedCount}/{project.tasks.length})
          </span>
          {project.tasks.length > 0 && (
            <span className="text-[10px] font-mono text-zinc-500">{progressPct}%</span>
          )}
        </div>

        {project.tasks.length > 0 && (
          <div className="w-full h-1.5 rounded-full bg-black/35 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          {project.tasks.length === 0 ? (
            <div className="text-zinc-500 text-xs italic py-8 text-center">
              No atoms yet. Write out the steps below.
            </div>
          ) : (
            project.tasks.map((task) => (
              <TaskCardBase
                key={task.id}
                task={task}
                variant="atom"
                onEdit={() => {}}
                onDelete={() => handleDeleteAtom(task.id)}
              />
            ))
          )}
        </div>

        <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.06]">
          <Input
            value={atomTitle}
            onChange={(e) => setAtomTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddAtom();
              }
            }}
            placeholder="+ New kaizen atom..."
            className="text-xs h-8 flex-1"
          />
          <div className="flex items-center gap-0.5 shrink-0">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                type="button"
                title={`Resistance ${val}/5`}
                onClick={() => setResistance(val)}
                className={`w-4 h-8 rounded-sm text-[9px] font-mono transition-colors ${
                  resistance === val
                    ? val >= 4
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "bg-white/[0.01] border border-white/[0.06] text-zinc-600 hover:bg-white/[0.03]"
                }`}
              >
                {val}
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddAtom}
            disabled={!atomTitle.trim() || isPending}
            className="h-8 w-8 p-0 flex items-center justify-center shrink-0"
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete project"
        description={`Are you sure you want to delete "${project.title}"? This also removes its atoms.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
