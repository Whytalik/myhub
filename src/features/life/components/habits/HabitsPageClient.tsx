"use client";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/dialog";
import { deleteHabitAction } from "@/features/life/actions/habit-actions";
import type { HabitData, LifeSphereData } from "@/features/life/types";
import { ListChecks, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { HabitCard } from "./HabitCard";
import { HabitFormDialog } from "./HabitFormDialog";

interface HabitsPageClientProps {
  initialHabits: HabitData[];
  spheres: LifeSphereData[];
}

export function HabitsPageClient({ initialHabits, spheres }: HabitsPageClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<HabitData | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

  const activeHabits = initialHabits.filter((h) => !h.archived);
  const archivedHabits = initialHabits.filter((h) => h.archived);

  const handleEdit = (habit: HabitData) => {
    setSelectedHabit(habit);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    setHabitToDelete(id);
  };

  const confirmDelete = async () => {
    if (!habitToDelete) return;
    const result = await deleteHabitAction(habitToDelete);
    if (result.success) {
      toast.success("Habit deleted");
    } else {
      toast.error(result.error || "Failed to delete habit");
    }
    setHabitToDelete(null);
  };

  const handleAdd = () => {
    setSelectedHabit(null);
    setIsFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="flex justify-end">
        <div className="flex items-center gap-4">
          <Button
            variant="primary"
            size="sm"
            onClick={handleAdd}
            className="rounded-xl px-5"
          >
            <Plus size={16} className="mr-1.5" />
            New habit
          </Button>
        </div>
      </div>

      <div className="space-y-8 animate-in fade-in duration-500 pt-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <ListChecks size={18} />
            </div>
            <h2 className="text-note font-mono font-bold tracking-[0.1em] text-secondary">
              Daily disciplines
            </h2>
          </div>
          {archivedHabits.length > 0 && (
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="text-label font-mono uppercase tracking-widest text-muted hover:text-text transition-colors"
            >
              {showArchived
                ? "Hide archived"
                : `Show archived (${archivedHabits.length})`}
            </button>
          )}
        </div>

        {activeHabits.length === 0 && !showArchived ? (
          <div className="bg-surface/30 border border-dashed border-border/40 rounded-xl p-16 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-raised flex items-center justify-center border border-border">
              <Sparkles size={32} className="text-muted/40" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-base font-bold text-text">
                No habits defined yet
              </p>
              <p className="text-note text-muted max-w-[280px]">
                Start with something small. Follow the BJ Fogg
                methodology to build habits that last.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAdd}
              className="mt-2"
            >
              Configure your first habit
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}

            {showArchived &&
              archivedHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={!!habitToDelete}
        onClose={() => setHabitToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete habit?"
        description="This action cannot be undone. All completion history will be lost."
        confirmLabel="Delete"
        variant="danger"
      />

      <HabitFormDialog
        key={`habit-form-${selectedHabit?.id ?? 'new'}`}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        habit={selectedHabit}
        spheres={spheres}
      />
    </div>
  );
}
