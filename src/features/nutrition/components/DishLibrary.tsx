"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Trash2, Edit2, Upload, Download } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { calculateDishStats, DishWithIngredients } from "../logic/recalculator";
import { deleteDish, exportDishes } from "../actions/dishes";
import { DishImportModal } from "./DishImportModal";
import type { DishType } from "../constants/dish-types";
import { DISH_TYPE_META, DISH_TYPE_ORDER } from "../constants/dish-types";

interface DishLibraryProps {
  initialDishes: DishWithIngredients[];
}

export function DishLibrary({ initialDishes }: DishLibraryProps) {
  const router = useRouter();
  const [dishes, setDishes] = useState(initialDishes);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<DishType | null>(null);
  const [dishToDelete, setDishToDelete] = useState<DishWithIngredients | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [, startTransition] = useTransition();

  const filteredDishes = useMemo(() => {
    let result = dishes;
    if (typeFilter) {
      result = result.filter((d) => ((d as DishWithIngredients & { type?: string }).type ?? "MAIN") === typeFilter);
    }
    if (!searchQuery.trim()) return result;
    const q = searchQuery.toLowerCase();
    return result.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q)) ||
        d.ingredients.some((ing) => ing.product.name.toLowerCase().includes(q))
    );
  }, [dishes, searchQuery, typeFilter]);

  const handleCreate = () => {
    router.push("/nutrition/dishes?create=true");
  };

  const handleEdit = (dishId: string) => {
    router.push(`/nutrition/dishes?edit=${dishId}`);
  };

  const handleExport = async () => {
    const result = await exportDishes();
    if (result.success) {
      const blob = new Blob([result.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nutrition-dishes.json";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Dishes exported");
    } else {
      toast.error(result.error || "Export failed");
    }
  };

  const handleImported = () => {
    setShowImportModal(false);
    window.location.reload();
  };

  const handleDelete = () => {
    if (!dishToDelete) return;
    setIsDeleting(true);

    startTransition(async () => {
      try {
        const result = await deleteDish(dishToDelete.id);
        if (result.success) {
          setDishes((prev) => prev.filter((d) => d.id !== dishToDelete.id));
          toast.success("Dish deleted");
        } else {
          toast.error(result.error || "Delete failed");
        }
      } catch {
        toast.error("Delete failed");
      } finally {
        setIsDeleting(false);
        setDishToDelete(null);
      }
    });
  };

  const getDishCost = (dish: DishWithIngredients): number => {
    return dish.ingredients.reduce((sum, ing) => {
      const pricePer100g = ing.product.price ? ing.product.price / 100 : 0;
      return sum + pricePer100g * ing.rawWeight;
    }, 0);
  };

  const getCostPerServing = (dish: DishWithIngredients): number => {
    const totalCost = getDishCost(dish);
    const servings = dish.servings > 0 ? dish.servings : 1;
    return totalCost / servings;
  };

  return (
    <div className="space-y-4">
      {/* Search + Actions Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted opacity-50"
          />
          <Input
            placeholder="Search dishes or ingredients..."
            className="pl-9 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowImportModal(true)}>
            <Upload size={14} className="mr-1.5" /> Import JSON
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={handleExport}>
            <Download size={14} className="mr-1.5" /> Export JSON
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="rounded-xl"
            onClick={handleCreate}
          >
            <Plus size={14} className="mr-1.5" />
            Create Dish
          </Button>
        </div>
      </div>

      {/* Type Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTypeFilter(null)}
          className={`px-3 py-1.5 rounded-xl text-note font-mono border transition-all ${
            !typeFilter ? "bg-accent/10 text-accent border-accent/30 font-semibold" : "border-border text-muted hover:text-text"
          }`}
        >
          Всі
        </button>
        {DISH_TYPE_ORDER.map((t) => {
          const meta = DISH_TYPE_META[t];
          const active = typeFilter === t;
          return (
            <button
              key={t}
              onClick={() => setTypeFilter(active ? null : t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-note font-mono border transition-all ${
                active
                  ? `${meta.bg} ${meta.color} ${meta.border} font-semibold`
                  : "border-border text-muted hover:text-text"
              }`}
            >
              <span>{meta.emoji}</span>
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>

      {/* Results count */}
      {searchQuery && (
        <p className="text-note text-muted font-mono">
          {filteredDishes.length} result{filteredDishes.length !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
        </p>
      )}

      {/* Cards Grid */}
      {filteredDishes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDishes.map((dish) => {
            const stats = calculateDishStats(dish);
            const costPerServing = getCostPerServing(dish);
            const totalWeight = dish.ingredients.reduce(
              (s, ing) => s + ing.rawWeight,
              0
            );
            const kcalPer100g =
              totalWeight > 0 ? (stats.calories / totalWeight) * 100 : 0;

            return (
              <div
                key={dish.id}
                className="group bg-surface border border-border rounded-2xl p-5 hover:border-accent/30 transition-colors relative"
              >
                {/* Edit + Delete buttons */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(dish.id)}
                    className="p-1.5 hover:bg-blue-500/10 rounded-lg text-muted hover:text-blue-500 transition-colors"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => setDishToDelete(dish)}
                    className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Type Badge */}
                {(() => {
                  const t = ((dish as DishWithIngredients & { type?: string }).type ?? "MAIN") as DishType;
                  const meta = DISH_TYPE_META[t];
                  return (
                    <span className={`inline-flex items-center gap-1 text-label font-mono px-2 py-0.5 rounded-lg ${meta.bg} ${meta.color} mb-2`}>
                      {meta.emoji} {meta.label}
                    </span>
                  );
                })()}

                {/* Name */}
                <h3 className="text-lg font-semibold text-text mb-1 pr-8">
                  {dish.name}
                </h3>

                {/* Description */}
                {dish.description && (
                  <p className="text-note text-muted line-clamp-2 mb-3">
                    {dish.description}
                  </p>
                )}

                {/* Nutrition per 100g */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <span className="text-text font-mono text-base font-bold">
                      {Math.round(kcalPer100g)}
                    </span>
                    <span className="text-muted text-caption font-mono">
                      kcal/100g
                    </span>
                  </div>
                </div>

                {/* Macros */}
                <div className="flex gap-3 text-note font-mono text-secondary mb-3">
                  <span>
                    P: <b className="text-accent">{stats.protein.toFixed(1)}g</b>
                  </span>
                  <span>
                    F: <b className="text-secondary">{stats.fat.toFixed(1)}g</b>
                  </span>
                  <span>
                    C: <b className="text-text">{stats.carbs.toFixed(1)}g</b>
                  </span>
                </div>

                {/* Servings + Cost */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="text-caption font-mono text-muted">
                    {dish.servings} serving{dish.servings !== 1 ? "s" : ""}
                  </span>
                  {costPerServing > 0 && (
                    <span className="text-note font-mono text-amber-500 font-bold">
                      {costPerServing.toFixed(1)}?/serving
                    </span>
                  )}
                </div>

                {/* Ingredients preview */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {dish.ingredients.slice(0, 4).map((ing) => (
                    <span
                      key={ing.id}
                      className="text-label font-mono bg-raised px-1.5 py-0.5 rounded text-secondary border border-border/50"
                    >
                      {ing.product.name}
                    </span>
                  ))}
                  {dish.ingredients.length > 4 && (
                    <span className="text-label font-mono text-muted">
                      +{dish.ingredients.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 bg-surface border border-border rounded-2xl">
          <div className="w-16 h-16 rounded-3xl bg-raised flex items-center justify-center border border-border mb-4">
            <Plus size={32} className="text-muted/40" />
          </div>
          <p className="text-base font-bold text-text mb-1">
            {searchQuery ? "No dishes found" : "No dishes yet"}
          </p>
          <p className="text-note text-muted mb-4">
            {searchQuery
              ? "Try a different search term"
              : "Create your first recipe to get started."}
          </p>
          {!searchQuery && (
            <Button variant="primary" size="sm" onClick={handleCreate}>
              <Plus size={14} className="mr-1.5" />
              Create Dish
            </Button>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      <Dialog
        isOpen={!!dishToDelete}
        onClose={() => setDishToDelete(null)}
        title="Delete Dish?"
        description="This action cannot be undone"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDishToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      >
        <p>
          You are about to delete <strong>{dishToDelete?.name}</strong>. This
          will remove it from all meal plans.
        </p>
      </Dialog>

      <DishImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImported={handleImported}
      />
    </div>
  );
}
