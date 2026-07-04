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
    <div >
      <div >
        <div >
          <Button variant="ghost" size="sm" onClick={handleAddChain} >
            <Link2 size={16} />
            New chain
          </Button>
          <Button variant="primary" size="sm" onClick={handleAdd} >
            <Plus size={16} />
            New habit
          </Button>
        </div>
      </div>

      <div >
        <div >
          <div >
            <div >
              <ListChecks size={18} />
            </div>
            <h2 >
              Daily disciplines
            </h2>
          </div>
          {archivedHabits.length > 0 && (
            <button
              onClick={() => setShowArchived(!showArchived)}

            >
              {showArchived ? "Hide archived" : `Show archived (${archivedHabits.length})`}
            </button>
          )}
        </div>

        {activeHabits.length === 0 && chainGroups.length === 0 && !showArchived ? (
          <div >
            <div >
              <Sparkles size={32} />
            </div>
            <div >
              <p >No habits defined yet</p>
              <p >
                Start with something small. Follow the BJ Fogg methodology to build habits that
                last.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleAdd} >
              Configure your first habit
            </Button>
          </div>
        ) : (
          <div >
            {chainGroups.map(({ chain, habits }) => (
              <div key={chain.id} >
                <div >
                  <div >
                    <div >
                      <Link2 size={14} />
                    </div>
                    <div >
                      <span >{chain.name}</span>
                      {chain.description && (
                        <span >{chain.description}</span>
                      )}
                    </div>
                  </div>
                  <div >
                    <button
                      onClick={() => handleEditChain(chain)}

                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setChainToDelete(chain.id)}

                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {habits.length === 0 ? (
                  <p >
                    No habits in this chain yet — assign one from the habit form.
                  </p>
                ) : (
                  <div >
                    {habits.map((habit, index) => (
                      <div key={habit.id} >
                        <div >
                          <span >
                            {index + 1}/{habits.length}
                          </span>
                          <div >
                            <button
                              onClick={() => moveHabitInChain(chain.id, habits, index, -1)}
                              disabled={index === 0}

                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              onClick={() => moveHabitInChain(chain.id, habits, index, 1)}
                              disabled={index === habits.length - 1}

                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        </div>
                        <div >
                          <HabitCard habit={habit} onEdit={handleEdit} onDelete={handleDelete} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {ungroupedHabits.length > 0 && (
              <div >
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
              <div >
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
