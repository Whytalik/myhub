"use client"

import { useState, useTransition, useCallback } from "react"
import { Plus, Trash2, Search, Flame, UtensilsCrossed, Clock, StickyNote, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DishPicker } from "./DishPicker"
import { removeDishFromSlot, addDishToSlot, updateDishEntryIngredient, addProductToSlot, updateProductEntryWeight, removeProductFromSlot, deleteWeekPlan, updateWeekPlanName, updateWeekPlanNotes, updateDayPrepNote } from "../../actions/planning"
import { toast } from "sonner"
import type { DishType } from "../../constants/dish-types"
import { useRouter } from "next/navigation"

import { MacroSummary } from "./MacroSummary"
import { Tabs } from "@/components/ui/tabs"

const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"]

const MEAL_COLORS: Record<string, { bg: string; border: string; icon: string; badge: string; hover: string }> = {
  "Передтрен": { bg: "bg-purple-500/[0.04]", border: "border-purple-500/40", icon: "bg-purple-500/10 text-purple-400", badge: "bg-purple-500/15 text-purple-400", hover: "hover:bg-purple-500/[0.04]" },
  "Сніданок": { bg: "bg-amber-500/[0.04]", border: "border-amber-500/40", icon: "bg-amber-500/10 text-amber-400", badge: "bg-amber-500/15 text-amber-400", hover: "hover:bg-amber-500/[0.04]" },
  "Обід": { bg: "bg-emerald-500/[0.04]", border: "border-emerald-500/40", icon: "bg-emerald-500/10 text-emerald-400", badge: "bg-emerald-500/15 text-emerald-400", hover: "hover:bg-emerald-500/[0.04]" },
  "Вечеря": { bg: "bg-blue-500/[0.04]", border: "border-blue-500/40", icon: "bg-blue-500/10 text-blue-400", badge: "bg-blue-500/15 text-blue-400", hover: "hover:bg-blue-500/[0.04]" },
}

const DEFAULT_MEAL_COLOR = { bg: "bg-gray-500/[0.04]", border: "border-gray-500/40", icon: "bg-gray-500/10 text-gray-400", badge: "bg-gray-500/15 text-gray-400", hover: "hover:bg-gray-500/[0.04]" }

function getMealColor(name: string) {
  return MEAL_COLORS[name] || DEFAULT_MEAL_COLOR
}

interface WeekPlannerProps {
  weekPlan: {
    id: string
    name: string | null
    notes: string
    persons: {
      id: string
      name: string | null
      goal: string
      targetKcal: number
      proteinPct: number
      fatPct: number
      carbsPct: number
      fiberGrams: number
    }[]
    days: {
      dayPlanId: string
      dayOfWeek: number
      activity: string | null
      prepNote: { id: string; content: string; steps: string[] } | null
      slots: {
        id: string
        personId: string
        personName: string | null
        name: string
        timeWindow: string | null
        order: number
        targetKcal: number
        targetFiberGrams: number
        locked: boolean
        actualKcal: number
        actualProtein: number
        actualFat: number
        actualCarbs: number
        actualFiber: number
        entries: {
          id: string
          dishId: string
          dishName: string
          dishType: string
          dishServings: number
          nutrition: {
            kcal: number
            protein: number
            fat: number
            carbs: number
            fiber: number
          }
          ingredients: {
            id: string
            productId: string
            productName: string
            cookingMethodName: string | null
            coefficient: number
            alternatives: string[]
            ingredientIndex: number
            weight: number
            inputState: string
            rawWeight: number
            cookedWeight: number
            unit: string | null
          }[]
          selectedAlternatives: Record<string, string | null>
        }[]
        productEntries: {
          id: string
          productId: string
          productName: string
          portionWeight: number
          kcal: number
          protein: number
          fat: number
          carbs: number
          fiber: number
        }[]
      }[]
    }[]
  }
  dishes: {
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
  }[]
  products: {
    id: string
    name: string
    caloriesPer100: number
    proteinPer100: number
    fatPer100: number
    carbsPer100: number
    fiberPer100: number
    unit: string
    standardPackageAmount: number
  }[]
}

