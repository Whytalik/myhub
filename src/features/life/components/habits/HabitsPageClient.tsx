"use client";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/dialog";
import { deleteHabitAction } from "@/features/life/actions/habit-actions";
import {
  deleteHabitChainAction,
  reorderHabitsInChainAction,
} from "@/features/life/actions/habit-chain-actions";
import type { HabitData, HabitChainData, LifeSphereData } from "@/features/life/types";
import { ArrowDown, ArrowUp, Edit2, Link2, ListChecks, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { HabitCard } from "./HabitCard";
import { HabitFormDialog } from "./HabitFormDialog";
import { HabitChainFormDialog } from "./HabitChainFormDialog";

interface HabitsPageClientProps {
  initialHabits: HabitData[];
  initialChains: HabitChainData[];
  spheres: LifeSphereData[];
}

export function HabitsPageClient({ initialHabits, initialChains, spheres }: HabitsPageClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<HabitData | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

  const [isChainFormOpen, setIsChainFormOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState<HabitChainData | null>(null);
  const [chainToDelete, setChainToDelete] = useState<string | null>(null);
  const [, startReorderTransition] = useTransition();

  const activeHabits = initialHabits.filter((h) => !h.archived);
  const archivedHabits = initialHabits.filter((h) => h.archived);
  const activeChains = initialChains.filter((c) => !c.archived);

  const chainGroups = activeChains.map((chain) => ({
    chain,
    habits: activeHabits.filter((h) => h.chainId === chain.id).sort((a, b) => a.order - b.order),
  }));
  const chainedHabitIds = new Set(chainGroups.flatMap((g) => g.habits.map((h) => h.id)));
  const ungroupedHabits = activeHabits.filter((h) => !chainedHabitIds.has(h.id));

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

  const handleAddChain = () => {
    setSelectedChain(null);
    setIsChainFormOpen(true);
  };

  const handleEditChain = (chain: HabitChainData) => {
    setSelectedChain(chain);
    setIsChainFormOpen(true);
  };

  const confirmDeleteChain = async () => {
    if (!chainToDelete) return;
    const result = await deleteHabitChainAction(chainToDelete);
    if (result.success) {
      toast.success("Chain deleted");
    } else {
      toast.error(result.error || "Failed to delete chain");
    }
    setChainToDelete(null);
  };

  const moveHabitInChain = (
    chainId: string,
    habits: HabitData[],
    index: number,
    direction: -1 | 1,
  ) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= habits.length) return;

    const reordered = [...habits];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    const orderedHabitIds = reordered.map((h) => h.id);

    startReorderTransition(async () => {
      const result = await reorderHabitsInChainAction(chainId, orderedHabitIds);
      if (!result.success) toast.error(result.error || "Failed to reorder chain");
    });
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="flex justify-end">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleAddChain} className="rounded-xl px-5">
            <Link2 size={16} className="mr-1.5" />
            New chain
          </Button>
          <Button variant="primary" size="sm" onClick={handleAdd} className="rounded-xl px-5">
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
              {showArchived ? "Hide archived" : `Show archived (${archivedHabits.length})`}
            </button>
          )}
        </div>

        {activeHabits.length === 0 && chainGroups.length === 0 && !showArchived ? (
          <div className="bg-surface/30 border border-dashed border-border/40 rounded-xl p-16 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-raised flex items-center justify-center border border-border">
              <Sparkles size={32} className="text-muted/40" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-base font-bold text-text">No habits defined yet</p>
              <p className="text-note text-muted max-w-[280px]">
                Start with something small. Follow the BJ Fogg methodology to build habits that
                last.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleAdd} className="mt-2">
              Configure your first habit
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {chainGroups.map(({ chain, habits }) => (
              <div key={chain.id} className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
                      <Link2 size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-note font-bold text-text">{chain.name}</span>
                      {chain.description && (
                        <span className="text-caption text-muted">{chain.description}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditChain(chain)}
                      className="p-2 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setChainToDelete(chain.id)}
                      className="p-2 rounded-lg text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {habits.length === 0 ? (
                  <p className="text-caption text-muted pl-9">
                    No habits in this chain yet — assign one from the habit form.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {habits.map((habit, index) => (
                      <div key={habit.id} className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-1 pt-6">
                          <span className="text-caption font-mono font-bold text-muted">
                            {index + 1}/{habits.length}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => moveHabitInChain(chain.id, habits, index, -1)}
                              disabled={index === 0}
                              className="p-1 rounded text-muted hover:text-accent disabled:opacity-20 disabled:hover:text-muted transition-colors"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              onClick={() => moveHabitInChain(chain.id, habits, index, 1)}
                              disabled={index === habits.length - 1}
                              className="p-1 rounded text-muted hover:text-accent disabled:opacity-20 disabled:hover:text-muted transition-colors"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="flex-1">
                          <HabitCard habit={habit} onEdit={handleEdit} onDelete={handleDelete} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {ungroupedHabits.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {ungroupedHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            {showArchived && archivedHabits.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {archivedHabits.map((habit) => (
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

      <ConfirmationDialog
        isOpen={!!chainToDelete}
        onClose={() => setChainToDelete(null)}
        onConfirm={confirmDeleteChain}
        title="Delete chain?"
        description="Habits in this chain won't be deleted — they'll just be ungrouped."
        confirmLabel="Delete"
        variant="danger"
      />

      <HabitFormDialog
        key={`habit-form-${selectedHabit?.id ?? "new"}`}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        habit={selectedHabit}
        spheres={spheres}
        chains={activeChains}
      />

      <HabitChainFormDialog
        key={`chain-form-${selectedChain?.id ?? "new"}`}
        isOpen={isChainFormOpen}
        onClose={() => setIsChainFormOpen(false)}
        chain={selectedChain}
      />
    </div>
  );
}
