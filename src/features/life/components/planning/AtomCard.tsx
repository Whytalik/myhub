import { Calendar, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import type { SprintTask } from "./types";

export function AtomCard({
  atom,
  onSchedule,
  onEdit,
  onDelete,
}: {
  atom: SprintTask & { projectName?: string; groupName?: string };
  onSchedule: (id: string) => void;
  onEdit: (task: SprintTask) => void;
  onDelete: (id: string) => void;
}) {
  const resistanceClass =
    atom.resistance === 0
      ? "bg-emerald-500/10 text-emerald-400"
      : atom.resistance != null && atom.resistance >= 4
        ? "bg-rose-500/10 text-rose-400"
        : atom.resistance != null
          ? "bg-orange-500/10 text-orange-400"
          : "";

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-150 group">
      <span className="text-xs text-zinc-300 truncate flex-1 min-w-0" title={atom.title}>
        {atom.title}
      </span>
      {atom.resistance != null && (
        <span
          className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded shrink-0 ${resistanceClass}`}
        >
          {atom.resistance}/5
        </span>
      )}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
        <Button
          variant="ghost-accent"
          size="icon-sm"
          onClick={() => onSchedule(atom.id)}
          title="Schedule"
        >
          <Calendar size={11} />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => onEdit(atom)} title="Edit">
          <Pencil size={11} />
        </Button>
        <Button
          variant="ghost-danger"
          size="icon-sm"
          onClick={() => onDelete(atom.id)}
          title="Delete"
        >
          <Trash2 size={11} />
        </Button>
      </div>
    </div>
  );
}
