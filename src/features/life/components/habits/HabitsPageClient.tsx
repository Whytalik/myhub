"use client";

import { Button } from "@/components/ui/actions/button";
import { ConfirmationDialog } from "@/components/ui/overlays/dialog";
import { deleteHabitAction } from "@/features/life/actions/habit-actions";
import {
  deleteHabitChainAction,
  reorderHabitsInChainAction,
} from "@/features/life/actions/habit-chain-actions";
import type { HabitData, HabitChainData, LifeSphereData } from "@/features/life/types";
import { ArrowDown, ArrowUp, Edit2, Link2, ListChecks, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { HabitCard } from "./HabitCard";
import { HabitFormDialog } from "./HabitFormDialog";
import { HabitChainFormDialog } from "./HabitChainFormDialog";
import { useServerAction } from "@/lib/hooks/use-server-action";
import { useConfirmDialog } from "@/lib/hooks/use-confirm-dialog";

interface HabitsPageClientProps {
  initialHabits: HabitData[];
  initialChains: HabitChainData[];
  spheres: LifeSphereData[];
}

export function HabitsPageClient({ initialHabits, initialChains, spheres }: HabitsPageClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<HabitData | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const habitToDelete = useConfirmDialog<string>();

  const [isChainFormOpen, setIsChainFormOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState<HabitChainData | null>(null);
  const chainToDelete = useConfirmDialog<string>();
  const { run: runDeleteHabit } = useServerAction();
  const { run: runDeleteChain } = useServerAction();
  const { run: runReorder } = useServerAction();

  const activeHabits = initialHabits.filter((h) => !h.archived);
  const archivedHabits = initialHabits.filter((h) => h.archived);
  const activeChains = initialChains.filter((c) => !c.archived);

  const getISODateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const todayStr = getISODateString(new Date());
  const isCompletedToday = (habit: HabitData) =>
    habit.completions.some((c) => new Date(c.date).toISOString().slice(0, 10) === todayStr);

  const chainGroups = activeChains.map((chain) => {
    const habits = activeHabits
      .filter((h) => h.chainId === chain.id)
      .sort((a, b) => a.order - b.order);
    const nextStepIndex = habits.findIndex((h) => !isCompletedToday(h));
    return { chain, habits, nextStepIndex };
  });
  const chainedHabitIds = new Set(chainGroups.flatMap((g) => g.habits.map((h) => h.id)));
  const ungroupedHabits = activeHabits.filter((h) => !chainedHabitIds.has(h.id));

  const handleEdit = (habit: HabitData) => {
    setSelectedHabit(habit);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    habitToDelete.open(id);
  };

  const confirmDelete = () => {
    if (!habitToDelete.target) return;
    runDeleteHabit(deleteHabitAction(habitToDelete.target), {
      successMessage: "Habit deleted",
      errorMessage: "Failed to delete habit",
      onSuccess: habitToDelete.close,
      onError: habitToDelete.close,
    });
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

  const confirmDeleteChain = () => {
    if (!chainToDelete.target) return;
    runDeleteChain(deleteHabitChainAction(chainToDelete.target), {
      successMessage: "Chain deleted",
      errorMessage: "Failed to delete chain",
      onSuccess: chainToDelete.close,
      onError: chainToDelete.close,
    });
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

    runReorder(reorderHabitsInChainAction(chainId, orderedHabitIds), {
      errorMessage: "Failed to reorder chain",
    });
  };

  const showEmptyState = activeHabits.length === 0 && chainGroups.length === 0 && !showArchived;
  const reorderButtonClass =
    "p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={handleAddChain}>
          <Link2 size={16} />
          New chain
        </Button>
        <Button variant="primary" size="sm" onClick={handleAdd}>
          <Plus size={16} />
          New habit
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 text-accent">
              <ListChecks size={18} />
            </div>
            <h2 className="text-panel-title">Daily disciplines</h2>
          </div>
          {archivedHabits.length > 0 && (
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {showArchived ? "Hide archived" : `Show archived (${archivedHabits.length})`}
            </button>
          )}
        </div>

        {showEmptyState ? (
          <div className="glass-card p-8 flex flex-col items-center justify-center gap-3 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 text-accent">
              <Sparkles size={32} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-panel-title">No habits defined yet</p>
              <p className="text-caption max-w-sm">
                Start with something small. Follow the BJ Fogg methodology to build habits that
                last.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleAdd}>
              Configure your first habit
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {chainGroups.map(({ chain, habits, nextStepIndex }) => (
              <div key={chain.id} className="glass-card p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 text-accent shrink-0">
                      <Link2 size={14} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-zinc-100 truncate">
                        {chain.name}
                      </span>
                      {chain.description && (
                        <span className="text-caption truncate">{chain.description}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon-sm" onClick={() => handleEditChain(chain)}>
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      variant="ghost-danger"
                      size="icon-sm"
                      onClick={() => chainToDelete.open(chain.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                {habits.length === 0 ? (
                  <p className="text-caption">
                    No habits in this chain yet — assign one from the habit form.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {habits.map((habit, index) => (
                      <div key={habit.id} className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                          <span className="text-label">
                            {index + 1}/{habits.length}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => moveHabitInChain(chain.id, habits, index, -1)}
                              disabled={index === 0}
                              className={reorderButtonClass}
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              onClick={() => moveHabitInChain(chain.id, habits, index, 1)}
                              disabled={index === habits.length - 1}
                              className={reorderButtonClass}
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <HabitCard
                            habit={habit}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            isNextInChain={index === nextStepIndex}
                            nextHabitName={
                              index === nextStepIndex ? habits[index + 1]?.name : undefined
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {ungroupedHabits.length > 0 && (
              <div className="flex flex-col gap-3">
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
              <div className="flex flex-col gap-3 opacity-60">
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
        isOpen={habitToDelete.isOpen}
        onClose={habitToDelete.close}
        onConfirm={confirmDelete}
        title="Delete habit?"
        description="This action cannot be undone. All completion history will be lost."
        confirmLabel="Delete"
        variant="danger"
      />

      <ConfirmationDialog
        isOpen={chainToDelete.isOpen}
        onClose={chainToDelete.close}
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
