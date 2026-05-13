"use client"

import { useState, useTransition, useMemo } from "react"
import { Plus, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DayNutritionSummary } from "./DayNutritionSummary"
import { DishPicker } from "./DishPicker"
import { addDishToSlot, addProductToSlot, deleteWeekPlan, updateWeekPlanName } from "../../actions/planning"
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
                  protein: { label: "Protein", actual: dayActual.protein, target: Math.round((person.targetKcal * person.proteinPct / 100) / 4), unit: "g" },
                  fat: { label: "Fat", actual: dayActual.fat, target: Math.round((person.targetKcal * person.fatPct / 100) / 9), unit: "g" },
                  carbs: { label: "Carbs", actual: dayActual.carbs, target: Math.round((person.targetKcal * person.carbsPct / 100) / 4), unit: "g" },
                  fiber: { label: "Fiber", actual: dayActual.fiber, target: person.fiberGrams, unit: "g" },
                }}
              />
            )
          })}
        </div>
      )}

      {/* Meal table: rows = meals, columns = persons with grams */}
      {currentDay && mealSlotNames.map((slotName) => {
        const slotGroup = currentDay.slots.filter(s => s.name === slotName)
        const timeWindow = slotGroup[0]?.timeWindow

        // Collect all dish entries across persons for this meal slot
        const allDishes = new Map<string, { personId: string; personName: string; entry: WeekPlannerProps["weekPlan"]["days"][number]["slots"][number]["entries"][number] }>()
        slotGroup.forEach(slot => {
          slot.entries.forEach(entry => {
            allDishes.set(entry.dishName + slot.personId, { personId: slot.personId, personName: slot.personName ?? "", entry })
          })
        })

        // Group by dish name
        const dishGroups = new Map<string, { personId: string; personName: string; entry: WeekPlannerProps["weekPlan"]["days"][number]["slots"][number]["entries"][number]; ingredients: Map<string, { productName: string; weight: number }> }[]>()
        allDishes.forEach(({ personId, personName, entry }) => {
          if (!dishGroups.has(entry.dishName)) {
            dishGroups.set(entry.dishName, [])
          }
          const ingredients = new Map<string, { productName: string; weight: number }>()
          entry.ingredients.forEach(ing => {
            ingredients.set(ing.productName, { productName: ing.productName, weight: ing.weight })
          })
          dishGroups.get(entry.dishName)!.push({ personId, personName, entry, ingredients })
        })

        const persons = weekPlan.persons

        return (
          <div key={slotName} className="space-y-2">
            <div className="flex items-center gap-2 border-b pb-1">
              <h4 className="text-base font-bold">{slotName}</h4>
              {timeWindow && (
                <span className="text-caption text-muted-foreground font-mono">{timeWindow}</span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-bold text-muted-foreground uppercase text-caption">Прийом</th>
                    {persons.map(p => (
                      <th key={p.id} className="text-left py-2 px-3 font-bold text-muted-foreground uppercase text-caption">{p.name ?? "Unknown"}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from(dishGroups.entries()).map(([dishName, group]) => (
                    <tr key={dishName} className="border-b border-border/50 hover:bg-raised/50">
                      <td className="py-2 px-3 font-medium">{dishName}</td>
                      {persons.map(person => {
                        const personEntry = group.find(g => g.personId === person.id)
                        if (!personEntry) {
                          return <td key={person.id} className="py-2 px-3 text-muted-foreground">—</td>
                        }
                        const totalWeight = Array.from(personEntry.ingredients.values()).reduce((sum, ing) => sum + ing.weight, 0)
                        return (
                          <td key={person.id} className="py-2 px-3 font-mono">
                            {totalWeight.toFixed(0)}г
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add buttons for each person */}
            <div className="flex gap-2 mt-2">
              {slotGroup.map(slot => (
                <div key={slot.id} className="flex gap-1.5 flex-1">
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
                    disabled={isPending || slot.locked}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span className="text-caption">Страву ({slot.personName})</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-8 px-3 border-dashed border-2 text-muted-foreground hover:text-green-500 hover:border-green-500/40"
                    onClick={() => setProductPickerSlotId(slot.id)}
                    disabled={isPending || slot.locked}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    <span className="text-caption">Продукт</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Cooking algorithm for the day */}
      {currentDay && (() => {
        const allEntries = currentDay.slots.flatMap(s => s.entries)
        const dishMap = new Map<string, { totalRawWeight: number; ingredients: Map<string, { productName: string; cookingMethod: string | null; coefficient: number; totalRaw: number; totalCooked: number }> }>()
        
        allEntries.forEach(entry => {
          if (!dishMap.has(entry.dishId)) {
            dishMap.set(entry.dishId, {
              totalRawWeight: 0,
              ingredients: new Map()
            })
          }
          const dish = dishMap.get(entry.dishId)!
          entry.ingredients.forEach(ing => {
            if (!dish.ingredients.has(ing.productId)) {
              dish.ingredients.set(ing.productId, {
                productName: ing.productName,
                cookingMethod: ing.cookingMethodName,
                coefficient: ing.coefficient,
                totalRaw: 0,
                totalCooked: 0
              })
            }
            const ingredient = dish.ingredients.get(ing.productId)!
            ingredient.totalRaw += ing.rawWeight
            ingredient.totalCooked += ing.cookedWeight
            dish.totalRawWeight += ing.rawWeight
          })
        })

        const cookingSteps = Array.from(dishMap.entries()).map(([_dishId, dish]) => {
          const ingredients = Array.from(dish.ingredients.values())
          return {
            dishName: ingredients[0]?.productName ? `${ingredients.length} продуктів` : "Страва",
            ingredients: ingredients,
            totalRaw: dish.totalRawWeight
          }
        })

        if (cookingSteps.length === 0) return null

        return (
          <div className="space-y-4 bg-raised border rounded-xl p-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <span className="text-accent">🍳</span>
              Алгоритм приготування на день
            </h3>
            
            <div className="space-y-3">
              {cookingSteps.map((step, idx) => (
                <div key={idx} className="border-l-2 border-accent/30 pl-3">
                  <div className="text-sm font-medium mb-1">
                    {idx + 1}. Приготувати: {step.ingredients.map(i => i.productName).join(", ")}
                  </div>
                  <div className="space-y-0.5">
                    {step.ingredients.map((ing, ingIdx) => (
                      <div key={ingIdx} className="text-sm text-muted-foreground font-mono">
                        {ing.productName}: {ing.totalRaw.toFixed(0)}г сире → {ing.totalCooked.toFixed(0)}г {ing.cookingMethod ?? "готове"}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border">
              <div className="text-sm font-medium">
                Загалом продуктів на день: {cookingSteps.reduce((sum, step) => sum + step.totalRaw, 0).toFixed(0)}г (сирі)
              </div>
            </div>
          </div>
        )
      })()}

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
