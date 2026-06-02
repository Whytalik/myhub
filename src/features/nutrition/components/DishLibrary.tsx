"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Trash2, Edit2, Upload, Download, UtensilsCrossed, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { TabBar } from "@/components/ui/tab-bar";
import { calculateDishStats, DishWithIngredients } from "../logic/recalculator";
import { deleteDish, exportDishes, deleteAllUserDishes } from "../actions/dishes";
import { DishImportModal } from "./DishImportModal";
import type { DishType } from "../constants/dish-types";
import { DISH_TYPE_META, DISH_TYPE_ORDER } from "../constants/dish-types";
import dishesData from "../data/dishes.json";

interface JsonIngredient {
  productName: string;
  rawWeight: number;
  cookingMethod: string;
}

interface JsonDish {
  name: string;
  type: string;
  servings: number;
  description: string;
  ingredients: JsonIngredient[];
}

const DISH_GROUPS: Record<string, DishType[]> = {
  ALL: DISH_TYPE_ORDER,
  "Main": ["MAIN", "SOUP", "SIDE", "SALAD"],
  "Other": ["SNACK", "SAUCE", "MARINADE", "BASE"],
};

interface DishLibraryProps {
  initialDishes: DishWithIngredients[];
}

export function DishLibrary({ initialDishes }: DishLibraryProps) {
  const router = useRouter();
  const [dishes, setDishes] = useState(initialDishes);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<DishType | null>(null);
  const [selectedGroup, setSelectedGroup] = useState("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [dishToDelete, setDishToDelete] = useState<DishWithIngredients | null>(null);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [viewingDish, setViewingDish] = useState<DishWithIngredients | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
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

  const groupTabs = useMemo(() => {
    return Object.entries(DISH_GROUPS).map(([key, types]) => ({
      id: key,
      label: key,
      count: types.filter(t => dishes.some(d => ((d as DishWithIngredients & { type?: string }).type ?? "MAIN") === t)).length,
    })).filter(tab => tab.count > 0 || tab.id === "ALL");
  }, [dishes]);

  const subTabs = useMemo(() => {
    if (selectedGroup === "ALL") {
      return DISH_TYPE_ORDER.map(t => ({ id: t, label: DISH_TYPE_META[t].label, emoji: DISH_TYPE_META[t].emoji }));
    }
    return DISH_GROUPS[selectedGroup].map(t => ({ id: t, label: DISH_TYPE_META[t].label, emoji: DISH_TYPE_META[t].emoji }));
  }, [selectedGroup]);

  const displayedTypes = useMemo(() => {
    if (typeFilter) return [typeFilter];
    if (selectedGroup === "ALL") return DISH_TYPE_ORDER;
    return DISH_GROUPS[selectedGroup];
  }, [selectedGroup, typeFilter]);

  const groupedDishes = useMemo(() => {
    const groups: Record<string, DishWithIngredients[]> = {};
    filteredDishes.forEach(d => {
      const t = (d as DishWithIngredients & { type?: string }).type ?? "MAIN";
      if (!displayedTypes.includes(t as DishType)) return;
      if (!groups[t]) groups[t] = [];
      groups[t].push(d);
    });
    return groups;
  }, [filteredDishes, displayedTypes]);

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

  const handleDeleteAll = () => {
    setIsDeletingAll(true);

    startTransition(async () => {
      try {
        const result = await deleteAllUserDishes();
        if (result.success) {
          setDishes([]);
          toast.success("All dishes deleted");
          setShowDeleteAllDialog(false);
        } else {
          toast.error(result.error || "Delete failed");
        }
      } catch {
        toast.error("Delete failed");
      } finally {
        setIsDeletingAll(false);
      }
    });
  };

  const dishJsonMap = useMemo(() => {
    return new Map(
      (dishesData as unknown as JsonDish[]).map(d => [d.name, d])
    )
  }, [])

  const getDishWeights = (dish: DishWithIngredients) => {
    const dishJson = dishJsonMap.get(dish.name)
    return dishJson
      ? dishJson.ingredients.map((ing, idx) => ({ ingredientIndex: idx, rawWeight: ing.rawWeight }))
      : dish.ingredients.map((_, idx) => ({ ingredientIndex: idx, rawWeight: 0 }))
  }

  const getDishCost = (dish: DishWithIngredients): number => {
    const weights = getDishWeights(dish)
    return dish.ingredients.reduce((sum, ing, idx) => {
      const pricePer100g = ing.product.price ? ing.product.price / 100 : 0;
      return sum + pricePer100g * (weights[idx]?.rawWeight ?? 0);
    }, 0);
  };

  const getCostPerServing = (dish: DishWithIngredients): number => {
    const totalCost = getDishCost(dish);
    const servings = dish.servings > 0 ? dish.servings : 1;
    return totalCost / servings;
  };

  const isSearchMode = searchQuery.trim().length >= 2;

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
        <div className="flex flex-wrap gap-2 items-center">
          <div className="inline-flex rounded-xl border border-border overflow-hidden bg-surface">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`px-3 py-2 text-sm flex items-center gap-1 ${viewMode === "cards" ? "bg-accent/10 text-accent" : "text-muted hover:text-text"}`}
            >
              <LayoutGrid size={14} /> Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 text-sm flex items-center gap-1 ${viewMode === "list" ? "bg-accent/10 text-accent" : "text-muted hover:text-text"}`}
            >
              <List size={14} /> List
            </button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => setShowDeleteAllDialog(true)}
            disabled={isDeletingAll || dishes.length === 0}
          >
            <Trash2 size={14} className="mr-1.5" /> Delete All
          </Button>
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

      {/* Group + subcategory tabs */}
      {!isSearchMode && (
        <TabBar
          groups={groupTabs}
          activeGroup={selectedGroup}
          onGroupChange={(id) => { setSelectedGroup(id); setTypeFilter(null); }}
          subgroups={[{ id: "__all__", label: "ALL" }, ...subTabs.map(t => ({ ...t, icon: <span>{t.emoji}</span> }))]}
          activeSubgroup={typeFilter || "__all__"}
          onSubgroupChange={(id) => setTypeFilter(id === "__all__" ? null : id as DishType)}
        />
      )}

      {/* Results count */}
      {isSearchMode && (
        <p className="text-note text-muted font-mono">
          {filteredDishes.length} result{filteredDishes.length !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
        </p>
      )}

      {/* Cards/List View */}
      {filteredDishes.length > 0 ? (
        <>
          {viewMode === "cards" ? (
            <>
              {isSearchMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDishes.map((dish) => {
                    const weights = getDishWeights(dish)
                    const stats = calculateDishStats(dish, weights);
                    const costPerServing = getCostPerServing(dish);
                    const totalWeight = weights.reduce((s, w) => s + w.rawWeight, 0);
                    const kcalPer100g = totalWeight > 0 ? (stats.calories / totalWeight) * 100 : 0;

                    return (
                      <DishCard
                        key={dish.id}
                        dish={dish}
                        stats={stats}
                        costPerServing={costPerServing}
                        kcalPer100g={kcalPer100g}
                        onEdit={handleEdit}
                        onDelete={setDishToDelete}
                        onView={setViewingDish}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-8">
                  {displayedTypes.map((type) => {
                    const typeDishes = groupedDishes[type];
                    if (!typeDishes || typeDishes.length === 0) return null;
                    const meta = DISH_TYPE_META[type];

                    return (
                      <div key={type} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="h-px flex-1 bg-border" />
                          <h2 className="text-note font-bold font-mono text-muted tracking-[0.2em] uppercase">
                            {meta.emoji} {meta.label}
                          </h2>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {typeDishes.map((dish) => {
                            const weights = getDishWeights(dish)
                            const stats = calculateDishStats(dish, weights);
                            const costPerServing = getCostPerServing(dish);
                            const totalWeight = weights.reduce((s, w) => s + w.rawWeight, 0);
                            const kcalPer100g = totalWeight > 0 ? (stats.calories / totalWeight) * 100 : 0;

                            return (
                              <DishCard
                                key={dish.id}
                                dish={dish}
                                stats={stats}
                                costPerServing={costPerServing}
                                kcalPer100g={kcalPer100g}
                                onEdit={handleEdit}
                                onDelete={setDishToDelete}
                                onView={setViewingDish}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              {isSearchMode ? (
                filteredDishes.map((dish) => {
                  const weights = getDishWeights(dish)
                  const stats = calculateDishStats(dish, weights);
                  const costPerServing = getCostPerServing(dish);
                  const totalWeight = weights.reduce((s, w) => s + w.rawWeight, 0);
                  const kcalPer100g = totalWeight > 0 ? (stats.calories / totalWeight) * 100 : 0;

                  return (
                    <DishListRow
                      key={dish.id}
                      dish={dish}
                      stats={stats}
                      costPerServing={costPerServing}
                      kcalPer100g={kcalPer100g}
                      onEdit={handleEdit}
                      onDelete={setDishToDelete}
                      onView={setViewingDish}
                    />
                  );
                })
              ) : (
                displayedTypes.map((type) => {
                  const typeDishes = groupedDishes[type];
                  if (!typeDishes || typeDishes.length === 0) return null;
                  const meta = DISH_TYPE_META[type];

                  return (
                    <div key={type} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-border" />
                        <h2 className="text-note font-bold font-mono text-muted tracking-[0.2em] uppercase">
                          {meta.emoji} {meta.label}
                        </h2>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div className="space-y-3">
                        {typeDishes.map((dish) => {
                          const weights = getDishWeights(dish)
                          const stats = calculateDishStats(dish, weights);
                          const costPerServing = getCostPerServing(dish);
                          const totalWeight = weights.reduce((s, w) => s + w.rawWeight, 0);
                          const kcalPer100g = totalWeight > 0 ? (stats.calories / totalWeight) * 100 : 0;

                          return (
                            <DishListRow
                              key={dish.id}
                              dish={dish}
                              stats={stats}
                              costPerServing={costPerServing}
                              kcalPer100g={kcalPer100g}
                              onEdit={handleEdit}
                              onDelete={setDishToDelete}
                              onView={setViewingDish}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center py-16 bg-surface border border-border rounded-2xl">
          <div className="w-16 h-16 rounded-3xl bg-raised flex items-center justify-center border border-border mb-4">
            <UtensilsCrossed size={32} className="text-muted/40" />
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

      {/* Delete All Confirmation */}
      <Dialog
        isOpen={showDeleteAllDialog}
        onClose={() => setShowDeleteAllDialog(false)}
        title="Delete ALL Dishes?"
        description="This action is permanent and cannot be undone."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteAllDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAll}
              disabled={isDeletingAll}
            >
              {isDeletingAll ? "Deleting..." : "Delete All Dishes"}
            </Button>
          </>
        }
      >
        <p>
          You are about to delete <strong>ALL</strong> your custom recipes. This will also remove them from all existing meal plans.
        </p>
      </Dialog>

      <Dialog
        isOpen={!!viewingDish}
        onClose={() => setViewingDish(null)}
        title={viewingDish?.name ?? "Dish details"}
        maxWidth="640px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setViewingDish(null)}>Close</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (viewingDish) {
                  handleEdit(viewingDish.id);
                  setViewingDish(null);
                }
              }}
            >
              Edit
            </Button>
          </>
        }
      >
        {viewingDish ? (() => {
          const weights = getDishWeights(viewingDish);
          const stats = calculateDishStats(viewingDish, weights);
          const costPerServing = getCostPerServing(viewingDish);
          const totalWeight = weights.reduce((sum, w) => sum + w.rawWeight, 0);
          const kcalPer100g = totalWeight > 0 ? (stats.calories / totalWeight) * 100 : 0;

          return (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1 text-label font-mono px-2 py-0.5 rounded-lg ${DISH_TYPE_META[((viewingDish as DishWithIngredients & { type?: string }).type ?? "MAIN") as DishType].bg} ${DISH_TYPE_META[((viewingDish as DishWithIngredients & { type?: string }).type ?? "MAIN") as DishType].color}`}>
                  {DISH_TYPE_META[((viewingDish as DishWithIngredients & { type?: string }).type ?? "MAIN") as DishType].emoji} {DISH_TYPE_META[((viewingDish as DishWithIngredients & { type?: string }).type ?? "MAIN") as DishType].label}
                </span>
                <span className="text-sm font-semibold text-text">{viewingDish.description || "No description"}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-raised rounded-2xl p-4 border border-border">
                  <p className="text-label text-muted uppercase tracking-[0.2em] mb-2">Servings</p>
                  <p className="text-lg font-semibold text-text">{viewingDish.servings}</p>
                </div>
                <div className="bg-raised rounded-2xl p-4 border border-border">
                  <p className="text-label text-muted uppercase tracking-[0.2em] mb-2">Calories</p>
                  <p className="text-lg font-semibold text-text">{Math.round(kcalPer100g)} kcal / 100g</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-raised rounded-2xl p-4 border border-border">
                  <p className="text-label text-muted uppercase tracking-[0.2em] mb-2">Macros</p>
                  <p className="text-sm text-text">P {stats.protein.toFixed(1)}g · F {stats.fat.toFixed(1)}g · C {stats.carbs.toFixed(1)}g</p>
                </div>
                <div className="bg-raised rounded-2xl p-4 border border-border">
                  <p className="text-label text-muted uppercase tracking-[0.2em] mb-2">Cost</p>
                  <p className="text-sm text-text">{costPerServing > 0 ? `${costPerServing.toFixed(1)}₴/serving` : "No price"}</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-label text-muted uppercase tracking-[0.2em]">Ingredients</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {viewingDish.ingredients.map((ingredient, idx) => (
                    <div key={ingredient.id} className="rounded-2xl border border-border p-3 bg-surface">
                      <div className="font-semibold text-text">{ingredient.product.name}</div>
                      <div className="text-note text-secondary text-sm mt-1">{weights[idx]?.rawWeight ?? 0} g</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })() : null}
      </Dialog>

      <DishImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImported={handleImported}
      />
    </div>
  );
}

