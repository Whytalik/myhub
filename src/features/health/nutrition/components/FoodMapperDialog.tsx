"use client";

import { useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Input } from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/actions/button";
import {
  getFatSecretFavoritesAction,
  getFatSecretFoodAction,
  upsertProductMappingAction,
  searchFatSecretFoodAction,
  getFatSecretMostEatenAction,
  getFatSecretRecentlyEatenAction,
  type ProfileFavorite,
} from "../actions/fatsecret-actions";
import { PROFILES } from "../data";
import type { FoodDetail, FoodServing, FoodSearchResultItem } from "@/lib/fatsecret/client";

type Step = "pick-food" | "pick-serving";

interface FoodMapperDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  productKey: string;
  productNameUk: string;
}

/** Grams the serving's macro figures correspond to (metric_serving_amount) — always the macro basis. */
function servingGramsOf(serving: FoodServing): number | null {
  if (serving.metric_serving_unit === "g" && serving.metric_serving_amount) {
    return Number(serving.metric_serving_amount);
  }
  return null;
}

/**
 * Push multiplier for food_entry.create (numberOfUnits = grams / this value).
 * FatSecret treats "g"/"ml" servings as continuous — number_of_units IS the raw
 * gram/ml quantity there, so the multiplier is 1, not metric_serving_amount.
 * Confirmed by an earlier gram-logging fix (see git history on fatsecret-mapping.ts).
 */
function pushServingGramsOf(serving: FoodServing, metricGrams: number): number {
  const measurement = serving.measurement_description?.toLowerCase();
  return measurement === "g" || measurement === "ml" ? 1 : metricGrams;
}

function servingMacrosLabel(serving: FoodServing): string | null {
  if (!serving.calories) return null;
  const protein = Number(serving.protein ?? 0);
  const fat = Number(serving.fat ?? 0);
  const carbs = Number(serving.carbohydrate ?? 0);
  return `${serving.calories} ккал · Б${protein} Ж${fat} В${carbs}`;
}

function profileNameOf(profileId: string): string {
  return PROFILES.find((p) => p.id === profileId)?.name ?? profileId;
}

