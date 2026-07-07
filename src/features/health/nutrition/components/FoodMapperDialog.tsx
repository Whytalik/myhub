"use client";

import { useState } from "react";
import { Search, ScanLine, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Input } from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/actions/button";
import { BarcodeScanner } from "./BarcodeScanner";
import {
  searchFatSecretFoodsAction,
  getFatSecretFoodAction,
  findFoodByBarcodeAction,
  upsertProductMappingAction,
} from "../actions/fatsecret-actions";
import type { FoodSearchResultItem, FoodDetail, FoodServing } from "@/lib/fatsecret/client";

type Mode = "search" | "scan";
type Step = "pick-food" | "pick-serving";

interface FoodMapperDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  productKey: string;
  productNameUk: string;
}

function servingGramsOf(serving: FoodServing): number | null {
  if (serving.metric_serving_unit === "g" && serving.metric_serving_amount) {
    return Number(serving.metric_serving_amount);
  }
  return null;
}

export function FoodMapperDialog({
  isOpen,
  onClose,
  onSaved,
  productKey,
  productNameUk,
}: FoodMapperDialogProps) {
  // 1. Hooks
  const [mode, setMode] = useState<Mode>("search");
  const [step, setStep] = useState<Step>("pick-food");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<FoodSearchResultItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodDetail | null>(null);
  const [manualGrams, setManualGrams] = useState("");
  const [barcodeSource, setBarcodeSource] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 2. Derived values
  const servings: FoodServing[] = selectedFood
    ? Array.isArray(selectedFood.servings.serving)
      ? selectedFood.servings.serving
      : [selectedFood.servings.serving]
    : [];
  const modeButtonClass = (target: Mode) =>
    `flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors ${
      mode === target
        ? "bg-accent-nutrition/15 text-accent-nutrition border border-accent-nutrition/20"
        : "text-zinc-400 hover:bg-white/5 border border-transparent"
    }`;

  // 3. Handlers
  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    const response = await searchFatSecretFoodsAction(query.trim());
    setIsSearching(false);
    if (!response.success) {
      toast.error(response.error);
      return;
    }
    setResults(response.data);
  };

  const handlePickFood = async (foodId: string, source: "manual" | "barcode") => {
    setBarcodeSource(source === "barcode");
    const response = await getFatSecretFoodAction(foodId);
    if (!response.success) {
      toast.error(response.error);
      return;
    }
    setSelectedFood(response.data);
    setStep("pick-serving");
  };

  const handleBarcodeDetected = async (barcode: string) => {
    const response = await findFoodByBarcodeAction(barcode);
    if (!response.success) {
      toast.error(response.error);
      return;
    }
    if (!response.data) {
      toast.error(`Штрихкод ${barcode} не знайдено в FatSecret`);
      return;
    }
    setSelectedFood(response.data);
    setBarcodeSource(true);
    setStep("pick-serving");
  };

  const handleSaveServing = async (serving: FoodServing) => {
    if (!selectedFood) return;
    const autoGrams = servingGramsOf(serving);
    const grams = autoGrams ?? Number(manualGrams);
    if (!grams || grams <= 0) {
      toast.error("Вкажіть кількість грамів для цієї порції");
      return;
    }

    setIsSaving(true);
    const response = await upsertProductMappingAction({
      productKey,
      foodId: selectedFood.food_id,
      foodName: selectedFood.food_name,
      servingId: serving.serving_id,
      servingDescription: serving.serving_description,
      servingGrams: grams,
      source: barcodeSource ? "BARCODE" : "MANUAL",
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
      description="Знайдіть продукт у FatSecret або скануйте штрихкод"
      maxWidth="560px"
    >
      <div className="flex flex-col gap-4">
        {step === "pick-food" && (
          <>
            <div className="flex gap-2">
              <button
                type="button"
                className={modeButtonClass("search")}
                onClick={() => setMode("search")}
              >
                <Search size={13} />
                Пошук
              </button>
              <button
                type="button"
                className={modeButtonClass("scan")}
                onClick={() => setMode("scan")}
              >
                <ScanLine size={13} />
                Скан штрихкоду
              </button>
            </div>

            {mode === "search" && (
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Назва продукту англійською"
                    autoFocus
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleSearch} isLoading={isSearching}>
                    Знайти
                  </Button>
                </div>

                <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
                  {results.map((food) => (
                    <button
                      key={food.food_id}
                      type="button"
                      onClick={() => handlePickFood(food.food_id, "manual")}
                      className="text-left rounded-lg p-2.5 hover:bg-white/5 transition-colors"
                    >
                      <p className="text-body">{food.food_name}</p>
                      {food.food_description && (
                        <p className="text-caption truncate">{food.food_description}</p>
                      )}
                    </button>
                  ))}
                  {!isSearching && query && results.length === 0 && (
                    <p className="text-caption text-center py-4">Нічого не знайдено</p>
                  )}
                </div>
              </div>
            )}

            {mode === "scan" && <BarcodeScanner onDetected={handleBarcodeDetected} />}
          </>
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
                return (
                  <div
                    key={serving.serving_id}
                    className="glass-card p-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-body truncate">{serving.serving_description}</p>
                      {autoGrams ? (
                        <p className="text-label">{autoGrams} г</p>
                      ) : (
                        <p className="text-label text-amber-400">грами невідомі — вкажіть вручну</p>
                      )}
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
