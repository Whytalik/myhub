"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertHabitAction } from "@/features/life/actions/habit-actions";
import type { HabitData } from "@/features/life/types";
import { toast } from "sonner";
import { Anchor, Zap, PartyPopper } from "lucide-react";

interface HabitFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  habit?: HabitData | null;
}

export function HabitFormDialog({ isOpen, onClose, habit }: HabitFormDialogProps) {
  const isEditing = !!habit;
  const [isPending, startTransition] = useTransition();
  
  const [name, setName] = useState(() => habit?.name ?? "");
  const [anchor, setAnchor] = useState(() => habit?.anchor ?? "");
  const [action, setAction] = useState(() => habit?.action ?? "");
  const [celebration, setCelebration] = useState(() => habit?.celebration ?? "");
  const [archived, setArchived] = useState(() => habit?.archived ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !anchor.trim() || !action.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    startTransition(async () => {
      try {
        await upsertHabitAction({
          id: habit?.id,
          name: name.trim(),
          anchor: anchor.trim(),
          action: action.trim(),
          celebration: celebration.trim() || null,
          archived,
        });
        toast.success(isEditing ? "Habit updated" : "Habit created");
        onClose();
      } catch (err) {
        toast.error("Failed to save habit");
        console.error(err);
      }
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Habit" : "New Habit"}
      description="Define your habit using the Tiny Habits methodology: After I [Anchor], I will [Action]."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono tracking-widest text-muted">Habit name</label>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Morning pushups"
            autoFocus
          />
        </div>

        {isEditing && (
          <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface/50 cursor-pointer hover:bg-raised transition-colors">
            <input 
              type="checkbox" 
              checked={archived} 
              onChange={(e) => setArchived(e.target.checked)}
              className="w-4 h-4 rounded border-border text-accent focus:ring-accent bg-bg"
            />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-text">Archive Habit</span>
              <span className="text-[9px] text-muted font-mono uppercase tracking-tight">Hide from active list without deleting</span>
            </div>
          </label>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Anchor size={14} className="text-accent" />
              <label className="text-[10px] font-mono tracking-widest text-muted">The Anchor (Trigger)</label>
            </div>
            <Input 
              value={anchor} 
              onChange={(e) => setAnchor(e.target.value)} 
              placeholder="After I [wash my face]..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-amber-500" />
              <label className="text-[10px] font-mono tracking-widest text-muted">The Action (New habit)</label>
            </div>
            <Input 
              value={action} 
              onChange={(e) => setAction(e.target.value)} 
              placeholder="I will [do 5 pushups]..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <PartyPopper size={14} className="text-emerald-500" />
              <label className="text-[10px] font-mono tracking-widest text-muted">Celebration (Optional)</label>
            </div>
            <Input 
              value={celebration} 
              onChange={(e) => setCelebration(e.target.value)} 
              placeholder="And then I will [say 'Good job!']"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
}
