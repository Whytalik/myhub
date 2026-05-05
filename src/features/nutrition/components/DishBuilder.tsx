"use client";

import { useState, useMemo, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FoodProduct, CookingMethod } from "@/app/generated/prisma";
import { createDish, updateDish } from "../actions/dishes";
import type { CreateDishInput, DishIngredientInput } from "../types";
import { DishWithIngredients } from "../logic/recalculator";

interface DishBuilderProps {
  products: FoodProduct[];
  cookingMethods: CookingMethod[];
  initialDish?: DishWithIngredients | null;
}

interface IngredientRow {
  tempId: string;
  productId: string;
  productName: string;
  productCalories: number;
  productProtein: number;
  productFat: number;
  productCarbs: number;
  productFiber: number;
  productPrice: number;
  rawWeight: number;
  cookingMethodId: string;
}

interface NutritionSummary {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  totalWeight: number;
  totalCost: number;
}

function calcIngredientNutrition(ing: IngredientRow): NutritionSummary {
  const factor = ing.rawWeight / 100;
  return {
    calories: ing.productCalories * factor,
    protein: ing.productProtein * factor,
    fat: ing.productFat * factor,
    carbs: ing.productCarbs * factor,
    fiber: ing.productFiber * factor,
    totalWeight: ing.rawWeight,
    totalCost: ing.productPrice ? (ing.productPrice / 100) * ing.rawWeight : 0,
  };
}

