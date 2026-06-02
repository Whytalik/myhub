"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, UserPlus, AlertCircle, Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { NutritionPerson, Goal } from "@/app/generated/prisma";
import { createPerson, updatePerson, deletePerson } from "../actions/persons";

interface PersonFormProps {
  persons: NutritionPerson[];
}

function ProfileCard({
  person,
  totalCals,
  currentPPct,
  currentFPct,
  currentCPct,
  sum,
  onGoalUpdate,
  onDelete,
}: {
  person: NutritionPerson;
  totalCals: number;
  currentPPct: number;
  currentFPct: number;
  currentCPct: number;
  sum: number;
  onGoalUpdate: (id: string, pPct: number, fPct: number, cPct: number, fiber: number, targetKcal: number) => void;
  onDelete: () => void;
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(person.name || "");
  const [, startTransition] = useTransition();

  const handleNameSave = () => {
    if (!editName.trim() || editName === person.name) {
      setIsEditingName(false);
      setEditName(person.name || "");
      return;
    }
    startTransition(async () => {
      const result = await updatePerson(person.id, { name: editName.trim() });
      if (result.success) {
        toast.success("Name updated");
        setIsEditingName(false);
      } else {
        toast.error(result.error || "Failed to update name");
        setEditName(person.name || "");
      }
    });
  };

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-raised/50 px-6 py-4 border-b border-border flex justify-between items-center">
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNameSave();
                  if (e.key === "Escape") { setIsEditingName(false); setEditName(person.name || ""); }
                }}
                className="text-lg font-heading h-8 border-amber-500/40 hover:border-amber-500/60 focus:border-amber-500"
                autoFocus
              />
              <button onClick={handleNameSave} className="p-1 text-accent hover:bg-accent/10 rounded">
                <Check size={14} />
              </button>
              <button onClick={() => { setIsEditingName(false); setEditName(person.name || ""); }} className="p-1 text-secondary hover:bg-white/5 rounded">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group/name">
              <h4 className="text-lg font-heading text-text tracking-tight">{person.name}</h4>
              <button
                onClick={() => { setIsEditingName(true); setEditName(person.name || ""); }}
                className="p-0.5 text-secondary opacity-0 group-hover/name:opacity-100 hover:text-accent transition-all"
              >
                <Pencil size={12} />
              </button>
            </div>
          )}
          <p className="text-caption font-mono text-secondary tracking-wider mt-0.5">Custom Nutrition Split</p>
        </div>
        <Button variant="danger" size="sm" className="rounded-xl" onClick={onDelete}>
          <Trash2 size={14} className="mr-1.5" /> Delete
        </Button>
      </div>

      <div className="p-6 space-y-6">
        <div className="max-w-[200px] space-y-2">
          <label className="text-caption font-mono text-secondary tracking-widest pl-1">Daily Calories</label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              defaultValue={totalCals}
              onBlur={(e) => onGoalUpdate(person.id, currentPPct, currentFPct, currentCPct, person.fiberGrams || 30, parseFloat(e.target.value) || 2000)}
              className="text-lg font-black text-accent h-9 border-amber-500/40 hover:border-amber-500/60 focus:border-amber-500"
            />
            <span className="text-sm font-mono text-secondary">kcal</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-caption font-mono text-rose-400 tracking-widest font-bold">Protein</label>
              <span className="text-caption font-mono text-rose-400/80">{(totalCals * currentPPct / 100 / 4).toFixed(0)}g</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                defaultValue={currentPPct}
                onBlur={(e) => onGoalUpdate(person.id, parseFloat(e.target.value) || 30, currentFPct, currentCPct, person.fiberGrams || 30, totalCals)}
                className="font-mono text-lg text-rose-400 border-rose-500/20 hover:border-rose-500/40 focus:border-rose-500 focus:ring-rose-500/20 bg-surface"
              />
              <span className="text-sm font-mono text-rose-400/70">%</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-caption font-mono text-amber-400 tracking-widest font-bold">Fat</label>
              <span className="text-caption font-mono text-amber-400/80">{(totalCals * currentFPct / 100 / 9).toFixed(0)}g</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                defaultValue={currentFPct}
                onBlur={(e) => onGoalUpdate(person.id, currentPPct, parseFloat(e.target.value) || 25, currentCPct, person.fiberGrams || 30, totalCals)}
                className="font-mono text-lg text-amber-400 border-amber-500/20 hover:border-amber-500/40 focus:border-amber-500 focus:ring-amber-500/20 bg-surface"
              />
              <span className="text-sm font-mono text-amber-400/70">%</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-caption font-mono text-sky-400 tracking-widest font-bold">Carbs</label>
              <span className="text-caption font-mono text-sky-400/80">{(totalCals * currentCPct / 100 / 4).toFixed(0)}g</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                defaultValue={currentCPct}
                onBlur={(e) => onGoalUpdate(person.id, currentPPct, currentFPct, parseFloat(e.target.value) || 45, person.fiberGrams || 30, totalCals)}
                className="font-mono text-lg text-sky-400 border-sky-500/20 hover:border-sky-500/40 focus:border-sky-500 focus:ring-sky-500/20 bg-surface"
              />
              <span className="text-sm font-mono text-sky-400/70">%</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-caption font-mono text-emerald-400 tracking-widest font-bold">Fiber</label>
              <span className="text-caption font-mono text-emerald-400/80">Goal</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                defaultValue={person.fiberGrams || 30}
                onBlur={(e) => onGoalUpdate(person.id, currentPPct, currentFPct, currentCPct, parseFloat(e.target.value) || 30, totalCals)}
                className="font-mono text-lg text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40 focus:border-emerald-500 focus:ring-emerald-500/20 bg-surface"
              />
              <span className="text-sm font-mono text-emerald-400/70">g</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border/30 flex items-center gap-4">
          <div className="flex-1 h-1.5 bg-raised rounded-full overflow-hidden flex">
            <div style={{ width: `${currentPPct}%` }} className="bg-rose-500 h-full transition-all" />
            <div style={{ width: `${currentFPct}%` }} className="bg-amber-500 h-full transition-all" />
            <div style={{ width: `${currentCPct}%` }} className="bg-sky-500 h-full transition-all" />
          </div>
          <div className="flex items-center gap-2 min-w-[100px] justify-end">
            {sum !== 100 && <AlertCircle size={14} className="text-red-500 animate-pulse" />}
            <span className={`font-mono text-note font-bold ${sum === 100 ? 'text-emerald-400' : 'text-red-500'}`}>
              {sum}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PersonForm({ persons: initialPersons }: PersonFormProps) {
  const [persons, setPersons] = useState<NutritionPerson[]>(initialPersons);
  const [isPending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");
  const [personToDelete, setPersonToDelete] = useState<NutritionPerson | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    setPersons(initialPersons);
  }, [initialPersons]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    startTransition(async () => {
      const result = await createPerson({
        name: newName.trim(),
        goal: Goal.MAINTAIN,
        targetKcal: 2000,
        proteinPct: 30,
        fatPct: 25,
        carbsPct: 45,
        fiberGrams: 30,
      });
      if (result.success) {
        setPersons(prev => [...prev, result.data]);
        setNewName("");
        setShowCreateModal(false);
        toast.success("Profile created");
      } else {
        toast.error(result.error || "Failed to create profile");
      }
    });
  };

  const handleGoalUpdate = async (id: string, pPct: number, fPct: number, cPct: number, fiber: number, targetKcal: number) => {
    startTransition(async () => {
      const result = await updatePerson(id, {
        targetKcal,
        proteinPct: pPct,
        fatPct: fPct,
        carbsPct: cPct,
        fiberGrams: fiber,
      });

      if (result.success) {
        setPersons(prev => prev.map(p => p.id === id ? result.data : p));
        toast.success("Goals updated");
      } else {
        toast.error(result.error || "Update failed");
      }
    });
  };

  const confirmDelete = async () => {
    if (!personToDelete) return;
    startTransition(async () => {
      const result = await deletePerson(personToDelete.id);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-caption font-mono text-secondary tracking-wider">{persons.length} profile{persons.length !== 1 ? "s" : ""}</p>
        <Button variant="primary" size="sm" className="rounded-xl" onClick={() => setShowCreateModal(true)}>
          <UserPlus size={14} className="mr-1.5" /> Add Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {persons.map((person) => {
          const totalCals = person.targetKcal || 2000;
          const currentPPct = person.proteinPct || 30;
          const currentFPct = person.fatPct || 25;
          const currentCPct = person.carbsPct || 45;
          const sum = currentPPct + currentFPct + currentCPct;

          return (
            <ProfileCard
              key={person.id}
              person={person}
              totalCals={totalCals}
              currentPPct={currentPPct}
              currentFPct={currentFPct}
              currentCPct={currentCPct}
              sum={sum}
              onGoalUpdate={handleGoalUpdate}
              onDelete={() => setPersonToDelete(person)}
            />
          );
        })}
      </div>

      <Dialog
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setNewName(""); }}
        title="Add New Profile"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowCreateModal(false); setNewName(""); }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} disabled={isPending || !newName.trim()}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="text-caption font-mono text-secondary tracking-wider">Profile Name</label>
          <Input
            placeholder="e.g. John, Kids, etc."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="border-amber-500/40 hover:border-amber-500/60 focus:border-amber-500"
            autoFocus
          />
        </div>
      </Dialog>

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
        <p>You are about to delete <strong>{personToDelete?.name}</strong>. This action is irreversible.</p>
      </Dialog>
    </div>
  );
}