function DishCard({
  dish,
  stats,
  costPerServing,
  kcalPer100g,
  onEdit,
  onDelete,
  onView,
}: {
  dish: DishWithIngredients;
  stats: { calories: number; protein: number; fat: number; carbs: number; fiber: number };
  costPerServing: number;
  kcalPer100g: number;
  onEdit: (id: string) => void;
  onDelete: (dish: DishWithIngredients) => void;
  onView: (dish: DishWithIngredients) => void;
}) {
  const t = ((dish as DishWithIngredients & { type?: string }).type ?? "MAIN") as DishType;
  const meta = DISH_TYPE_META[t];

  return (
    <div
      className="group bg-surface border border-border rounded-2xl p-5 hover:border-accent/30 transition-colors relative cursor-pointer"
      onClick={() => onView(dish)}
    >
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(event) => { event.stopPropagation(); onEdit(dish.id); }}
          className="p-1.5 hover:bg-blue-500/10 rounded-lg text-muted hover:text-blue-500 transition-colors"
        >
          <Edit2 size={13} />
        </button>
        <button
          onClick={(event) => { event.stopPropagation(); onDelete(dish); }}
          className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted hover:text-red-500 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <span className={`inline-flex items-center gap-1 text-label font-mono px-2 py-0.5 rounded-lg ${meta.bg} ${meta.color} mb-2`}>
        {meta.emoji} {meta.label}
      </span>

      <h3 className="text-lg font-semibold text-text mb-1 pr-16">
        {dish.name}
      </h3>

      {dish.description && (
        <p className="text-note text-muted line-clamp-2 mb-3">
          {dish.description}
        </p>
      )}

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

      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <span className="text-caption font-mono text-muted">
          {dish.servings} serving{dish.servings !== 1 ? "s" : ""}
        </span>
        {costPerServing > 0 && (
          <span className="text-note font-mono text-amber-500 font-bold">
            {costPerServing.toFixed(1)}₴/serving
          </span>
        )}
      </div>

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
}