function PersonMacroChip({ name, kcal, protein, fat, carbs, fiber }: { name: string; kcal: number; protein: number; fat: number; carbs: number; fiber: number }) {
  const maxKcal = Math.max(kcal, 1)
  const proteinPct = Math.min((protein * 4 / maxKcal) * 100, 100)
  const fatPct = Math.min((fat * 9 / maxKcal) * 100, 100)
  const carbsPct = Math.min((carbs * 4 / maxKcal) * 100, 100)

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border min-w-0">
      <span className="text-caption font-semibold text-text-primary shrink-0">{name}</span>
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <div className="flex-1 h-1.5 bg-raised rounded-full overflow-hidden flex max-w-[140px]">
          <div style={{ width: `${proteinPct}%` }} className="bg-accent h-full" />
          <div style={{ width: `${fatPct}%` }} className="bg-secondary h-full" />
          <div style={{ width: `${carbsPct}%` }} className="bg-text/40 h-full" />
        </div>
        <span className="text-caption font-mono text-text-muted shrink-0">{kcal.toFixed(0)}</span>
      </div>
      <div className="hidden sm:flex items-center gap-1 text-caption font-mono text-text-muted shrink-0">
        <span className="text-accent">Б{protein.toFixed(0)}</span>
        <span className="text-secondary">Ж{fat.toFixed(0)}</span>
        <span>В{carbs.toFixed(0)}</span>
        <span>К{fiber.toFixed(1)}</span>
      </div>
    </div>
  )
}

