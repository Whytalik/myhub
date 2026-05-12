"use client"

import { useState, useTransition, useMemo } from "react"
import { format } from "date-fns"
import { Plus, Trash2, AlertTriangle, Search } from "lucide-react"
import { Tabs } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DayNutritionSummary } from "./DayNutritionSummary"
import { DishPicker } from "./DishPicker"
import { removeDishFromSlot, addDishToSlot, updatePortionWeight, addProductToSlot, removeProductFromSlot } from "../../actions/planning"
import { toast } from "sonner"
import type { DishType } from "../../constants/dish-types"

interface WeekPlannerProps {
  weekPlan: {
    id: string
    startDate: Date
    days: {
      date: Date
      slots: {
        id: string
        personId: string
        personName: string | null
        templateSlotName: string
        templateSlotOrder: number
        targetKcal: number
        targetFiberGrams: number
        actualKcal: number
        actualProtein: number
        actualFat: number
        actualCarbs: number
        actualFiber: number
        violations: string[]
        entries: {
          id: string
          dishId: string
          dishName: string
          portionWeight: number
          isShared: boolean
          fitScore: number | null
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
  const [isPending, startTransition] = useTransition()
  const [activeDay, setActiveDay] = useState(format(new Date(weekPlan.startDate), "yyyy-MM-dd"))
  const [pickerConfig, setPickerConfig] = useState<{
    slotId: string
    person: { targetKcal: number; proteinPct: number; fatPct: number; carbsPct: number; fiberGrams: number }
    slot: { percentage: number; minProteinGrams?: number | null; maxPctOfDaily?: number | null }
    slotName: string
  } | null>(null)
  const [editingEntry, setEditingEntry] = useState<{ id: string; weight: string } | null>(null)
  const [productPickerSlotId, setProductPickerSlotId] = useState<string | null>(null)
  const [productSearch, setProductSearch] = useState("")
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [productWeight, setProductWeight] = useState("100")

  const handleAddDish = (dishId: string, isShared: boolean, weight: number) => {
    if (!pickerConfig) return

    startTransition(async () => {
      const result = await addDishToSlot(
        pickerConfig.slotId,
        dishId,
        isShared,
        weight,
      )

      if (result.success) {
        toast.success("Dish added")
        if (result.data?.warnings?.length) {
          toast.warning(`Warnings: ${result.data.warnings.join(", ")}`)
        }
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

  const tabs = useMemo(() => weekPlan.days.map((day) => {
    const dateStr = format(new Date(day.date), "yyyy-MM-dd")
    const dayName = format(new Date(day.date), "EEE")
    const dayNum = format(new Date(day.date), "d")

    return {
      id: dateStr,
      label: `${dayName} ${dayNum}`,
      content: <DayContent day={day} weekPlan={weekPlan} dishes={dishes} onRemoveDish={handleRemoveDish} onAddDishClick={setPickerConfig} onAddProductClick={setProductPickerSlotId} onRemoveProduct={handleRemoveProduct} onEditWeight={handleUpdateWeight} editingEntry={editingEntry} setEditingEntry={setEditingEntry} isPending={isPending} />,
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [weekPlan.days.length, isPending])

  return (
    <div className="space-y-6">
      <Tabs tabs={tabs} activeTab={activeDay} onTabChange={setActiveDay} className="w-full" />

      {pickerConfig && (
        <DishPicker
          isOpen={!!pickerConfig}
          onClose={() => setPickerConfig(null)}
          onAdd={handleAddDish}
          dishes={dishes}
          person={pickerConfig.person}
          slot={pickerConfig.slot}
        />
      )}

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
    </div>
  )
}

function DayContent({ day, weekPlan, dishes, onRemoveDish, onAddDishClick, onAddProductClick, onRemoveProduct, onEditWeight, editingEntry, setEditingEntry, isPending }: {
  day: WeekPlannerProps["weekPlan"]["days"][number]
  weekPlan: WeekPlannerProps["weekPlan"]
  dishes: WeekPlannerProps["dishes"]
  onRemoveDish: (entryId: string) => void
  onAddDishClick: (config: { slotId: string; person: { targetKcal: number; proteinPct: number; fatPct: number; carbsPct: number; fiberGrams: number }; slot: { percentage: number; minProteinGrams?: number | null; maxPctOfDaily?: number | null }; slotName: string }) => void
  onAddProductClick: (slotId: string) => void
  onRemoveProduct: (entryId: string) => void
  onEditWeight: (entryId: string, weight: number) => void
  editingEntry: { id: string; weight: string } | null
  setEditingEntry: (entry: { id: string; weight: string } | null) => void
  isPending: boolean
}) {
  return (
    <div className="space-y-6 mt-6">
      <div className="grid md:grid-cols-2 gap-6">
        {weekPlan.persons.map((person) => {
          const personDaySlots = day.slots.filter((s) => s.personId === person.id)
          
          const dayActual = personDaySlots.reduce((acc, s) => ({
            kcal: acc.kcal + s.actualKcal,
            protein: acc.protein + s.actualProtein,
            fat: acc.fat + s.actualFat,
            carbs: acc.carbs + s.actualCarbs,
            fiber: acc.fiber + s.actualFiber,
          }), { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 })

          const allWarnings = personDaySlots.flatMap((s) => s.violations || [])

          return (
            <DayNutritionSummary
              key={person.id}
              personName={person.name ?? "Unknown"}
              warnings={allWarnings}
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

      <div className="grid grid-cols-1 gap-4">
        {[...new Set(day.slots.map((s) => s.templateSlotName))].map((slotName) => {
          const slots = day.slots.filter((s) => s.templateSlotName === slotName)
          
          return (
            <div key={slotName} className="space-y-2">
              <h4 className="text-base font-bold border-b pb-1">{slotName}</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {slots.map((slot) => {
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
                        <div className="flex gap-1 items-center">
                          {(slot.violations || []).length > 0 && (
                            <div className="relative group">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-popover text-popover-foreground text-caption p-2 rounded shadow-lg z-10 min-w-[150px]">
                                {(slot.violations || []).map((v: string, i: number) => <div key={i}>{v}</div>)}
                              </div>
                            </div>
                          )}
                          <div className="text-caption text-muted-foreground">
                            {slot.actualKcal.toFixed(0)} / {slot.targetKcal.toFixed(0)} kcal
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        {(slot.entries || []).map((entry) => {
                          const dish = dishes.find(d => d.id === entry.dishId)
                          const entryKcal = dish ? (dish.per100g.kcal * entry.portionWeight) / 100 : 0
                          const isEditing = editingEntry?.id === entry.id

                          return (
                            <div key={entry.id} className="flex justify-between items-center bg-background/50 p-1.5 rounded text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{entry.dishName}</span>
                                {isEditing ? (
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
                                          if (w > 0) onEditWeight(entry.id, w)
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
                                {isEditing && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 text-green-500 hover:text-green-600"
                                    onClick={() => {
                                      const w = parseFloat(editingEntry.weight)
                                      if (w > 0) onEditWeight(entry.id, w)
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
                                  onClick={() => onRemoveDish(entry.id)}
                                  disabled={isPending}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
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
                              onClick={() => onRemoveProduct(pe.id)}
                              disabled={isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}

                        {/* Add buttons */}
                        <div className="flex gap-1.5">
                          <Button
                            variant="ghost"
                            className="flex-1 h-8 border-dashed border-2 text-muted-foreground hover:text-primary"
                            onClick={() => {
                              const person = weekPlan.persons.find((p) => p.id === slot.personId)
                              if (!person) return
                              onAddDishClick({
                                slotId: slot.id,
                                person,
                                slot: { percentage: (slot.targetKcal / (person.targetKcal || 1)) * 100 },
                                slotName: slot.templateSlotName
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
                            onClick={() => onAddProductClick(slot.id)}
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
      </div>
    </div>
  )
}
