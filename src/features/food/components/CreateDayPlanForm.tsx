"use client";

import { Fragment, useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Calendar as CalendarIcon, ChefHat } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MealSlot } from "@/app/generated/prisma";
import { CreateDayPlanInput, DayPlanEntryInput } from "../types";
import { createDayPlanAction } from "../actions/day-plan-actions";
import { calculateDishStats, PlanSummary, DishWithIngredients } from "../logic/recalculator";

interface CreateDayPlanFormProps {
  personId: string;
  dishes: DishWithIngredients[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface EntryState extends DayPlanEntryInput {
  tempId: string;
  dishName: string;
}

export function CreateDayPlanForm({ personId, dishes, onSuccess, onCancel }: CreateDayPlanFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<EntryState[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const slots: MealSlot[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

  const filteredDishes = useMemo(() => {
    if (!searchQuery) return [];
    return dishes.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [dishes, searchQuery]);

  const totalNutrition = useMemo(() => {
    return entries.reduce((acc, entry) => {
      const dish = dishes.find(d => d.id === entry.dishId);
      if (!dish) return acc;
      
      const stats = calculateDishStats(dish);
      const servings = Number(entry.servings) || 1;
      
      return {
        calories: acc.calories + stats.calories * servings,
        protein: acc.protein + stats.protein * servings,
        fat: acc.fat + stats.fat * servings,
        carbs: acc.carbs + stats.carbs * servings,
        fiber: acc.fiber + stats.fiber * servings,
      };
    }, { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 } as PlanSummary);
  }, [entries, dishes]);

  const addEntry = (dish: DishWithIngredients) => {
    const newEntry: EntryState = {
      tempId: crypto.randomUUID().slice(0, 9),
      dishId: dish.id,
      dishName: dish.name,
      mealSlot: "LUNCH",
      servings: 1,
      priority: "FIXED",
    };
    setEntries([...entries, newEntry]);
    setSearchQuery("");
  };

  const removeEntry = (tempId: string) => {
    setEntries(entries.filter(e => e.tempId !== tempId));
  };

  const updateEntry = (tempId: string, field: keyof EntryState, value: string | number) => {
    setEntries(entries.map(e => 
      e.tempId === tempId ? { ...e, [field]: value } : e
    ));
  };

  const handleSave = async () => {
    if (entries.length === 0) {
      toast.error("Add at least one dish to the plan");
      return;
    }

    startTransition(async () => {
      try {
        const planData: CreateDayPlanInput = {
          personId,
          date: new Date(date),
          entries: entries.map(({ dishId, mealSlot, servings, priority }) => ({
            dishId,
            mealSlot,
            servings: Number(servings),
            priority
          }))
        };

        await createDayPlanAction(planData);
        toast.success("Day plan created");
        onSuccess?.();
        router.push("/food/plans");
        router.refresh();
      } catch {
        toast.error("Failed to create plan");
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Date Picker */}
      <div className="flex flex-col space-y-2 w-full max-w-[200px]">
        <label className="text-[11px] font-mono text-muted uppercase tracking-wider pl-1 flex items-center gap-2">
          <CalendarIcon size={12} /> Target Date
        </label>
        <Input 
          type="date" 
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="font-mono"
        />
      </div>

      {/* Dish Search */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono text-muted uppercase tracking-wider pl-1 flex items-center gap-2">
          <ChefHat size={12} /> Add Dish to Plan
        </label>
        <div className="relative group max-w-md">
          <Input 
            placeholder="Search dishes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4"
          />
          {searchQuery && filteredDishes.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-2xl z-[70] p-1 animate-in fade-in slide-in-from-top-1 duration-200">
              {filteredDishes.map((dish) => (
                <button
                  key={dish.id}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-raised text-[13px] transition-colors flex justify-between items-center group"
                  onClick={() => addEntry(dish)}
                >
                  <span className="font-medium group-hover:text-accent transition-colors">{dish.name}</span>
                  <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                    {Math.round(calculateDishStats(dish).calories)} kcal
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slots Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full border-collapse text-left font-sans text-sm">
          <thead>
            <tr className="border-b border-border bg-raised/30">
              <th className="px-6 py-3 font-mono text-[10px] text-muted uppercase tracking-[0.18em] font-normal">Slot</th>
              <th className="px-6 py-3 font-mono text-[10px] text-muted uppercase tracking-[0.18em] font-normal">Dish</th>
              <th className="px-6 py-3 font-mono text-[10px] text-muted uppercase tracking-[0.18em] font-normal w-[120px] text-center">Servings</th>
              <th className="px-6 py-3 font-mono text-[10px] text-muted uppercase tracking-[0.18em] font-normal w-[150px] text-center border-l border-border/50">Priority</th>
              <th className="px-6 py-3 w-[50px] text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-[13px]">
            {slots.map((slot) => {
              const slotEntries = entries.filter(e => e.mealSlot === slot);
              return (
                <Fragment key={slot}>
                  {slotEntries.length > 0 ? (
                    slotEntries.map((entry, index) => (
                      <tr key={entry.tempId} className="hover:bg-raised/30 transition-colors group">
                        <td className="px-6 py-4">
                          {index === 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-accent-muted/20 border border-accent/20 text-accent text-[10px] font-mono uppercase font-bold tracking-wider">
                              {slot}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-text">{entry.dishName}</td>
                        <td className="px-6 py-4 text-center">
                          <Input
                            type="number"
                            step="0.5"
                            variant="inline"
                            className="w-[50px] text-center font-mono text-accent"
                            value={entry.servings}
                            onChange={(e) => updateEntry(entry.tempId, "servings", e.target.value)}
                          />
                        </td>
                        <td className="px-6 py-4 border-l border-border/50">
                          <Select
                            variant="inline"
                            className="w-full"
                            value={entry.priority}
                            onChange={(e) => updateEntry(entry.tempId, "priority", e.target.value)}
                          >
                            <option value="FIXED">FIXED</option>
                            <option value="FLEXIBLE">FLEXIBLE</option>
                            <option value="AUTO">AUTO</option>
                          </Select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => removeEntry(entry.tempId)}
                            className="p-1 hover:bg-red-500/10 rounded text-muted hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="hover:bg-raised/10">
                      <td className="px-6 py-3 opacity-40 font-mono text-[10px] uppercase tracking-widest">{slot}</td>
                      <td colSpan={4} className="px-6 py-3 italic text-muted text-[11px]">No dishes planned</td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
          {/* Day Total */}
          <tfoot className="bg-accent/5 border-t border-accent/20">
            <tr>
              <td colSpan={2} className="px-6 py-6 font-mono text-[11px] uppercase tracking-[0.2em] font-bold text-text text-right">
                Daily Totals
              </td>
              <td className="px-6 py-6 text-center">
                <div className="flex flex-col">
                  <span className="text-accent font-black text-xl leading-none">{Math.round(totalNutrition.calories)}</span>
                  <span className="text-[9px] font-mono text-muted uppercase tracking-widest mt-1">kcal</span>
                </div>
              </td>
              <td className="px-6 py-6 border-l border-accent/20">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px] uppercase">
                  <div className="flex justify-between gap-2 border-b border-accent/10 pb-1">
                    <span className="text-muted">Prot</span>
                    <span className="text-text font-bold">{totalNutrition.protein.toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-accent/10 pb-1">
                    <span className="text-muted">Fat</span>
                    <span className="text-text font-bold">{totalNutrition.fat.toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-accent/10 pb-1">
                    <span className="text-muted">Carb</span>
                    <span className="text-text font-bold">{totalNutrition.carbs.toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-accent/10 pb-1">
                    <span className="text-muted">Fib</span>
                    <span className="text-text font-bold">{totalNutrition.fiber.toFixed(1)}g</span>
                  </div>
                </div>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button 
          variant="primary" 
          onClick={handleSave} 
          disabled={isPending || entries.length === 0}
          className="min-w-[140px] shadow-lg shadow-accent/10"
        >
          {isPending ? "Saving Plan..." : "Save Day Plan"}
        </Button>
      </div>
    </div>
  );
}
