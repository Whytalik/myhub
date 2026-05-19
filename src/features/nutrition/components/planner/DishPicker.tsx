"use client"

import { useState, useMemo } from "react"
import { Search, Info } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { calculateFitScore } from "@/lib/nutrition/calculations"
import type { DishType } from "../../constants/dish-types"
import { DISH_TYPE_META, DISH_TYPE_ORDER } from "../../constants/dish-types"

interface Dish {
  id: string
  name: string
  type?: DishType
  templateTotalWeight: number
  ingredients: {
    id: string
    productId: string
    productName: string
    rawWeight: number
    alternatives: string[]
  }[]
  per100g: {
    kcal: number
    protein: number
    fat: number
    carbs: number
    fiber: number
  }
}

interface DishPickerProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (dishId: string, weights: { ingredientIndex: number; weight: number; inputState?: "RAW" | "COOKED"; unit?: string | null }[]) => void
  dishes: Dish[]
  person: { targetKcal: number; proteinPct: number; fatPct: number; carbsPct: number; fiberGrams: number }
  slotName?: string
}

export function DishPicker({ isOpen, onClose, onAdd, dishes, person, slotName = "slot" }: DishPickerProps) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<DishType | null>(null)
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null)
  const [manualWeight, setManualWeight] = useState<string>("")

  const filteredDishes = useMemo(() => {
    return dishes.filter(d => {
      if (typeFilter && (d.type ?? "MAIN") !== typeFilter) return false
      return d.name.toLowerCase().includes(search.toLowerCase())
    })
  }, [dishes, search, typeFilter])

  const selectedDish = useMemo(() => {
    return dishes.find(d => d.id === selectedDishId)
  }, [dishes, selectedDishId])

  const calculatedWeight = useMemo(() => {
    if (!selectedDish) return 0
    if (manualWeight) return parseFloat(manualWeight) || 0
    const targetKcal = (person.targetKcal ?? 2000) * 0.25
    return (targetKcal * 100) / (selectedDish.per100g.kcal || 1)
  }, [selectedDish, manualWeight, person])

  const fit = useMemo(() => {
    if (!selectedDish) return null
    return calculateFitScore(selectedDish.per100g, calculatedWeight, person)
  }, [selectedDish, calculatedWeight, person])

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Додати страву до ${slotName}`} maxWidth="480px">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Пошук страви..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Type filter pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setTypeFilter(null)}
            className={`px-2.5 py-1 rounded-lg text-label font-mono border transition-all ${
              !typeFilter ? "bg-accent/10 text-accent border-accent/30" : "border-border text-muted"
            }`}
          >
            Всі
          </button>
          {DISH_TYPE_ORDER.map((t) => {
            const meta = DISH_TYPE_META[t]
            const active = typeFilter === t
            const count = dishes.filter(d => (d.type ?? "MAIN") === t).length
            if (count === 0) return null
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(active ? null : t)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-label font-mono border transition-all ${
                  active ? `${meta.bg} ${meta.color} ${meta.border}` : "border-border text-muted"
                }`}
              >
                {meta.emoji} {meta.label}
              </button>
            )
          })}
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2 pr-2">
          {filteredDishes.map((dish) => {
            const previewWeight = (person.targetKcal * 0.25 * 100) / (dish.per100g.kcal || 1)
            const previewFit = calculateFitScore(dish.per100g, previewWeight, person)
            const score = previewFit.fitScore

            return (
              <button
                key={dish.id}
                onClick={() => setSelectedDishId(dish.id)}
                className={`w-full text-left p-3 rounded-md border transition-colors ${
                  selectedDishId === dish.id ? "border-primary bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-label font-mono ${DISH_TYPE_META[dish.type ?? "MAIN"].color}`}>
                        {DISH_TYPE_META[dish.type ?? "MAIN"].emoji}
                      </span>
                      <span className="font-medium text-base">{dish.name}</span>
                    </div>
                    <div className="text-caption text-muted-foreground">
                      {dish.per100g.kcal.toFixed(0)} kcal | P: {dish.per100g.protein.toFixed(1)}g | F: {dish.per100g.fat.toFixed(1)}g
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${
                    score > 0.8 ? "text-green-600" :
                    score > 0.5 ? "text-yellow-600" :
                    "text-red-600"
                  }`}>
                    {(score * 100).toFixed(0)}%
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {selectedDish && (
          <div className="p-4 border-t bg-muted/30 space-y-3 rounded-b-lg">
            <div className="space-y-1">
              <label className="text-caption uppercase font-bold text-muted-foreground">Вага порції (г)</label>
              <Input
                type="number"
                value={manualWeight || calculatedWeight.toFixed(0)}
                onChange={(e) => setManualWeight(e.target.value)}
                placeholder={calculatedWeight.toFixed(0)}
              />
            </div>

            {fit && fit.warnings.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded text-caption text-yellow-700 dark:text-yellow-400 flex gap-2">
                <Info className="h-3 w-3 shrink-0" />
                <div>
                  {fit.warnings.map((w, i) => <div key={i}>{w}</div>)}
                </div>
              </div>
            )}

            <Button
              className="w-full"
              onClick={() => {
                const weight = calculatedWeight
                const ingredientWeights = selectedDish.ingredients.map((ing, idx) => ({
                  ingredientIndex: idx,
                  weight: (ing.rawWeight / selectedDish.templateTotalWeight) * weight,
                  inputState: "RAW" as const,
                  unit: null,
                }))
                onAdd(selectedDish.id, ingredientWeights)
                onClose()
              }}
            >
              Додати страву
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  )
}