export function WeekPlanner({ weekPlan, dishes, products }: WeekPlannerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState(weekPlan.name || "")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [pickerConfig, setPickerConfig] = useState<{
    slotId: string
    person: { targetKcal: number; proteinPct: number; fatPct: number; carbsPct: number; fiberGrams: number }
    slotName: string
  } | null>(null)
  const [productPickerSlotId, setProductPickerSlotId] = useState<string | null>(null)
  const [productSearch, setProductSearch] = useState("")
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [productWeight, setProductWeight] = useState("100")
  const [editingIngredient, setEditingIngredient] = useState<{ entryId: string; ingredientIndex: number; weight: string } | null>(null)
  const [editingProduct, setEditingProduct] = useState<{ id: string; productId: string; weight: string } | null>(null)
  const [notes, setNotes] = useState(weekPlan.notes || "")
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [localNotes, setLocalNotes] = useState(weekPlan.notes || "")
  const [editingCookingDayId, setEditingCookingDayId] = useState<string | null>(null)
  const [localCooking, setLocalCooking] = useState("")

  function getMealSlotNames(day: typeof weekPlan.days[number]) {
    const names = new Set<string>()
    day.slots.forEach(s => names.add(s.name))
    return [...names].sort((a, b) => {
      const slotA = day.slots.find(s => s.name === a)
      const slotB = day.slots.find(s => s.name === b)
      return (slotA?.order ?? 0) - (slotB?.order ?? 0)
    })
  }

  const handleAddDish = (dishId: string, weights: { ingredientIndex: number; weight: number; inputState?: "RAW" | "COOKED"; unit?: string | null }[]) => {
    if (!pickerConfig) return

    startTransition(async () => {
      const result = await addDishToSlot(
        pickerConfig.slotId,
        dishId,
        weights.map(w => ({
          ingredientIndex: w.ingredientIndex,
          weight: w.weight,
          inputState: w.inputState as "RAW" | "COOKED" | undefined,
          unit: w.unit ?? undefined,
        })),
      )

      if (result.success) {
        toast.success("Dish added")
      } else {
        toast.error(result.error || "Failed to add dish")
      }
    })
  }

  const UNIT_LABELS: Record<string, string> = { GRAM: "г", ML: "мл", PIECE: "шт", TBSP: "ст.л.", TSP: "ч.л." }
  const NON_GRAM_UNITS = new Set(["PIECE", "TBSP", "TSP"])

  const selectedProduct = products.find(p => p.id === selectedProductId)
  const selectedUnit = selectedProduct?.unit ?? "GRAM"
  const selectedUnitLabel = UNIT_LABELS[selectedUnit] ?? selectedUnit
  const portionMultiplier = NON_GRAM_UNITS.has(selectedUnit) ? (selectedProduct?.standardPackageAmount ?? 1) : 1

  function getProductUnitLabel(unit: string) { return UNIT_LABELS[unit] ?? unit }
  function toDisplayAmount(grams: number, unit: string, stdPkg: number): string {
    if (!NON_GRAM_UNITS.has(unit)) return grams.toFixed(0)
    return Math.round(grams / stdPkg).toString()
  }
  function toGrams(displayAmount: number, unit: string, stdPkg: number): number {
    return NON_GRAM_UNITS.has(unit) ? displayAmount * stdPkg : displayAmount
  }

  const handleAddProduct = () => {
    if (!productPickerSlotId || !selectedProductId) return
    const amount = parseFloat(productWeight)
    if (!amount || amount <= 0) { toast.error("Enter valid amount"); return }
    const portionWeight = toGrams(amount, selectedUnit, portionMultiplier)

    startTransition(async () => {
      const result = await addProductToSlot(productPickerSlotId, selectedProductId, portionWeight)
      if (result.success) {
        toast.success("Product added")
        setProductPickerSlotId(null)
        setSelectedProductId(null)
        setProductSearch("")
        setProductWeight("1")
      } else {
        toast.error(result.error || "Failed to add product")
      }
    })
  }

  const handleDeletePlan = () => {
    startTransition(async () => {
      const result = await deleteWeekPlan(weekPlan.id)
      if (result.success) {
        toast.success("Plan deleted")
        router.push("/nutrition/plans")
      } else {
        toast.error(result.error || "Failed to delete plan")
      }
    })
  }

  const handleUpdateName = () => {
    if (!newName.trim()) return
    startTransition(async () => {
      const result = await updateWeekPlanName(weekPlan.id, newName)
      if (result.success) {
        toast.success("Name updated")
        setIsEditingName(false)
      } else {
        toast.error(result.error || "Failed to update name")
      }
    })
  }

  const handleSaveNotes = useCallback(() => {
    startTransition(async () => {
      const result = await updateWeekPlanNotes(weekPlan.id, localNotes)
      if (result.success) {
        setNotes(localNotes)
        setIsEditingNotes(false)
        toast.success("Notes saved")
      } else {
        toast.error(result.error || "Failed to save notes")
      }
    })
  }, [weekPlan.id, localNotes])

  const handleSaveCooking = useCallback((dayPlanId: string) => {
    startTransition(async () => {
      const result = await updateDayPrepNote(dayPlanId, localCooking, [])
      if (result.success) {
        setEditingCookingDayId(null)
        toast.success("Cooking list saved")
      } else {
        toast.error(result.error || "Failed to save")
      }
    })
  }, [localCooking])

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="max-w-xs h-9"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateName()
                  if (e.key === "Escape") setIsEditingName(false)
                }}
              />
              <Button size="sm" onClick={handleUpdateName} disabled={isPending}>✓</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditingName(false)}>✕</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h3 className="font-bold text-lg">{weekPlan.name || "Week Plan"}</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsEditingName(true)}
              >
                <span className="text-[10px]">EDIT</span>
              </Button>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isPending}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Plan
        </Button>
      </div>

      {/* All days as tabs */}
      <Tabs
        layoutId="weekPlannerDay"
        tabs={weekPlan.days.map((day) => {
          const mealSlotNames = getMealSlotNames(day)
          return {
            id: String(day.dayOfWeek),
            label: DAY_NAMES[day.dayOfWeek],
            content: (
              <div className="space-y-4">
                {/* Day nutrition summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {weekPlan.persons.map((person) => {
              const personDaySlots = day.slots.filter((s) => s.personId === person.id)
              const dayActual = personDaySlots.reduce((acc, s) => ({
                kcal: acc.kcal + s.actualKcal,
                protein: acc.protein + s.actualProtein,
                fat: acc.fat + s.actualFat,
                carbs: acc.carbs + s.actualCarbs,
                fiber: acc.fiber + s.actualFiber,
              }), { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 })

              const targets = {
                kcal: person.targetKcal,
                protein: Math.round((person.targetKcal * person.proteinPct / 100) / 4),
                fat: Math.round((person.targetKcal * person.fatPct / 100) / 9),
                carbs: Math.round((person.targetKcal * person.carbsPct / 100) / 4),
                fiber: person.fiberGrams,
              }

              const macros = [
                { label: "К", actual: dayActual.kcal, target: targets.kcal, unit: "" },
                { label: "Б", actual: dayActual.protein, target: targets.protein, unit: "g" },
                { label: "Ж", actual: dayActual.fat, target: targets.fat, unit: "g" },
                { label: "В", actual: dayActual.carbs, target: targets.carbs, unit: "g" },
                { label: "Кл", actual: dayActual.fiber, target: targets.fiber, unit: "g" },
              ]

              return (
                <MacroSummary
                  key={person.id}
                  title="Day Nutrition"
                  personName={person.name ?? "Unknown"}
                  macros={macros}
                />
              )
            })}
          </div>

          {/* Meal slots */}
          {mealSlotNames.map((slotName) => {
            const slotGroup = day.slots.filter(s => s.name === slotName)
            const timeWindow = slotGroup[0]?.timeWindow
            const totalEntries = slotGroup.reduce((sum, s) => sum + s.entries.length + s.productEntries.length, 0)
            const color = getMealColor(slotName)

        return (
          <div key={slotName} className={`bg-surface border ${color.border} rounded-2xl overflow-hidden`}>
            {/* Meal header */}
            <div className={`px-5 py-3 border-b ${color.border} flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${color.bg}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color.icon}`}>
                  <Flame size={16} />
                </div>
                <div>
                  <h4 className="text-body font-semibold text-text-primary">{slotName}</h4>
                  {timeWindow && (
                    <div className="flex items-center gap-1 text-caption text-text-muted">
                      <Clock size={10} />
                      <span className="font-mono">{timeWindow}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {slotGroup.map(slot => (
                  <PersonMacroChip
                    key={slot.id}
                    name={slot.personName || ""}
                    kcal={slot.actualKcal}
                    protein={slot.actualProtein}
                    fat={slot.actualFat}
                    carbs={slot.actualCarbs}
                    fiber={slot.actualFiber}
                  />
                ))}
                <span className="text-caption font-mono text-text-muted">{totalEntries} items</span>
              </div>
            </div>

            {/* Meal body — table: Страва | Віталій | Олеся */}
            <div className="p-4">
              {(() => {
                const personNames = slotGroup.map(s => s.personName || "")
                const dishMap = new Map<string, { dishName: string; nutrition: { kcal: number; protein: number; fat: number; carbs: number }; persons: { personId: string; personName: string; entryId: string; slotId: string; slotLocked: boolean; totalWeight: number; ingredients: { ingredientIndex: number; productName: string; weight: number; inputState: string; rawWeight: number; cookedWeight: number; coefficient: number; cookingMethodName: string | null; unit: string | null; productId: string; alternatives: string[]; selectedAlternatives: Record<string, string | null> }[] }[] }>()

                slotGroup.forEach(slot => {
                  slot.entries.forEach(entry => {
                    if (!dishMap.has(entry.dishId)) {
                      dishMap.set(entry.dishId, {
                        dishName: entry.dishName,
                        nutrition: entry.nutrition,
                        persons: [],
                      })
                    }
                    const totalWeight = entry.ingredients.reduce((s, i) => s + i.weight, 0)
                    dishMap.get(entry.dishId)!.persons.push({
                      personId: slot.personId,
                      personName: slot.personName || "",
                      entryId: entry.id,
                      slotId: slot.id,
                      slotLocked: slot.locked,
                      totalWeight,
                      ingredients: entry.ingredients.map(ing => ({
                        ...ing,
                        selectedAlternatives: entry.selectedAlternatives,
                      })),
                    })
                  })
                })

                return (
                  <div className="space-y-4">
                    {Array.from(dishMap.entries()).map(([dishId, dish]) => {
                      // Build ingredient rows: match by ingredientIndex
                      const allIndices = new Set<number>()
                      dish.persons.forEach(p => p.ingredients.forEach(i => allIndices.add(i.ingredientIndex)))
                      const sortedIndices = [...allIndices].sort((a, b) => a - b)

                      return (
                        <div key={dishId} className={`border border-border rounded-xl overflow-hidden ${color.bg}`}>
                          {/* Dish header row */}
                          <div className={`flex items-center gap-3 px-4 py-2.5 border-b ${color.border}`}>
                            <span className="text-body font-semibold text-text-primary flex-1">{dish.dishName}</span>
                            <span className={`text-note font-mono px-2.5 py-1 rounded-lg ${color.badge}`}>{dish.nutrition.kcal.toFixed(0)} kcal</span>
                            {dish.persons.length > 0 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={async () => {
                                  const result = await removeDishFromSlot(dish.persons[0].entryId)
                                  if (result.success) toast.success("Dish removed")
                                }}
                                disabled={isPending || dish.persons[0].slotLocked}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>

                          {/* Table header */}
                          <div className={`grid ${personNames.length === 1 ? 'grid-cols-[1fr_120px]' : 'grid-cols-[1fr_1fr_1fr]'} border-b border-border/30`}>
                            <div className="px-4 py-1.5 text-caption font-mono text-text-muted uppercase">Продукт</div>
                            {personNames.map(name => (
                              <div key={name} className="px-4 py-1.5 text-caption font-semibold text-text-primary border-l border-border/30">{name}</div>
                            ))}
                          </div>

                          {/* Ingredient rows */}
                          {sortedIndices.map(idx => {
                            const personIngredients = dish.persons.map(p => ({
                              person: p,
                              ing: p.ingredients.find(i => i.ingredientIndex === idx),
                            }))
                            const productName = personIngredients.find(p => p.ing)?.ing?.productName || ""

                            return (
                              <div key={idx} className={`grid ${personNames.length === 1 ? 'grid-cols-[1fr_120px]' : 'grid-cols-[1fr_1fr_1fr]'} border-b border-border/20 last:border-b-0`}>
                                <div className="px-4 py-2 text-caption text-text-muted">{productName}</div>
                                {personIngredients.map(({ person, ing }) => (
                                  <div key={person.personId} className="px-4 py-2 border-l border-border/20">
                                    {ing ? (
                                      editingIngredient?.entryId === person.entryId && editingIngredient?.ingredientIndex === idx ? (
                                        <div className="flex items-center gap-1">
                                          <input
                                            type="text"
                                            inputMode="decimal"
                                            className="w-16 h-6 text-caption font-mono bg-transparent text-text-primary border-b-2 border-accent px-0.5 focus:outline-none"
                                            value={editingIngredient.weight}
                                            autoFocus
                                            onFocus={(e) => e.target.select()}
                                            onChange={(e) => setEditingIngredient({ ...editingIngredient, weight: e.target.value.replace(/[^0-9.]/g, "") })}
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") {
                                                const w = parseFloat(editingIngredient.weight)
                                                if (w > 0) {
                                                  startTransition(async () => {
                                                    const result = await updateDishEntryIngredient(person.entryId, idx, w)
                                                    if (result.success) { toast.success("Weight updated"); setEditingIngredient(null) }
                                                  })
                                                }
                                              }
                                              if (e.key === "Escape") setEditingIngredient(null)
                                            }}
                                            onBlur={() => {
                                              const w = parseFloat(editingIngredient.weight)
                                              if (w > 0 && Math.round(w) !== Math.round(ing.weight)) {
                                                startTransition(async () => {
                                                  const result = await updateDishEntryIngredient(person.entryId, idx, w)
                                                  if (result.success) setEditingIngredient(null)
                                                })
                                              } else {
                                                setEditingIngredient(null)
                                              }
                                            }}
                                          />
                                          <span className="text-micro text-text-muted">г</span>
                                        </div>
                                      ) : (
                                        <button
                                          className="text-caption font-mono text-text-secondary hover:text-accent transition-colors"
                                          onClick={() => setEditingIngredient({ entryId: person.entryId, ingredientIndex: idx, weight: String(Math.round(ing.weight)) })}
                                        >
                                          {ing.weight.toFixed(0)}<span className="text-micro text-text-muted">г</span>
                                        </button>
                                      )
                                    ) : (
                                      <span className="text-caption text-text-muted/30">—</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}

                    {/* Product entries grouped by productId */}
                    {(() => {
                      const allProducts = new Map<string, { productName: string; kcal: number; persons: { personId: string; entryId: string; weight: number; slotLocked: boolean }[] }>()
                      
                      slotGroup.forEach(slot => {
                        slot.productEntries.forEach(pe => {
                          if (!allProducts.has(pe.productId)) {
                            allProducts.set(pe.productId, {
                              productName: pe.productName,
                              kcal: pe.kcal,
                              persons: []
                            })
                          }
                          allProducts.get(pe.productId)!.persons.push({
                            personId: slot.personId,
                            entryId: pe.id,
                            weight: pe.portionWeight,
                            slotLocked: slot.locked
                          })
                        })
                      })

                      if (allProducts.size === 0) return null

                      return (
                        <div className={`border border-border rounded-xl overflow-hidden ${color.bg}`}>
                          <div className={`grid ${personNames.length === 1 ? 'grid-cols-[1fr_120px]' : 'grid-cols-[1fr_1fr_1fr]'} border-b border-border/30`}>
                            <div className="px-4 py-1.5 text-caption font-mono text-text-muted uppercase">Продукт</div>
                            {personNames.map(name => (
                              <div key={name} className="px-4 py-1.5 text-caption font-semibold text-text-primary border-l border-border/30">{name}</div>
                            ))}
                          </div>
                          {Array.from(allProducts.entries()).map(([productId, p]) => {
                            const prodInfo = products.find(pr => pr.id === productId)
                            const pUnit = prodInfo?.unit ?? "GRAM"
                            const pStdPkg = prodInfo?.standardPackageAmount ?? 1
                            const pUnitLabel = getProductUnitLabel(pUnit)
                            return (
                            <div key={productId} className={`grid ${personNames.length === 1 ? 'grid-cols-[1fr_120px]' : 'grid-cols-[1fr_1fr_1fr]'} border-b border-border/20 last:border-b-0`}>
                              <div className="px-4 py-2 flex items-center justify-between gap-2">
                                <span className="text-caption text-text-muted truncate">{p.productName}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 text-red-500/50 hover:text-red-500 hover:bg-red-50 shrink-0"
                                  onClick={async () => {
                                    startTransition(async () => {
                                      for (const pers of p.persons) {
                                        await removeProductFromSlot(pers.entryId)
                                      }
                                      toast.success("Product removed")
                                    })
                                  }}
                                  disabled={isPending || p.persons.some(pers => pers.slotLocked)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              {personNames.map(name => {
                                const person = p.persons.find(pers => (slotGroup.find(s => s.personId === pers.personId)?.personName === name))
                                return (
                                  <div key={name} className="px-4 py-2 border-l border-border/20">
                                    {person ? (
                                      editingProduct?.id === person.entryId ? (
                                        <div className="flex items-center gap-1">
                                          <input
                                            type="text"
                                            inputMode="decimal"
                                            className="w-16 h-6 text-caption font-mono bg-transparent text-text-primary border-b-2 border-accent px-0.5 focus:outline-none"
                                            value={editingProduct.weight}
                                            autoFocus
                                            onFocus={(e) => e.target.select()}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, weight: e.target.value.replace(/[^0-9.]/g, "") })}
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") {
                                                const displayW = parseFloat(editingProduct.weight)
                                                if (displayW > 0) {
                                                  startTransition(async () => {
                                                    const grams = toGrams(displayW, pUnit, pStdPkg)
                                                    const result = await updateProductEntryWeight(person.entryId, grams)
                                                    if (result.success) { toast.success("Weight updated"); setEditingProduct(null) }
                                                  })
                                                }
                                              }
                                              if (e.key === "Escape") setEditingProduct(null)
                                            }}
                                            onBlur={() => {
                                              const displayW = parseFloat(editingProduct.weight)
                                              const currentDisplay = parseFloat(toDisplayAmount(person.weight, pUnit, pStdPkg))
                                              if (displayW > 0 && Math.round(displayW) !== Math.round(currentDisplay)) {
                                                startTransition(async () => {
                                                  const grams = toGrams(displayW, pUnit, pStdPkg)
                                                  const result = await updateProductEntryWeight(person.entryId, grams)
                                                  if (result.success) setEditingProduct(null)
                                                })
                                              } else {
                                                setEditingProduct(null)
                                              }
                                            }}
                                          />
                                          <span className="text-micro text-text-muted">{pUnitLabel}</span>
                                        </div>
                                      ) : (
                                        <button
                                          className="text-caption font-mono text-text-secondary hover:text-accent transition-colors"
                                          onClick={() => setEditingProduct({ id: person.entryId, productId, weight: toDisplayAmount(person.weight, pUnit, pStdPkg) })}
                                        >
                                          {toDisplayAmount(person.weight, pUnit, pStdPkg)}<span className="text-micro text-text-muted">{pUnitLabel}</span>
                                        </button>
                                      )
                                    ) : (
                                      <span className="text-caption text-text-muted/30">—</span>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                            )
                          })}
                        </div>
                      )
                    })()}

                    {/* Add buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="ghost"
                        className={`flex-1 h-9 border-dashed border border-border text-text-muted text-note font-medium ${color.hover}`}
                        onClick={() => {
                          const slot = slotGroup[0]
                          const person = weekPlan.persons.find((p) => p.id === slot.personId)
                          if (!person) return
                          setPickerConfig({ slotId: slot.id, person, slotName: slot.name })
                        }}
                        disabled={isPending || slotGroup.some(s => s.locked)}
                      >
                        <Plus className="h-4 w-4 mr-2" /> <UtensilsCrossed className="h-3.5 w-3.5 mr-2" /> Додати страву
                      </Button>
                      <Button
                        variant="ghost"
                        className={`flex-1 h-9 border-dashed border border-border text-text-muted text-note font-medium ${color.hover}`}
                        onClick={() => {
                          setProductPickerSlotId(slotGroup[0].id)
                        }}
                        disabled={isPending || slotGroup.some(s => s.locked)}
                      >
                        <Plus className="h-4 w-4 mr-2" /> <Search className="h-3.5 w-3.5 mr-2" /> Додати продукт
                      </Button>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        )
      })}

          {/* Cooking list for this day */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="bg-raised/50 px-5 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <UtensilsCrossed size={16} className="text-accent" />
                </div>
                <h3 className="text-body font-semibold text-text-primary">Список приготування</h3>
              </div>
              {editingCookingDayId !== day.dayPlanId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-text-muted hover:text-accent"
                  onClick={() => { setLocalCooking(day.prepNote?.content || ""); setEditingCookingDayId(day.dayPlanId) }}
                >
                  Edit
                </Button>
              )}
            </div>
            <div className="p-5">
              {editingCookingDayId === day.dayPlanId ? (
                <div className="space-y-3">
                  <textarea
                    value={localCooking}
                    onChange={(e) => setLocalCooking(e.target.value)}
                    className="w-full min-h-[160px] bg-background border border-border-strong rounded-xl p-3 text-note text-text-primary placeholder:text-text-muted resize-y focus:outline-none focus:border-accent/50 font-mono leading-relaxed"
                    placeholder={"1. Зварити рис — 200г\n2. Запекти курку — 500г, 180°C, 40хв\n3. Нарізати овочі для салату\n4. Змішати соус..."}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setEditingCookingDayId(null); setLocalCooking(day.prepNote?.content || "") }}
                    >
                      <X size={14} className="mr-1" /> Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSaveCooking(day.dayPlanId)}
                      disabled={isPending}
                    >
                      <Check size={14} className="mr-1" /> {isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="min-h-[60px] text-note text-text-muted font-mono leading-relaxed">
                  {day.prepNote?.content ? (
                    <p className="whitespace-pre-wrap">{day.prepNote.content}</p>
                  ) : (
                    <p className="italic">No cooking list yet. Click Edit to add your cooking steps for this day.</p>
                  )}
                </div>
              )}
            </div>
          </div>
          </div>
            ),
          }
        })}
      />

      {/* Notes block */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="bg-raised/50 px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <StickyNote size={16} className="text-amber-400" />
            </div>
            <h3 className="text-body font-semibold text-text-primary">Нотатки</h3>
          </div>
          {!isEditingNotes && (
            <Button
              variant="ghost"
              size="sm"
              className="text-text-muted hover:text-accent"
              onClick={() => { setLocalNotes(notes); setIsEditingNotes(true) }}
            >
              Edit
            </Button>
          )}
        </div>
        <div className="p-5">
          {isEditingNotes ? (
            <div className="space-y-3">
              <textarea
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
                className="w-full min-h-[120px] bg-background border border-border-strong rounded-xl p-3 text-note text-text-primary placeholder:text-text-muted resize-y focus:outline-none focus:border-accent/50"
                placeholder="Write your notes for this week plan..."
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setIsEditingNotes(false); setLocalNotes(notes) }}
                >
                  <X size={14} className="mr-1" /> Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={isPending}
                >
                  <Check size={14} className="mr-1" /> {isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="min-h-[60px] text-note text-text-muted">
              {notes ? (
                <p className="whitespace-pre-wrap">{notes}</p>
              ) : (
                <p className="italic">No notes yet. Click Edit to add notes for this week plan.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dish Picker Dialog */}
      {pickerConfig && (
        <DishPicker
          isOpen={!!pickerConfig}
          onClose={() => setPickerConfig(null)}
          onAdd={handleAddDish}
          dishes={dishes}
          person={pickerConfig.person}
          slotName={pickerConfig.slotName}
        />
      )}

      {/* Product Picker Dialog */}
      <Dialog
        isOpen={!!productPickerSlotId}
        onClose={() => { setProductPickerSlotId(null); setSelectedProductId(null); setProductSearch(""); setProductWeight("100") }}
        title="Додати продукт"
        maxWidth="max-w-sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setProductPickerSlotId(null); setSelectedProductId(null) }}>Скасувати</Button>
            <Button variant="primary" onClick={handleAddProduct} disabled={!selectedProductId || isPending}>Додати</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Пошук продукту..."
              value={productSearch}
              onChange={(e) => { setProductSearch(e.target.value); setSelectedProductId(null) }}
              className="pl-8"
            />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {products
              .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
              .slice(0, 12)
              .map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProductId(p.id); setProductWeight(NON_GRAM_UNITS.has(p.unit) ? "1" : "100") }}
                  className={`w-full text-left p-2.5 rounded-lg border text-base transition-colors ${
                    selectedProductId === p.id ? "border-accent bg-accent/5" : "border-border hover:bg-raised"
                  }`}
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-caption text-muted-foreground font-mono">
                    {p.caloriesPer100.toFixed(0)} kcal · P:{p.proteinPer100.toFixed(1)} F:{p.fatPer100.toFixed(1)} C:{p.carbsPer100.toFixed(1)}
                  </div>
                </button>
              ))
            }
          </div>
          {selectedProductId && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={productWeight}
                onChange={(e) => setProductWeight(e.target.value)}
                className="w-24 font-mono text-center"
              />
              <span className="text-base text-muted-foreground">{selectedUnitLabel}</span>
            </div>
          )}
        </div>
      </Dialog>

      {/* Delete Plan Confirmation */}
      <Dialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete Week Plan?"
        description="This action cannot be undone"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeletePlan} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete Plan"}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete <strong>{weekPlan.name || "this week plan"}</strong>?</p>
      </Dialog>
    </div>
  )
}