function DishListRow({
  dish,
  stats,
  costPerServing,
  kcalPer100g,
  onEdit,
  onDelete,
  onView,
}: {
  dish: DishWithIngredients;
  stats: { calories: number; protein: number; fat: number; carbs: number; fiber: number };
  costPerServing: number;
  kcalPer100g: number;
  onEdit: (id: string) => void;
  onDelete: (dish: DishWithIngredients) => void;
  onView: (dish: DishWithIngredients) => void;
}) {
  const t = ((dish as DishWithIngredients & { type?: string }).type ?? "MAIN") as DishType;
  const meta = DISH_TYPE_META[t];

  return (
    <div
      className="bg-surface border border-border rounded-2xl p-4 grid gap-3 sm:grid-cols-[1.9fr_1fr_0.9fr_0.8fr] items-center cursor-pointer hover:border-accent/30 transition-colors"
      onClick={() => onView(dish)}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-lg ${meta.bg} ${meta.color}`}>
            {meta.emoji} {meta.label}
          </span>
          <h3 className="text-sm font-semibold text-text truncate">{dish.name}</h3>
        </div>
        {dish.description && (
          <p className="text-note text-muted line-clamp-2">{dish.description}</p>
        )}
      </div>

      <div className="text-note text-secondary font-mono">
        <div className="font-semibold text-text">{Math.round(kcalPer100g)}</div>
        <div className="text-caption">kcal/100g</div>
      </div>

      <div className="text-note text-secondary font-mono space-y-1">
        <div>P: <span className="text-text font-semibold">{stats.protein.toFixed(1)}g</span></div>
        <div>F: <span className="text-text font-semibold">{stats.fat.toFixed(1)}g</span></div>
        <div>C: <span className="text-text font-semibold">{stats.carbs.toFixed(1)}g</span></div>
      </div>

      <div className="flex flex-col sm:items-end gap-2">
        <span className="text-note text-secondary font-mono">{dish.servings} serving{dish.servings !== 1 ? "s" : ""}</span>
        {costPerServing > 0 && (
          <span className="text-note font-mono text-amber-500 font-semibold">{costPerServing.toFixed(1)}₴/serving</span>
        )}
        <div className="flex gap-1 mt-2 sm:mt-0">
          <button
            onClick={(event) => { event.stopPropagation(); onEdit(dish.id); }}
            className="p-2 rounded-lg text-muted hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(event) => { event.stopPropagation(); onDelete(dish); }}
            className="p-2 rounded-lg text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
