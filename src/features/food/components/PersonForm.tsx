"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, UserPlus, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { NutritionPerson } from "@/app/generated/prisma/client";
import { updatePersonGoalsAction, deletePersonAction, createPersonAction } from "../actions/person-actions";

interface PersonFormProps {
  initialPersons: NutritionPerson[];
}

export function PersonForm({ initialPersons }: PersonFormProps) {
  const [persons, setPersons] = useState<NutritionPerson[]>(initialPersons);
  const [isPending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");
  const [personToDelete, setPersonToDelete] = useState<NutritionPerson | null>(null);

  // Sync state with props
  useEffect(() => {
    setPersons(initialPersons);
  }, [initialPersons]);

  const handleCreate = async () => {
    if (!newName) return;
    startTransition(async () => {
      const result = await createPersonAction(newName);
      if (result.success) {
        setPersons(prev => [...prev, result.data as NutritionPerson]);
        setNewName("");
        toast.success("Profile created");
      } else {
        toast.error(result.error || "Failed to create profile");
      }
    });
  };

  const handleGoalUpdate = async (id: string, calories: number, pPct: number, fPct: number, cPct: number, fiber: number) => {
    // Convert % to grams
    const proteinGrams = (calories * (pPct / 100)) / 4;
    const fatGrams = (calories * (fPct / 100)) / 9;
    const carbsGrams = (calories * (cPct / 100)) / 4;

    startTransition(async () => {
      const result = await updatePersonGoalsAction(id, {
        targetCalories: calories,
        targetProtein: parseFloat(proteinGrams.toFixed(1)),
        targetFat: parseFloat(fatGrams.toFixed(1)),
        targetCarbs: parseFloat(carbsGrams.toFixed(1)),
        targetFiber: fiber
      });
      
      if (result.success) {
        setPersons(prev => prev.map(p => p.id === id ? result.data as NutritionPerson : p));
        toast.success("Goals updated");
      } else {
        toast.error(result.error || "Update failed");
      }
    });
  };

  const confirmDelete = async () => {
    if (!personToDelete) return;
    startTransition(async () => {
      const result = await deletePersonAction(personToDelete.id);
      if (result.success) {
        setPersons(prev => prev.filter(p => p.id !== personToDelete.id));
        toast.success("Profile deleted");
      } else {
        toast.error(result.error || "Failed to delete profile");
      }
      setPersonToDelete(null);
    });
  };

  return (
    <div className="space-y-12">
      {/* Add New Person */}
      <div className="bg-surface border border-border p-6 rounded-2xl max-w-md">
        <h3 className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted mb-4">Add New Profile</h3>
        <div className="flex gap-2">
          <Input 
            placeholder="Person Name..." 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={isPending || !newName}>
            <UserPlus size={14} className="mr-2" /> Add
          </Button>
        </div>
      </div>

      {/* List of Persons */}
      <div className="grid grid-cols-1 gap-8">
        {persons.map((person) => {
          const totalCals = person.targetCalories || 2000;
          const currentPPct = Math.round(((person.targetProtein || 0) * 4 / totalCals) * 100);
          const currentFPct = Math.round(((person.targetFat || 0) * 9 / totalCals) * 100);
          const currentCPct = Math.round(((person.targetCarbs || 0) * 4 / totalCals) * 100);
          const sum = currentPPct + currentFPct + currentCPct;

          return (
            <div key={person.id} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-raised/50 px-6 py-4 border-b border-border flex justify-between items-center">
                <div>
                  <h4 className="text-xl font-heading text-text tracking-tight uppercase">{person.name}</h4>
                  <p className="text-[10px] font-mono text-muted uppercase tracking-wider mt-0.5">Custom Nutrition Split</p>
                </div>
                <Button variant="danger" size="sm" onClick={() => setPersonToDelete(person)}>
                  <Trash2 size={14} className="mr-2" /> Delete
                </Button>
              </div>
              
              <div className="p-8 space-y-8">
                {/* Calories Row */}
                <div className="max-w-[200px] space-y-2">
                  <label className="text-[10px] font-mono text-muted uppercase tracking-widest pl-1">Daily Calories</label>
                  <div className="flex items-center gap-3">
                    <Input 
                      type="number" 
                      defaultValue={totalCals}
                      onBlur={(e) => handleGoalUpdate(person.id, parseFloat(e.target.value), currentPPct, currentFPct, currentCPct, person.targetFiber || 30)}
                      className="text-2xl font-black text-accent h-12"
                    />
                    <span className="text-xs font-mono text-muted uppercase">kcal</span>
                  </div>
                </div>

                {/* Macros Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] font-mono text-accent uppercase tracking-widest font-bold">Protein</label>
                      <span className="text-[10px] font-mono text-muted">{(totalCals * currentPPct / 100).toFixed(0)} kcal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        defaultValue={currentPPct}
                        onBlur={(e) => handleGoalUpdate(person.id, totalCals, parseFloat(e.target.value), currentFPct, currentCPct, person.targetFiber || 30)}
                        className="font-mono text-lg"
                      />
                      <span className="text-lg font-mono text-muted">%</span>
                    </div>
                    <p className="text-[10px] text-muted/60 font-mono italic">~ {person.targetProtein}g</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] font-mono text-secondary uppercase tracking-widest font-bold">Fat</label>
                      <span className="text-[10px] font-mono text-muted">{(totalCals * currentFPct / 100).toFixed(0)} kcal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        defaultValue={currentFPct}
                        onBlur={(e) => handleGoalUpdate(person.id, totalCals, currentPPct, parseFloat(e.target.value), currentCPct, person.targetFiber || 30)}
                        className="font-mono text-lg"
                      />
                      <span className="text-lg font-mono text-muted">%</span>
                    </div>
                    <p className="text-[10px] text-muted/60 font-mono italic">~ {person.targetFat}g</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] font-mono text-text uppercase tracking-widest font-bold">Carbs</label>
                      <span className="text-[10px] font-mono text-muted">{(totalCals * currentCPct / 100).toFixed(0)} kcal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        defaultValue={currentCPct}
                        onBlur={(e) => handleGoalUpdate(person.id, totalCals, currentPPct, currentFPct, parseFloat(e.target.value), person.targetFiber || 30)}
                        className="font-mono text-lg"
                      />
                      <span className="text-lg font-mono text-muted">%</span>
                    </div>
                    <p className="text-[10px] text-muted/60 font-mono italic">~ {person.targetCarbs}g</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] font-mono text-muted uppercase tracking-widest font-bold">Fiber</label>
                      <span className="text-[10px] font-mono text-muted">Goal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        defaultValue={person.targetFiber || 30}
                        onBlur={(e) => handleGoalUpdate(person.id, totalCals, currentPPct, currentFPct, currentCPct, parseFloat(e.target.value))}
                        className="font-mono text-lg"
                      />
                      <span className="text-lg font-mono text-muted">g</span>
                    </div>
                    <p className="text-[10px] text-muted/60 font-mono italic">Recommended: 30g+</p>
                  </div>
                </div>

                {/* Split Indicator */}
                <div className="pt-4 border-t border-border/30 flex items-center gap-4">
                  <div className="flex-1 h-1.5 bg-raised rounded-full overflow-hidden flex">
                    <div style={{ width: `${currentPPct}%` }} className="bg-accent h-full transition-all" />
                    <div style={{ width: `${currentFPct}%` }} className="bg-secondary h-full transition-all" />
                    <div style={{ width: `${currentCPct}%` }} className="bg-text h-full transition-all" />
                  </div>
                  <div className="flex items-center gap-2 min-w-[100px] justify-end">
                    {sum !== 100 && <AlertCircle size={14} className="text-red-500 animate-pulse" />}
                    <span className={`font-mono text-[11px] font-bold ${sum === 100 ? 'text-accent' : 'text-red-500'}`}>
                      {sum}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog 
        isOpen={!!personToDelete} 
        onClose={() => setPersonToDelete(null)}
        title="Delete Profile?"
        description="Dangerous Action"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPersonToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={isPending}>
              Delete
            </Button>
          </>
        }
      >
        <p>You are about to delete <strong>{personToDelete?.name}</strong>. This action is irreversible and all related plans and dishes data for this person will be lost.</p>
      </Dialog>
    </div>
  );
}
