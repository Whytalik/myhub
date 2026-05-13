"use client"

import { useState, useTransition, useMemo } from "react"
import { Plus, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DayNutritionSummary } from "./DayNutritionSummary"
import { DishPicker } from "./DishPicker"
import { removeDishFromSlot, addDishToSlot, updatePortionWeight, updateDishServings, addProductToSlot, removeProductFromSlot, deleteWeekPlan, updateWeekPlanName, updateDishEntryAlternative } from "../../actions/planning"
import { toast } from "sonner"
import type { DishType } from "../../constants/dish-types"
import { useRouter } from "next/navigation"

const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"]

interface WeekPlannerProps {
  weekPlan: {
    id: string
    name: string | null
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
      dayOfWeek: number
      activity: string | null
      slots: {
        id: string
        personId: string
        personName: string | null
        name: string
        timeWindow: string | null
        order: number
        targetKcal: number
        targetFiberGrams: number
        actualKcal: number
        actualProtein: number
        actualFat: number
        actualCarbs: number
        actualFiber: number
        entries: {
          id: string
          dishId: string
          dishName: string
          portionWeight: number
          servings: number
          isShared: boolean
          fitScore: number | null
          selectedAlternatives?: Record<string, string | null>
          ingredients?: {
            id: string
            productId: string
            productName: string
            rawWeight: number
            alternatives: string[]
          }[]
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
  }[]
}

export function WeekPlanner({ weekPlan, dishes, products }: WeekPlannerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeDay, setActiveDay] = useState(0)
  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState(weekPlan.name || "")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [pickerConfig, setPickerConfig] = useState<{
    slotId: string
    person: { targetKcal: number; proteinPct: number; fatPct: number; carbsPct: number; fiberGrams: number }
    slotName: string
  } | null>(null)
  const [editingEntry, setEditingEntry] = useState<{ id: string; weight: string } | null>(null)
  const [editingServings, setEditingServings] = useState<{ id: string; servings: string } | null>(null)
  const [productPickerSlotId, setProductPickerSlotId] = useState<string | null>(null)
  const [productSearch, setProductSearch] = useState("")
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [productWeight, setProductWeight] = useState("100")

  const mealSlotNames = useMemo(() => {
    const day = weekPlan.days.find(d => d.dayOfWeek === activeDay)
    if (!day) return []
    const names = new Set<string>()
    day.slots.forEach(s => names.add(s.name))
    return [...names].sort((a, b) => {
      const slotA = day.slots.find(s => s.name === a)
      const slotB = day.slots.find(s => s.name === b)
      return (slotA?.order ?? 0) - (slotB?.order ?? 0)
    })
  }, [weekPlan.days, activeDay])

  const handleAddDish = (dishId: string, isShared: boolean, weight: number) => {
    if (!pickerConfig) return

    startTransition(async () => {
      const result = await addDishToSlot(
        pickerConfig.slotId,
        dishId,
        isShared,
        1,
        weight,
      )

      if (result.success) {
        toast.success("Dish added")
      } else {
        toast.error(result.error || "Failed to add dish")
      }
    })
  }

  const handleRemoveDish = (entryId: string) => {
    startTransition(async () => {
      const result = await removeDishFromSlot(entryId)
      if (result.success) {
        toast.success("Dish removed")
      } else {
        toast.error(result.error || "Failed to remove dish")
      }
    })
  }

  const handleUpdateWeight = (entryId: string, weight: number) => {
    startTransition(async () => {
      const result = await updatePortionWeight(entryId, weight)
      if (result.success) {
        toast.success("Weight updated")
        setEditingEntry(null)
      } else {
        toast.error(result.error || "Failed to update weight")
      }
    })
  }

  const handleUpdateServings = (entryId: string, servings: number) => {
    startTransition(async () => {
      const result = await updateDishServings(entryId, servings)
      if (result.success) {
        toast.success("Servings updated")
        setEditingServings(null)
      } else {
        toast.error(result.error || "Failed to update servings")
      }
    })
  }

  const handleAddProduct = () => {
    if (!productPickerSlotId || !selectedProductId) return
    const weight = parseFloat(productWeight)
    if (!weight || weight <= 0) { toast.error("Enter valid weight"); return }

    startTransition(async () => {
      const result = await addProductToSlot(productPickerSlotId, selectedProductId, weight)
      if (result.success) {
        toast.success("Product added")
        setProductPickerSlotId(null)
        setSelectedProductId(null)
        setProductSearch("")
        setProductWeight("100")
      } else {
        toast.error(result.error || "Failed to add product")
      }
    })
  }

  const handleRemoveProduct = (entryId: string) => {
    startTransition(async () => {
      const result = await removeProductFromSlot(entryId)
      if (result.success) {
        toast.success("Product removed")
      } else {
        toast.error(result.error || "Failed to remove product")
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

  const handleUpdateAlternative = (entryId: string, ingredientIndex: number, alternativeProductId: string | null) => {
    startTransition(async () => {
      const result = await updateDishEntryAlternative(entryId, ingredientIndex, alternativeProductId)
      if (result.success) {
        toast.success("Alternative updated")
      } else {
        toast.error(result.error || "Failed to update alternative")
      }
    })
  }

  const currentDay = weekPlan.days.find(d => d.dayOfWeek === activeDay)

  return (
    <div className="space-y-6">
      {/* Plan Header / Controls */}
      <div className="flex items-center justify-between gap-4 bg-raised p-4 rounded-xl border">
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

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {weekPlan.days.map((day) => (
          <button
            key={day.dayOfWeek}
            onClick={() => setActiveDay(day.dayOfWeek)}
            className={`px-4 py-2 rounded-lg border text-sm font-mono uppercase transition-all whitespace-nowrap ${
              activeDay === day.dayOfWeek
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:bg-raised"
            }`}
          >
            {DAY_NAMES[day.dayOfWeek]}
          </button>
        ))}
      </div>

      {/* Day nutrition summary */}
      {currentDay && (
        <div className="grid md:grid-cols-2 gap-6">
          {weekPlan.persons.map((person) => {
            const personDaySlots = currentDay.slots.filter((s) => s.personId === person.id)

            const dayActual = personDaySlots.reduce((acc, s) => ({
              kcal: acc.kcal + s.actualKcal,
              protein: acc.protein + s.actualProtein,
              fat: acc.fat + s.actualFat,
              carbs: acc.carbs + s.actualCarbs,
              fiber: acc.fiber + s.actualFiber,
            }), { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 })

            return (
              <DayNutritionSummary
                key={person.id}
                personName={person.name ?? "Unknown"}
                warnings={[]}
                data={{
                  kcal: { label: "Calories", actual: dayActual.kcal, target: person.targetKcal, unit: "kcal" },
                  protein: { label: "Protein", actual: dayActual.protein, target: (person.targetKcal * person.proteinPct / 100) / 4, unit: "g" },
                  fat: { label: "Fat", actual: dayActual.fat, target: (person.targetKcal * person.fatPct / 100) / 9, unit: "g" },
                  carbs: { label: "Carbs", actual: dayActual.carbs, target: (person.targetKcal * person.carbsPct / 100) / 4, unit: "g" },
                  fiber: { label: "Fiber", actual: dayActual.fiber, target: person.fiberGrams, unit: "g" },
                }}
              />
            )
          })}
        </div>
      )}

      {/* Table layout: meal slots as columns, persons as rows within each slot */}
      {currentDay && mealSlotNames.map((slotName) => {
        const slotGroup = currentDay.slots.filter(s => s.name === slotName)
        const timeWindow = slotGroup[0]?.timeWindow

        return (
          <div key={slotName} className="space-y-2">
            <div className="flex items-center gap-2 border-b pb-1">
              <h4 className="text-base font-bold">{slotName}</h4>
              {timeWindow && (
                <span className="text-caption text-muted-foreground font-mono">{timeWindow}</span>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {slotGroup.map((slot) => {
                const diff = Math.abs(slot.actualKcal - slot.targetKcal) / (slot.targetKcal || 1)
                const colorClass = diff < 0.1 ? "border-green-500/50 bg-green-50/50 dark:bg-green-900/10" :
                                   diff < 0.2 ? "border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/10" :
                                   "border-red-500/50 bg-red-50/50 dark:bg-red-900/10"

                return (
                  <div key={slot.id} className={`p-3 rounded-lg border ${colorClass}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm font-semibold">{slot.personName}</div>
                        {slot.targetFiberGrams > 0 && (
                          <div className="text-label text-muted-foreground">Fiber: {slot.targetFiberGrams.toFixed(0)}g</div>
                        )}
                      </div>
                      <div className="text-caption text-muted-foreground">
                        {slot.actualKcal.toFixed(0)} / {slot.targetKcal.toFixed(0)} kcal
                      </div>
                    </div>

                    <div className="space-y-2">
                      {(slot.entries || []).map((entry) => {
                        const dish = dishes.find(d => d.id === entry.dishId)
                        const totalWeight = entry.portionWeight * entry.servings
                        const entryKcal = dish ? (dish.per100g.kcal * totalWeight) / 100 : 0
                        const isEditingWeight = editingEntry?.id === entry.id
                        const isEditingServings = editingServings?.id === entry.id

                        return (
                          <div key={entry.id} className="flex flex-col bg-background/50 p-2 rounded gap-2">
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{entry.dishName}</span>
                                {isEditingServings ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      className="w-12 h-5 text-caption font-mono bg-background border rounded px-1"
                                      value={editingServings.servings}
                                      autoFocus
                                      onChange={(e) => setEditingServings({ ...editingServings, servings: e.target.value })}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          const s = parseFloat(editingServings.servings)
                                          if (s > 0) handleUpdateServings(entry.id, s)
                                        }
                                        if (e.key === "Escape") setEditingServings(null)
                                      }}
                                    />
                                    <span className="text-label text-muted-foreground">serv</span>
                                  </div>
                                ) : (
                                  <button
                                    className="text-caption text-muted-foreground hover:text-accent underline decoration-dotted"
                                    onClick={() => setEditingServings({ id: entry.id, servings: String(entry.servings) })}
                                  >
                                    {entry.servings.toFixed(1)} serv
                                  </button>
                                )}
                                {isEditingWeight ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      className="w-14 h-5 text-caption font-mono bg-background border rounded px-1"
                                      value={editingEntry.weight}
                                      autoFocus
                                      onChange={(e) => setEditingEntry({ ...editingEntry, weight: e.target.value })}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          const w = parseFloat(editingEntry.weight)
                                          if (w > 0) handleUpdateWeight(entry.id, w)
                                        }
                                        if (e.key === "Escape") setEditingEntry(null)
                                      }}
                                    />
                                    <span className="text-label text-muted-foreground">g</span>
                                  </div>
                                ) : (
                                  <button
                                    className="text-caption text-muted-foreground hover:text-accent underline decoration-dotted"
                                    onClick={() => setEditingEntry({ id: entry.id, weight: String(entry.portionWeight) })}
                                  >
                                    {entry.portionWeight.toFixed(0)}g
                                  </button>
                                )}
                                <span className="text-label font-mono text-muted-foreground">{entryKcal.toFixed(0)} kcal</span>
                                {entry.fitScore !== null && entry.fitScore !== undefined && (
                                  <span className={`h-4 text-[10px] px-1 border rounded ${
                                    entry.fitScore > 0.8 ? "text-green-600 border-green-600" :
                                    entry.fitScore > 0.5 ? "text-yellow-600 border-yellow-600" :
                                    "text-red-600 border-red-600"
                                  }`}>
                                    {(entry.fitScore * 100).toFixed(0)}%
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                {isEditingWeight && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 text-green-500 hover:text-green-600"
                                    onClick={() => {
                                      const w = parseFloat(editingEntry.weight)
                                      if (w > 0) handleUpdateWeight(entry.id, w)
                                    }}
                                    disabled={isPending}
                                  >
                                    <span className="text-caption">✓</span>
                                  </Button>
                                )}
                                {isEditingServings && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 text-green-500 hover:text-green-600"
                                    onClick={() => {
                                      const s = parseFloat(editingServings.servings)
                                      if (s > 0) handleUpdateServings(entry.id, s)
                                    }}
                                    disabled={isPending}
                                  >
                                    <span className="text-caption">✓</span>
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => handleRemoveDish(entry.id)}
                                  disabled={isPending}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Alternatives selection */}
                            {entry.ingredients && entry.ingredients.length > 0 && (
                              <div className="flex flex-col gap-1.5 pl-2 border-l-2 border-accent/20">
                                {entry.ingredients.map((ing, idx) => {
                                  if (!ing.alternatives || ing.alternatives.length === 0) return null;
                                  
                                  const selectedAlts = entry.selectedAlternatives as Record<string, string> || {};
                                  const currentProductId = selectedAlts[String(idx)] || ing.productId;
                                  
                                  const allOptions = [
                                    { id: ing.productId, name: ing.productName },
                                    ...ing.alternatives.map(altName => {
                                      const p = products.find(prod => prod.name.toLowerCase() === altName.toLowerCase());
                                      return p ? { id: p.id, name: p.name } : null;
                                    }).filter(Boolean) as { id: string, name: string }[]
                                  ];

                                  return (
                                    <div key={idx} className="flex flex-wrap gap-1 items-center">
                                      <span className="text-[10px] text-muted-foreground lowercase">{ing.productName}:</span>
                                      <div className="flex flex-wrap gap-1">
                                        {allOptions.map((opt) => (
                                          <button
                                            key={opt.id}
                                            onClick={() => handleUpdateAlternative(entry.id, idx, opt.id === ing.productId ? null : opt.id)}
                                            className={`text-[9px] px-1.5 py-0.5 rounded transition-colors leading-none border ${
                                              currentProductId === opt.id 
                                                ? "bg-accent text-white border-transparent font-bold" 
                                                : "bg-white/5 text-muted-foreground border-border hover:bg-raised"
                                            }`}
                                          >
                                            {opt.name}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}

                      {/* Product entries */}
                      {(slot.productEntries || []).map((pe) => (
                        <div key={pe.id} className="flex justify-between items-center bg-background/50 p-1.5 rounded text-sm border-l-2 border-green-500/40">
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 dark:text-green-400 text-label">🥩</span>
                            <span className="font-medium">{pe.productName}</span>
                            <span className="text-caption text-muted-foreground font-mono">{pe.portionWeight.toFixed(0)}g</span>
                            <span className="text-label font-mono text-muted-foreground">{pe.kcal.toFixed(0)} kcal</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-red-500 hover:text-red-600"
                            onClick={() => handleRemoveProduct(pe.id)}
                            disabled={isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}

                      {/* Add buttons */}
                      <div className="flex gap-1.5 mt-2">
                        <Button
                          variant="ghost"
                          className="flex-1 h-8 border-dashed border-2 text-muted-foreground hover:text-primary"
                          onClick={() => {
                            const person = weekPlan.persons.find((p) => p.id === slot.personId)
                            if (!person) return
                            setPickerConfig({
                              slotId: slot.id,
                              person,
                              slotName: slot.name
                            })
                          }}
                          disabled={isPending}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          <span className="text-caption">Страву</span>
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-8 px-3 border-dashed border-2 text-muted-foreground hover:text-green-500 hover:border-green-500/40"
                          onClick={() => setProductPickerSlotId(slot.id)}
                          disabled={isPending}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          <span className="text-caption">Продукт</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

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
                  onClick={() => setSelectedProductId(p.id)}
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
              <span className="text-base text-muted-foreground">грам</span>
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