function ProductAutocomplete({
  products,
  onSelect,
}: {
  products: FoodProduct[];
  onSelect: (p: FoodProduct) => void;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [products, query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted opacity-50"
        />
        <Input
          placeholder="Search product..."
          className="pl-8 pr-8 text-[13px]"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-text"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-1 max-h-52 overflow-y-auto">
            {filtered.map((p) => (
              <button
                key={p.id}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-raised text-[12px] transition-colors flex justify-between items-center"
                onClick={() => {
                  onSelect(p);
                  setQuery("");
                  setIsOpen(false);
                }}
              >
                <span className="font-medium">{p.name}</span>
                <span className="text-[10px] font-mono text-muted ml-2">
                  {Math.round(p.caloriesPer100)} kcal
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DishBuilder({
  products,
  cookingMethods,
  initialDish,
}: DishBuilderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(initialDish?.name || "");
  const [description, setDescription] = useState(initialDish?.description || "");
  const [servings, setServings] = useState(initialDish?.servings || 1);
  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    initialDish
      ? initialDish.ingredients.map((ing) => ({
          tempId: ing.id,
          productId: ing.productId,
          productName: ing.product.name,
          productCalories: ing.product.caloriesPer100 || 0,
          productProtein: ing.product.proteinPer100 || 0,
          productFat: ing.product.fatPer100 || 0,
          productCarbs: ing.product.carbsPer100 || 0,
          productFiber: ing.product.fiberPer100 || 0,
          productPrice: ing.product.price || 0,
          rawWeight: ing.rawWeight,
          cookingMethodId: ing.cookingMethodId || "",
        }))
      : []
  );

  const totalNutrition = useMemo((): NutritionSummary => {
    return ingredients.reduce(
      (acc, ing) => {
        const n = calcIngredientNutrition(ing);
        return {
          calories: acc.calories + n.calories,
          protein: acc.protein + n.protein,
          fat: acc.fat + n.fat,
          carbs: acc.carbs + n.carbs,
          fiber: acc.fiber + n.fiber,
          totalWeight: acc.totalWeight + n.totalWeight,
          totalCost: acc.totalCost + n.totalCost,
        };
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, totalWeight: 0, totalCost: 0 }
    );
  }, [ingredients]);

  const perServing = useMemo((): NutritionSummary => {
    const s = servings > 0 ? servings : 1;
    return {
      calories: totalNutrition.calories / s,
      protein: totalNutrition.protein / s,
      fat: totalNutrition.fat / s,
      carbs: totalNutrition.carbs / s,
      fiber: totalNutrition.fiber / s,
      totalWeight: totalNutrition.totalWeight / s,
      totalCost: totalNutrition.totalCost / s,
    };
  }, [totalNutrition, servings]);

  const addIngredient = (product: FoodProduct) => {
    if (ingredients.some((i) => i.productId === product.id)) {
      toast.error("Ingredient already added");
      return;
    }

    const defaultMethod = cookingMethods.find((m) => m.name === "RAW") || cookingMethods[0];

    const newIng: IngredientRow = {
      tempId: crypto.randomUUID().slice(0, 9),
      productId: product.id,
      productName: product.name,
      productCalories: product.caloriesPer100 || 0,
      productProtein: product.proteinPer100 || 0,
      productFat: product.fatPer100 || 0,
      productCarbs: product.carbsPer100 || 0,
      productFiber: product.fiberPer100 || 0,
      productPrice: product.price || 0,
      rawWeight: 100,
      cookingMethodId: defaultMethod?.id || "",
    };
    setIngredients((prev) => [...prev, newIng]);
  };

  const removeIngredient = (tempId: string) => {
    setIngredients((prev) => prev.filter((i) => i.tempId !== tempId));
  };

  const updateIngredient = (tempId: string, field: keyof IngredientRow, value: string | number) => {
    setIngredients((prev) =>
      prev.map((i) => (i.tempId === tempId ? { ...i, [field]: value } : i))
    );
  };

  const handleCancel = () => {
    router.push("/nutrition/dishes");
  };

  const handleSave = () => {
    if (!name.trim()) {
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
          name: name.trim(),
          description: description.trim() || undefined,
          servings,
          ingredients: ingredients.map(
            (ing): DishIngredientInput => ({
              productId: ing.productId,
              cookingMethodId: ing.cookingMethodId || undefined,
              rawWeight: ing.rawWeight,
            })
          ),
        };

        const result = initialDish
          ? await updateDish(initialDish.id, dishData)
          : await createDish(dishData);
        if (result.success) {
          toast.success(initialDish ? "Dish updated" : "Dish created successfully");
          router.push("/nutrition/dishes");
          router.refresh();
        } else {
          toast.error(result.error || (initialDish ? "Failed to update dish" : "Failed to create dish"));
        }
      } catch {
        toast.error(initialDish ? "Failed to update dish" : "Failed to create dish");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Header Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          <label className="text-[11px] font-mono text-muted tracking-wider pl-1">
            Dish Name
          </label>
          <Input
            placeholder="e.g. Morning Oatmeal with Berries"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-[15px] font-semibold"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-mono text-muted tracking-wider pl-1">
            Servings
          </label>
          <Input
            type="number"
            min={1}
            value={servings}
            onChange={(e) => setServings(parseInt(e.target.value) || 1)}
            className="font-mono"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-mono text-muted tracking-wider pl-1">
          Description (optional)
        </label>
        <Input
          placeholder="Cooking instructions or notes..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Ingredients */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-raised/30">
              <th className="px-4 py-3 font-mono text-[10px] text-muted tracking-[0.18em] font-normal">
                Product
              </th>
              <th className="px-4 py-3 font-mono text-[10px] text-muted tracking-[0.18em] font-normal w-[120px]">
                Method
              </th>
              <th className="px-4 py-3 font-mono text-[10px] text-muted tracking-[0.18em] font-normal w-[90px] text-center">
                Raw Weight
              </th>
              <th className="px-4 py-3 font-mono text-[10px] text-muted tracking-[0.18em] font-normal w-[70px] text-center border-l border-border/50">
                kcal
              </th>
              <th className="px-4 py-3 w-[40px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {ingredients.map((ing) => {
              const n = calcIngredientNutrition(ing);
              return (
                <tr key={ing.tempId} className="hover:bg-raised/30 transition-colors group">
                  <td className="px-4 py-3">
                    <span className="font-medium text-text text-[13px]">
                      {ing.productName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      variant="inline"
                      className="text-[11px] h-7"
                      value={ing.cookingMethodId}
                      onChange={(e) =>
                        updateIngredient(ing.tempId, "cookingMethodId", e.target.value)
                      }
                    >
                      {cookingMethods.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <Input
                        type="number"
                        variant="inline"
                        className="w-[65px] text-center font-mono text-accent text-[12px]"
                        value={ing.rawWeight}
                        onChange={(e) =>
                          updateIngredient(
                            ing.tempId,
                            "rawWeight",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                      <span className="text-[10px] text-muted ml-1 self-center">g</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-l border-border/50 text-center">
                    <span className="font-mono text-secondary text-[12px]">
                      {Math.round(n.calories)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => removeIngredient(ing.tempId)}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {/* Add Ingredient Row */}
            <tr>
              <td colSpan={5} className="p-3 bg-raised/20">
                <ProductAutocomplete
                  products={products}
                  onSelect={addIngredient}
                />
              </td>
            </tr>
          </tbody>

          {/* Live Preview Footer */}
          <tfoot>
            <tr className="border-t border-border bg-raised/50 font-mono text-[11px]">
              <td colSpan={3} className="px-4 py-3 font-bold text-text text-right">
                Total
              </td>
              <td className="px-4 py-3 text-center font-bold text-accent">
                {Math.round(totalNutrition.calories)}{" "}
                <span className="opacity-50 text-[9px]">kcal</span>
              </td>
              <td></td>
            </tr>
            <tr className="border-t border-border/50 font-mono text-[10px] text-muted">
              <td colSpan={3} className="px-4 py-2 text-right">
                <div className="flex justify-end gap-4">
                  <span>
                    P: <b className="text-text">{totalNutrition.protein.toFixed(1)}g</b>
                  </span>
                  <span>
                    F: <b className="text-text">{totalNutrition.fat.toFixed(1)}g</b>
                  </span>
                  <span>
                    C: <b className="text-text">{totalNutrition.carbs.toFixed(1)}g</b>
                  </span>
                  <span>
                    Fi: <b className="text-text">{totalNutrition.fiber.toFixed(1)}g</b>
                  </span>
                  <span className="border-l border-border/50 pl-4">
                    W: <b className="text-text">{Math.round(totalNutrition.totalWeight)}g</b>
                  </span>
                  {totalNutrition.totalCost > 0 && (
                    <span>
                      Cost: <b className="text-amber-500">{totalNutrition.totalCost.toFixed(1)}₴</b>
                    </span>
                  )}
                </div>
              </td>
              <td colSpan={2} className="px-4 py-2 text-center bg-accent/10">
                <div className="flex flex-col items-center">
                  <span className="text-accent font-bold text-[12px]">
                    {Math.round(perServing.calories)} kcal/serving
                  </span>
                  <span className="text-[8px] opacity-70">
                    {Math.round(perServing.totalWeight)}g · {perServing.totalCost.toFixed(1)}₴
                  </span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isPending || !name.trim() || ingredients.length === 0}
          className="min-w-[120px]"
        >
          {isPending ? "Saving..." : initialDish ? "Update Dish" : "Save Dish"}
        </Button>
      </div>
    </div>
  );
}