export function FoodMapperDialog({
  isOpen,
  onClose,
  onSaved,
  productKey,
  productNameUk,
}: FoodMapperDialogProps) {
  // 1. Hooks
  const [step, setStep] = useState<Step>("pick-food");
  const [selectedFood, setSelectedFood] = useState<FoodDetail | null>(null);
  const [selectedServingId, setSelectedServingId] = useState<string | null>(null);
  const [manualGrams, setManualGrams] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState(productNameUk);
  const [searchResults, setSearchResults] = useState<FoodSearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFetchingFood, setIsFetchingFood] = useState(false);

  // List tabs state
  const [activeTab, setActiveTab] = useState<"favorites" | "most-eaten" | "recently-eaten">("favorites");
  const [listData, setListData] = useState<ProfileFavorite[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingList(true);
    setListError(null);

    const loadData = async () => {
      let response;
      if (activeTab === "favorites") {
        response = await getFatSecretFavoritesAction();
      } else if (activeTab === "most-eaten") {
        response = await getFatSecretMostEatenAction();
      } else {
        response = await getFatSecretRecentlyEatenAction();
      }

      if (cancelled) return;
      setIsLoadingList(false);
      if (!response.success) {
        setListError(response.error);
        return;
      }
      setListData(response.data);
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  // 2. Derived values
  const servings: FoodServing[] = selectedFood
    ? Array.isArray(selectedFood.servings.serving)
      ? selectedFood.servings.serving
      : [selectedFood.servings.serving]
    : [];

  // 3. Handlers
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setHasSearched(false);
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const response = await searchFatSecretFoodAction(searchQuery);
    setIsSearching(false);
    if (!response.success) {
      toast.error(response.error);
      return;
    }
    setSearchResults(response.data);
    setHasSearched(true);
  };

  const handlePickSearchResult = async (food: FoodSearchResultItem) => {
    setSelectedServingId(null);
    setIsFetchingFood(true);
    const response = await getFatSecretFoodAction(food.food_id);
    setIsFetchingFood(false);
    if (!response.success) {
      toast.error(response.error);
      return;
    }
    setSelectedFood(response.data);
    setStep("pick-serving");
  };

  const handlePickFavorite = async (favorite: ProfileFavorite) => {
    setSelectedServingId(favorite.food.serving_id ?? null);
    setIsFetchingFood(true);
    const response = await getFatSecretFoodAction(favorite.food.food_id, favorite.profile);
    setIsFetchingFood(false);
    if (!response.success) {
      toast.error(response.error);
      return;
    }
    setSelectedFood(response.data);
    setStep("pick-serving");
  };

  const handleSaveServing = async (serving: FoodServing) => {
    if (!selectedFood) return;
    const autoGrams = servingGramsOf(serving);
    const macroGrams = autoGrams ?? Number(manualGrams);
    if (!macroGrams || macroGrams <= 0) {
      toast.error("Вкажіть кількість грамів для цієї порції");
      return;
    }
    // Without metric data we can't tell "g"-type from discrete servings — manual entry
    // falls back to a 1:1 push multiplier, matching how the static seed file treats them.
    const pushGrams = autoGrams ? pushServingGramsOf(serving, autoGrams) : macroGrams;

    setIsSaving(true);
    const response = await upsertProductMappingAction({
      productKey,
      foodId: selectedFood.food_id,
      foodName: selectedFood.food_name,
      servingId: serving.serving_id,
      servingDescription: serving.serving_description,
      servingGrams: pushGrams,
      macroGrams,
      kcal: Number(serving.calories ?? 0),
      protein: Number(serving.protein ?? 0),
      fat: Number(serving.fat ?? 0),
      carbs: Number(serving.carbohydrate ?? 0),
      source: "MANUAL",
    });
    setIsSaving(false);

    if (!response.success) {
      toast.error(response.error);
      return;
    }
    toast.success(`${productNameUk} замаплено на ${selectedFood.food_name}`);
    onSaved();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Мапувати: ${productNameUk}`}
      description="Оберіть продукт з пошуку або ваших списків FatSecret"
      maxWidth="560px"
    >
      <div className="flex flex-col gap-4">
        {step === "pick-food" && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Пошук продуктів у FatSecret..."
                className="flex-1"
              />
              <Button type="button" onClick={handleSearch} isLoading={isSearching}>
                Пошук
              </Button>
            </div>

            {isFetchingFood && (
              <div className="flex items-center justify-center gap-2 text-caption py-4">
                <Loader2 size={14} className="animate-spin" />
                Отримання деталей продукту...
              </div>
            )}

            {!isFetchingFood && (
              <>
                {/* Tab selectors for quick access lists */}
                <div className="flex border-b border-white/[0.06] mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("favorites");
                      setHasSearched(false);
                    }}
                    className={`pb-2 px-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      activeTab === "favorites" && !hasSearched
                        ? "border-b-2 border-accent-nutrition text-accent-nutrition"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Улюблені
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("most-eaten");
                      setHasSearched(false);
                    }}
                    className={`pb-2 px-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      activeTab === "most-eaten" && !hasSearched
                        ? "border-b-2 border-accent-nutrition text-accent-nutrition"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Часті
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("recently-eaten");
                      setHasSearched(false);
                    }}
                    className={`pb-2 px-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      activeTab === "recently-eaten" && !hasSearched
                        ? "border-b-2 border-accent-nutrition text-accent-nutrition"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Недавні
                  </button>
                </div>

                {hasSearched ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-label text-zinc-400 font-semibold uppercase tracking-wide text-xs">
                      Результати пошуку
                    </span>

                    {searchResults.length === 0 ? (
                      <p className="text-caption text-center py-6">Нічого не знайдено</p>
                    ) : (
                      <div className="flex flex-col gap-1 max-h-96 overflow-y-auto">
                        {searchResults.map((result) => (
                          <button
                            key={result.food_id}
                            type="button"
                            onClick={() => handlePickSearchResult(result)}
                            className="text-left rounded-lg p-2.5 hover:bg-white/5 transition-colors flex flex-col gap-0.5"
                          >
                            <p className="text-body truncate font-medium">{result.food_name}</p>
                            {result.food_description && (
                              <p className="text-caption truncate">{result.food_description}</p>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {isLoadingList && (
                      <div className="flex items-center justify-center gap-2 text-caption py-6">
                        <Loader2 size={14} className="animate-spin" />
                        Завантаження списку...
                      </div>
                    )}

                    {listError && <p className="text-caption text-rose-400">{listError}</p>}

                    {!isLoadingList && !listError && listData.length === 0 && (
                      <p className="text-caption text-center py-6 text-zinc-400">
                        Список порожній. Спробуйте скористатися пошуком вище.
                      </p>
                    )}

                    <div className="flex flex-col gap-1 max-h-96 overflow-y-auto">
                      {listData.map((favorite, idx) => (
                        <button
                          key={`${favorite.profile}-${favorite.food.food_id}-${favorite.food.serving_id ?? "unknown"}-${idx}`}
                          type="button"
                          onClick={() => handlePickFavorite(favorite)}
                          className="text-left rounded-lg p-2.5 hover:bg-white/5 transition-colors flex items-start gap-2"
                        >
                          <Star size={13} className="text-accent-nutrition shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-body truncate">{favorite.food.food_name}</p>
                            {favorite.food.food_description && (
                              <p className="text-caption truncate">{favorite.food.food_description}</p>
                            )}
                            <p className="text-label">{profileNameOf(favorite.profile)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {step === "pick-serving" && selectedFood && (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setStep("pick-food")}
              className="text-caption text-left hover:text-zinc-200 transition-colors"
            >
              ← Обрати інший продукт
            </button>
            <p className="text-panel-title">{selectedFood.food_name}</p>

            <div className="flex flex-col gap-1">
              {servings.map((serving) => {
                const autoGrams = servingGramsOf(serving);
                const macrosLabel = servingMacrosLabel(serving);
                const isFavorited = serving.serving_id === selectedServingId;
                const cardClass = `glass-card p-3 flex items-center justify-between gap-3 ${
                  isFavorited ? "border border-accent-nutrition/40" : ""
                }`;
                return (
                  <div key={serving.serving_id} className={cardClass}>
                    <div className="min-w-0">
                      <p className="text-body truncate">
                        {serving.serving_description}
                        {isFavorited && (
                          <span className="text-label text-accent-nutrition"> · улюблене</span>
                        )}
                      </p>
                      {autoGrams ? (
                        <p className="text-label">{autoGrams} г</p>
                      ) : (
                        <p className="text-label text-amber-400">грами невідомі — вкажіть вручну</p>
                      )}
                      {macrosLabel && <p className="text-label truncate">{macrosLabel}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!autoGrams && (
                        <Input
                          type="number"
                          value={manualGrams}
                          onChange={(e) => setManualGrams(e.target.value)}
                          placeholder="грами"
                          className="w-20 text-right"
                        />
                      )}
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSaveServing(serving)}
                        isLoading={isSaving}
                      >
                        Обрати
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isSaving && (
          <div className="flex items-center justify-center gap-2 text-caption">
            <Loader2 size={14} className="animate-spin" />
            Збереження...
          </div>
        )}
      </div>
    </Dialog>
  );
}
