"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { CustomSelect } from "@/components/ui/inputs/custom-select";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export interface TaskCreateFormData {
  title: string;
  description: string;
  mode: "group" | "atom";
  resistance: number;
  projectId: string;
}

interface TaskCreateFormProps {
  projects: { id: string; title: string }[];
  defaultProjectId?: string | null;
  onSubmit: (data: TaskCreateFormData) => void;
  isPending: boolean;
}

export function TaskCreateForm({
  projects,
  defaultProjectId = null,
  onSubmit,
  isPending,
}: TaskCreateFormProps) {
  const [mode, setMode] = useState<"group" | "atom">("atom");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [resistance, setResistance] = useState(0);
  const [projectId, setProjectId] = useState(defaultProjectId ?? (projects.length === 1 ? projects[0].id : ""));

  useEffect(() => {
    if (defaultProjectId && projects.some((p) => p.id === defaultProjectId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProjectId(defaultProjectId);
    }
  }, [defaultProjectId, projects]);

  const isGroup = mode === "group";
  const projectOptions = projects.map((p) => ({ id: p.id, label: p.title }));
  const canSubmit = title.trim() && projectId && !isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      mode,
      resistance,
      projectId,
    });
    setTitle("");
    setDescription("");
    setResistance(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const modeButtonClass = (active: boolean) =>
    `text-[10px] font-mono px-2.5 py-1 rounded-md transition-colors duration-150 ${
      active ? "bg-accent/15 text-accent" : "text-zinc-500 hover:text-zinc-300"
    }`;

  return (
    <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.01] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-wider font-semibold">
          ➕ Add Task
        </span>
        <div className="flex items-center bg-white/[0.04] rounded-lg p-0.5 border border-white/[0.06]">
          <button type="button" onClick={() => setMode("group")} className={modeButtonClass(isGroup)}>
            Group
          </button>
          <button type="button" onClick={() => setMode("atom")} className={modeButtonClass(!isGroup)}>
            Atom
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono text-zinc-450 uppercase">
            {isGroup ? "Group Title" : "Atom Title"}
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isGroup ? "e.g. Design phase, Backend setup..." : "e.g. Create wireframe, Write tests..."}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono text-zinc-450 uppercase">Description / Links (optional)</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notes, references or urls..."
            rows={2}
          />
        </div>

        {projects.length > 1 && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-zinc-450 uppercase">Project</label>
            <CustomSelect
              value={projectId}
              onChange={setProjectId}
              options={projectOptions}
              placeholder="Select project..."
            />
          </div>
        )}

        {!isGroup && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-mono text-zinc-300 uppercase">
              <span>Internal resistance before action</span>
              <span className="text-orange-400 font-bold">{resistance} / 5</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setResistance(val)}
                  className={`flex-1 h-7 rounded text-xs font-mono transition-colors ${
                    resistance === val
                      ? val === 0
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : val >= 4
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      : "bg-white/[0.01] border-white/[0.06] text-zinc-505 hover:bg-white/[0.03]"
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
            {resistance === 0 && (
              <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-500/5 p-1.5 rounded border border-emerald-500/10">
                <CheckCircle2 size={11} className="shrink-0" />
                <span>Effortless — just do it!</span>
              </p>
            )}
          </div>
        )}

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-fit self-end mt-1"
        >
          {isGroup ? "Add Group to Project" : "Add Atom to Project"}
        </Button>
      </div>
    </div>
  );
}
