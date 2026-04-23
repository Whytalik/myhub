"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Info } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ProductSearch } from "./ProductSearch";
import { Product } from "@/app/generated/prisma/client";
import { Unit } from "@/app/generated/prisma";
import { CreateDishInput, DishIngredientInput } from "../types";
import { createDishAction } from "../actions/dish-actions";
import { calculateRawIngredientStats, PlanSummary } from "../logic/recalculator";

interface CreateDishFormProps {
  userId: string;
  products: Product[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface IngredientRow extends DishIngredientInput {
  productName: string;
  tempId: string;
  calories: number;
}

export function CreateDishForm({ userId, products, onSuccess, onCancel }: CreateDishFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [yieldValue, setYieldValue] = useState(1.0);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);

  const totalNutrition = useMemo(() => {
    return ingredients.reduce((acc, ing) => {
      const p = products.find(prod => prod.id === ing.productId);
      if (!p) return acc;
      
      const stats = calculateRawIngredientStats(p, ing.amount, ing.unit);
      return {
        calories: acc.calories + stats.calories,
        protein: acc.protein + stats.protein,
        fat: acc.fat + stats.fat,
        carbs: acc.carbs + stats.carbs,
        fiber: acc.fiber + stats.fiber,
      };
    }, { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 } as PlanSummary);
  }, [ingredients, products]);

  const addIngredient = (product: Product) => {
    if (ingredients.some(ing => ing.productId === product.id)) {
      toast.error("Ingredient already added");
      return;
    }

    const newIng: IngredientRow = {
      tempId: crypto.randomUUID().slice(0, 9),
      productId: product.id,
      productName: product.name,
      amount: 100,
      unit: product.unit as Unit,
      calories: product.calories || 0,
    };
    setIngredients([...ingredients, newIng]);
  };

  const removeIngredient = (tempId: string) => {
    setIngredients(ingredients.filter(ing => ing.tempId !== tempId));
  };

  const updateIngredient = (tempId: string, field: keyof IngredientRow, value: string | number) => {
    setIngredients(ingredients.map(ing => 
      ing.tempId === tempId ? { ...ing, [field]: value } : ing
    ));
  };

  const handleSave = async () => {
    if (!name) {
      toast.error("Dish name is required");
      return;
    }
    if (ingredients.length === 0) {
      toast.error("Add at least one ingredient");
      return;
    }

    startTransition(async () => {
      try {
        const dishData: CreateDishInput = {
          userId,
          name,
          description,
          yield: yieldValue,
          ingredients: ingredients.map(({ productId, amount, unit }) => ({
            productId,
            amount,
            unit
          }))
        };

        await createDishAction(dishData);
        toast.success("Dish created successfully");
        onSuccess?.();
        router.refresh();
      } catch {
        toast.error("Failed to create dish");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Header Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-2">
          <label className="text-[11px] font-mono text-muted uppercase tracking-wider pl-1">Dish Name</label>
          <Input 
            placeholder="e.g. Morning Oatmeal with Berries" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-lg font-bold"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-mono text-muted uppercase tracking-wider pl-1">Final Yield / Factor</label>
          <div className="relative flex items-center">
            <Input 
              type="number" 
              step="0.1" 
              value={yieldValue}
              onChange={(e) => setYieldValue(parseFloat(e.target.value) || 0)}
              className="font-mono"
            />
            <span className="absolute right-3 text-[10px] text-muted font-mono opacity-50">x</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-mono text-muted uppercase tracking-wider pl-1 flex items-center gap-1.5">
          <Info size={12} /> Optional Description
        </label>
        <Input 
          placeholder="Cooking instructions or notes..." 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Ingredients Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <table className="w-full border-collapse text-left font-sans text-sm">
          <thead>
            <tr className="border-b border-border bg-raised/30">
              <th className="px-4 py-3 font-mono text-[10px] text-muted uppercase tracking-[0.18em] font-normal">Ingredient</th>
              <th className="px-4 py-3 font-mono text-[10px] text-muted uppercase tracking-[0.18em] font-normal w-[120px] text-center">Amount</th>
              <th className="px-4 py-3 font-mono text-[10px] text-muted uppercase tracking-[0.18em] font-normal w-[100px] text-center">Unit</th>
              <th className="px-4 py-3 font-mono text-[10px] text-muted uppercase tracking-[0.18em] font-normal w-[100px] text-center border-l border-border/50">Cals</th>
              <th className="px-4 py-3 w-[50px] text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {ingredients.map((ing) => (
              <tr key={ing.tempId} className="hover:bg-raised/30 transition-colors group">
                <td className="px-4 py-3 font-medium text-text">{ing.productName}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <Input
                      type="number"
                      variant="inline"
                      className="w-[60px] text-center font-mono text-accent"
                      value={ing.amount}
                      onChange={(e) => updateIngredient(ing.tempId, "amount", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <Select
                      variant="inline"
                      className="w-[80px]"
                      value={ing.unit}
                      onChange={(e) => updateIngredient(ing.tempId, "unit", e.target.value)}
                    >
                      {Object.values(Unit).map(u => <option key={u} value={u}>{u}</option>)}
                    </Select>
                  </div>
                </td>
                <td className="px-4 py-3 border-l border-border/50 text-center">
                  <span className="font-mono text-secondary">
                    {Math.round(calculateRawIngredientStats(
                      products.find(p => p.id === ing.productId)!, 
                      ing.amount, 
                      ing.unit
                    ).calories)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button 
                    onClick={() => removeIngredient(ing.tempId)}
                    className="p-1 hover:bg-red-500/10 rounded text-muted hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {/* Add Row */}
            <tr>
              <td colSpan={5} className="p-2 bg-raised/20">
                <ProductSearch 
                  products={products} 
                  onSelect={addIngredient} 
                  placeholder="Type to search and add ingredient..."
                />
              </td>
            </tr>
          </tbody>
          {/* Footer Summary */}
          <tfoot className="bg-raised/50 font-mono text-[11px] uppercase tracking-wider">
            <tr>
              <td colSpan={3} className="px-4 py-4 font-bold text-text text-right">Total Nutrition (Raw)</td>
              <td className="px-4 py-4 text-center font-bold text-accent border-l border-border/50">
                {Math.round(totalNutrition.calories)} <span className="opacity-50 text-[9px]">kcal</span>
              </td>
              <td></td>
            </tr>
            <tr className="border-t border-border/50">
              <td colSpan={3} className="px-4 py-4 text-right">
                <div className="flex justify-end gap-6 text-muted">
                  <span>P: <b className="text-text">{totalNutrition.protein.toFixed(1)}g</b></span>
                  <span>F: <b className="text-text">{totalNutrition.fat.toFixed(1)}g</b></span>
                  <span>C: <b className="text-text">{totalNutrition.carbs.toFixed(1)}g</b></span>
                  <span>Fi: <b className="text-text">{totalNutrition.fiber.toFixed(1)}g</b></span>
                </div>
              </td>
              <td className="px-4 py-4 text-center bg-accent/10 border-l border-border/50">
                <div className="flex flex-col">
                  <span className="text-accent font-bold">{Math.round(totalNutrition.calories * yieldValue)}</span>
                  <span className="text-[8px] opacity-70">Final</span>
                </div>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button 
          variant="primary" 
          onClick={handleSave} 
          disabled={isPending || !name || ingredients.length === 0}
          className="min-w-[120px]"
        >
          {isPending ? "Creating..." : "Save Dish"}
        </Button>
      </div>
    </div>
  );
}
