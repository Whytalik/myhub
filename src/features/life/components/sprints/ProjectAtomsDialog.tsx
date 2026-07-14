"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Input } from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/actions/button";
import { ChevronRight } from "lucide-react";
import { upsertTaskAction } from "@/features/life/actions/task-actions";
import { TaskCardBase } from "@/features/life/components/tasks/TaskCardBase";
import type { TaskData } from "@/features/life/types";

interface ProjectAtomsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  tasks: TaskData[];
  sphereId: string | null;
  isPlanningLocked: boolean;
  onAtomAdded: (task: TaskData) => void;
  onAtomDeleted: (taskId: string) => void;
}

export function ProjectAtomsDialog({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  tasks,
  sphereId,
  isPlanningLocked,
  onAtomAdded,
  onAtomDeleted,
}: ProjectAtomsDialogProps) {
  const [title, setTitle] = useState("");
  const [resistance, setResistance] = useState(3);
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (isPlanningLocked) {
      toast.error("Planning for this week is locked!");
      return;
    }
    const trimmed = title.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = await upsertTaskAction({
        title: trimmed,
        projectId,
        sphereId,
        status: "TODO",
        resistance,
      });

      if (result.success) {
        toast.success("Atom added — assign a day when you're ready.");
        onAtomAdded(result.data as unknown as TaskData);
        setTitle("");
        setResistance(3);
      } else {
        toast.error(result.error || "Failed to create atom");
      }
    });
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={projectTitle} maxWidth="560px">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto scrollbar-thin pr-1">
          {tasks.length === 0 ? (
            <div className="text-zinc-500 text-xs italic py-8 text-center">
              No atoms yet. Write out the steps below.
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCardBase
                key={task.id}
                task={task}
                variant="atom"
                onEdit={() => {}}
                onDelete={() => onAtomDeleted(task.id)}
              />
            ))
          )}
        </div>

        <div className="flex flex-col gap-1 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              placeholder="+ New kaizen atom..."
              className="text-xs h-8 flex-1"
              autoFocus
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
              onClick={handleAdd}
              disabled={!title.trim() || isPending}
              className="h-8 w-8 p-0 flex items-center justify-center shrink-0"
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
