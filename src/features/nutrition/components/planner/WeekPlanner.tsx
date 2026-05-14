"use client"

import { useState, useTransition, useMemo, useCallback } from "react"
import { Plus, Trash2, Search, ChevronDown, ChevronRight, Flame, UtensilsCrossed, Clock, StickyNote, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DishPicker } from "./DishPicker"
import { removeDishFromSlot, addDishToSlot, updateDishEntryIngredient, addProductToSlot, removeProductFromSlot, deleteWeekPlan, updateWeekPlanName, updateDishEntryAlternative, updateWeekPlanNotes, updateDayPrepNote } from "../../actions/planning"
import { toast } from "sonner"
import type { DishType } from "../../constants/dish-types"
import { useRouter } from "next/navigation"

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
        <div className="flex-1 h-1.5 bg-raised rounded-full overflow-hidden flex max-w-[80px]">
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
  const [activeDay, setActiveDay] = useState(0)
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
  const [expandedDishes, setExpandedDishes] = useState<Set<string>>(new Set())
  const [editingIngredient, setEditingIngredient] = useState<{ entryId: string; ingredientIndex: number; weight: string } | null>(null)
  const [notes, setNotes] = useState(weekPlan.notes || "")
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [localNotes, setLocalNotes] = useState(weekPlan.notes || "")
  const [isEditingCooking, setIsEditingCooking] = useState(false)
  const [localCooking, setLocalCooking] = useState("")

  const toggleDish = (key: string) => {
    setExpandedDishes(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

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

  const dayHasContent = useMemo(() => {
    const map: Record<number, boolean> = {}
    weekPlan.days.forEach(d => {
      map[d.dayOfWeek] = d.slots.some(s => s.entries.length > 0 || s.productEntries.length > 0)
    })
    return map
  }, [weekPlan.days])

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

  const currentDay = weekPlan.days.find(d => d.dayOfWeek === activeDay)

  const handleSaveCooking = useCallback((dayPlanId: string) => {
    startTransition(async () => {
      const result = await updateDayPrepNote(dayPlanId, localCooking, [])
      if (result.success) {
        setIsEditingCooking(false)
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

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {weekPlan.days.map((day) => {
          const hasContent = dayHasContent[day.dayOfWeek]
          const isActive = activeDay === day.dayOfWeek
          return (
            <button
              key={day.dayOfWeek}
              onClick={() => setActiveDay(day.dayOfWeek)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-mono uppercase transition-all whitespace-nowrap ${
                isActive
                  ? "border-accent bg-accent/10 text-accent shadow-sm"
                  : "border-border text-muted hover:bg-raised"
              }`}
            >
              <span>{DAY_NAMES[day.dayOfWeek]}</span>
              {hasContent && (
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-accent" : "bg-accent/50"}`} />
              )}
            </button>
          )
        })}
      </div>

      {/* Day nutrition summary - single row with both profiles */}
      {currentDay && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="bg-raised/50 px-5 py-3 border-b border-border">
            <h3 className="text-note font-semibold text-text-primary">Day Nutrition</h3>
          </div>
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {weekPlan.persons.map((person) => {
                const personDaySlots = currentDay.slots.filter((s) => s.personId === person.id)
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
                  { label: "kcal", actual: dayActual.kcal, target: targets.kcal, color: "bg-accent" },
                  { label: "Б", actual: dayActual.protein, target: targets.protein, color: "bg-accent" },
                  { label: "Ж", actual: dayActual.fat, target: targets.fat, color: "bg-secondary" },
                  { label: "В", actual: dayActual.carbs, target: targets.carbs, color: "bg-text/40" },
                  { label: "К", actual: dayActual.fiber, target: targets.fiber, color: "bg-muted" },
                ]

                return (
                  <div key={person.id} className="flex-1 space-y-2">
                    <div className="text-note font-semibold text-text-primary">{person.name ?? "Unknown"}</div>
                    <div className="space-y-1.5">
                      {macros.map((m) => {
                        const pct = Math.min((m.actual / (m.target || 1)) * 100, 100)
                        return (
                          <div key={m.label} className="flex items-center gap-2">
                            <span className="text-caption font-mono text-text-muted w-4">{m.label}</span>
                            <div className="flex-1 h-1.5 bg-raised rounded-full overflow-hidden">
                              <div style={{ width: `${pct}%` }} className={`h-full ${m.color} transition-all`} />
                            </div>
                            <span className="text-caption font-mono text-text-muted w-16 text-right">
                              {m.actual.toFixed(0)}/{m.target}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Meal slots */}
      {currentDay && mealSlotNames.map((slotName) => {
        const slotGroup = currentDay.slots.filter(s => s.name === slotName)
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

            {/* Meal body */}
            <div className="p-4 space-y-4">
              {slotGroup.map(slot => {
                return (
                  <div key={slot.id} className={`border-l-2 ${color.border} ${color.bg} rounded-r-xl pl-4 py-3 space-y-2`}>
                    <div className="flex items-center justify-between">
                      <div className="text-note font-semibold text-text-primary">{slot.personName}</div>
                      <div className="text-caption font-mono text-text-muted">
                        Target: {slot.targetKcal.toFixed(0)} ккал
                      </div>
                    </div>

                    {/* Dish entries */}
                    {(slot.entries || []).map((entry) => {
                      const dishKey = `${slot.id}-${entry.id}`
                      const isExpanded = expandedDishes.has(dishKey)
                      const isEditingIng = editingIngredient?.entryId === entry.id

                      return (
                        <div key={entry.id} className="space-y-1">
                          <div className={`flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors group/entry ${color.hover}`}>
                            <button
                              onClick={() => toggleDish(dishKey)}
                              className="text-text-muted hover:text-text-primary p-0"
                            >
                              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                            <span className="text-note font-medium text-text-primary flex-1">{entry.dishName}</span>
                            <span className={`text-label font-mono px-2 py-0.5 rounded-md ${color.badge}`}>{entry.nutrition.kcal.toFixed(0)}</span>
                            <span className="text-caption font-mono text-text-muted">
                              Б:{entry.nutrition.protein.toFixed(0)} Ж:{entry.nutrition.fat.toFixed(0)} В:{entry.nutrition.carbs.toFixed(0)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 opacity-0 group-hover/entry:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={async () => {
                                const result = await removeDishFromSlot(entry.id)
                                if (result.success) toast.success("Dish removed")
                              }}
                              disabled={isPending || slot.locked}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Expandable ingredients */}
                          {isExpanded && entry.ingredients.length > 0 && (
                            <div className="ml-5 pl-3 border-l border-accent/10 space-y-1">
                              {entry.ingredients.map((ing) => {
                                const selectedAlts = entry.selectedAlternatives || {}
                                const currentProductId = selectedAlts[String(ing.ingredientIndex)] || ing.productId
                                const isAlternative = currentProductId !== ing.productId

                                const allOptions = [
                                  { id: ing.productId, name: ing.productName },
                                  ...ing.alternatives.map(altName => {
                                    const p = products.find(prod => prod.name.toLowerCase() === altName.toLowerCase())
                                    return p ? { id: p.id, name: p.name } : null
                                  }).filter(Boolean) as { id: string, name: string }[]
                                ]

                                const isEditingThis = isEditingIng && editingIngredient?.ingredientIndex === ing.ingredientIndex

                                return (
                                  <div key={ing.ingredientIndex} className="flex flex-wrap gap-1.5 items-center py-0.5">
                                    <span className={`text-caption ${isAlternative ? 'text-accent/70' : 'text-text-muted'}`}>
                                      {ing.productName}:
                                    </span>
                                    {isEditingThis ? (
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="number"
                                          className="w-14 h-5 text-caption font-mono bg-background border rounded px-1"
                                          value={editingIngredient.weight}
                                          autoFocus
                                          onChange={(e) => setEditingIngredient({ ...editingIngredient, weight: e.target.value })}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                              const w = parseFloat(editingIngredient.weight)
                                              if (w > 0) {
                                                startTransition(async () => {
                                                  const result = await updateDishEntryIngredient(entry.id, ing.ingredientIndex, w)
                                                  if (result.success) { toast.success("Weight updated"); setEditingIngredient(null) }
                                                })
                                              }
                                            }
                                            if (e.key === "Escape") setEditingIngredient(null)
                                          }}
                                        />
                                        <span className="text-caption text-text-muted">г</span>
                                      </div>
                                    ) : (
                                      <button
                                        className="text-caption font-mono text-text-muted hover:text-accent underline decoration-dotted"
                                        onClick={() => setEditingIngredient({ entryId: entry.id, ingredientIndex: ing.ingredientIndex, weight: String(ing.weight) })}
                                      >
                                        {ing.weight.toFixed(0)}г
                                        {ing.inputState === "COOKED" && <span className="text-[10px] text-accent/60 ml-0.5"> готове</span>}
                                        {ing.coefficient !== 1 && <span className="text-[10px] text-text-muted/50 ml-0.5">≈{ing.rawWeight.toFixed(0)}г сире</span>}
                                      </button>
                                    )}
                                    {ing.unit && <span className="text-[10px] text-text-muted">{ing.unit}</span>}
                                    {ing.alternatives && ing.alternatives.length > 0 && (
                                      <div className="flex flex-wrap gap-0.5">
                                        {allOptions.map((opt) => (
                                          <button
                                            key={opt.id}
                                            onClick={async () => {
                                              const result = await updateDishEntryAlternative(entry.id, ing.ingredientIndex, opt.id === ing.productId ? null : opt.id)
                                              if (result.success) toast.success("Alternative updated")
                                            }}
                                            className={`text-[10px] px-1.5 py-0.5 rounded leading-none border ${
                                              currentProductId === opt.id
                                                ? "bg-accent/20 text-accent border-accent/40 font-bold"
                                                : "bg-white/5 text-text-muted/50 border-border hover:bg-raised"
                                            }`}
                                          >
                                            {opt.name}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* Product entries */}
                    {(slot.productEntries || []).map((pe) => (
                      <div key={pe.id} className={`flex justify-between items-center py-1.5 px-2 rounded-lg ${color.bg} border-l-2 border-green-500/40 group/prod`}>
                        <div className="flex items-center gap-2">
                          <span className="text-note font-medium text-text-primary">{pe.productName}</span>
                          <span className="text-caption font-mono text-text-muted">{pe.portionWeight.toFixed(0)}г</span>
                          <span className="text-label font-mono text-text-muted">{pe.kcal.toFixed(0)} ккал</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 opacity-0 group-hover/prod:opacity-100 text-red-500 hover:text-red-600"
                          onClick={async () => {
                            const result = await removeProductFromSlot(pe.id)
                            if (result.success) toast.success("Product removed")
                          }}
                          disabled={isPending || slot.locked}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}

                    {/* Add buttons */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="ghost"
                        className={`flex-1 h-8 border-dashed border border-border text-text-muted text-caption ${color.hover}`}
                        onClick={() => {
                          const person = weekPlan.persons.find((p) => p.id === slot.personId)
                          if (!person) return
                          setPickerConfig({ slotId: slot.id, person, slotName: slot.name })
                        }}
                        disabled={isPending || slot.locked}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" /> <UtensilsCrossed className="h-3 w-3 mr-1" /> Страву
                      </Button>
                      <Button
                        variant="ghost"
                        className={`h-8 px-3 border-dashed border border-border text-text-muted text-caption ${color.hover}`}
                        onClick={() => setProductPickerSlotId(slot.id)}
                        disabled={isPending || slot.locked}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Продукт
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Cooking list for the day */}
      {currentDay && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="bg-raised/50 px-5 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <UtensilsCrossed size={16} className="text-accent" />
              </div>
              <h3 className="text-body font-semibold text-text-primary">Список приготування</h3>
            </div>
            {!isEditingCooking && (
              <Button
                variant="ghost"
                size="sm"
                className="text-text-muted hover:text-accent"
                onClick={() => { setLocalCooking(currentDay?.prepNote?.content || ""); setIsEditingCooking(true) }}
              >
                Edit
              </Button>
            )}
          </div>
          <div className="p-5">
            {isEditingCooking ? (
              <div className="space-y-3">
                <textarea
                  value={localCooking}
                  onChange={(e) => setLocalCooking(e.target.value)}
                  className="w-full min-h-[160px] bg-background border border-border rounded-xl p-3 text-note text-text-primary placeholder:text-text-muted resize-y focus:outline-none focus:border-accent/50 font-mono leading-relaxed"
                  placeholder={"1. Зварити рис — 200г\n2. Запекти курку — 500г, 180°C, 40хв\n3. Нарізати овочі для салату\n4. Змішати соус..."}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setIsEditingCooking(false); setLocalCooking(currentDay?.prepNote?.content || "") }}
                  >
                    <X size={14} className="mr-1" /> Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSaveCooking(currentDay.dayPlanId)}
                    disabled={isPending}
                  >
                    <Check size={14} className="mr-1" /> {isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="min-h-[60px] text-note text-text-muted font-mono leading-relaxed">
                {currentDay?.prepNote?.content ? (
                  <p className="whitespace-pre-wrap">{currentDay.prepNote.content}</p>
                ) : (
                  <p className="italic">No cooking list yet. Click Edit to add your cooking steps for this day.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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
                className="w-full min-h-[120px] bg-background border border-border rounded-xl p-3 text-note text-text-primary placeholder:text-text-muted resize-y focus:outline-none focus:border-accent/50"
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
