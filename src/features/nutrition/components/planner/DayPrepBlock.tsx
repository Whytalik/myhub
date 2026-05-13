"use client"

import { useState, useTransition, useMemo } from "react"
import { Plus, Trash2, Save, ListTodo, ShoppingCart, StickyNote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateDayPrepNote } from "../../actions/planning"
import { toast } from "sonner"

interface DayPrepBlockProps {
  dayPlanId: string
  dayName: string
  prepNote: { id: string; content: string; steps: string[] } | null
  slots: {
    entries: {
      dishName: string
      ingredients: {
        productName: string
        cookingMethodName: string | null
        coefficient: number
        weight: number
        inputState: string
        rawWeight: number
        cookedWeight: number
        unit: string | null
      }[]
    }[]
  }[]
}

export function DayPrepBlock({ dayPlanId, dayName, prepNote, slots }: DayPrepBlockProps) {
  const [isPending, startTransition] = useTransition()
  const [content, setContent] = useState(prepNote?.content ?? "")
  const [steps, setSteps] = useState<string[]>(prepNote?.steps ?? [])
  const [newStep, setNewStep] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const autoSteps = useMemo(() => {
    const stepMap = new Map<string, number>()
    for (const slot of slots) {
      for (const entry of slot.entries) {
        for (const ing of entry.ingredients) {
          const method = ing.cookingMethodName ?? "Сире"
          const displayWeight = ing.inputState === "COOKED"
            ? `${ing.cookedWeight.toFixed(0)}г (готове)`
            : `${ing.weight.toFixed(0)}г`
          const key = `${method}: ${ing.productName} — ${displayWeight}`
          stepMap.set(key, (stepMap.get(key) ?? 0) + 1)
        }
      }
    }
    return Array.from(stepMap.entries()).map(([text, count]) =>
      count > 1 ? `${text} (×${count})` : text
    )
  }, [slots])

  const dailyProducts = useMemo(() => {
    const agg = new Map<string, { name: string; rawWeight: number; unit: string | null }>()
    for (const slot of slots) {
      for (const entry of slot.entries) {
        for (const ing of entry.ingredients) {
          const existing = agg.get(ing.productName)
          if (existing) {
            existing.rawWeight += ing.rawWeight
          } else {
            agg.set(ing.productName, {
              name: ing.productName,
              rawWeight: ing.rawWeight,
              unit: ing.unit,
            })
          }
        }
      }
    }
    return Array.from(agg.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [slots])

  const allSteps = [...autoSteps, ...steps]

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateDayPrepNote(dayPlanId, content, steps)
      if (result.success) {
        toast.success("Prep note saved")
        setIsEditing(false)
      } else {
        toast.error(result.error || "Failed to save")
      }
    })
  }

  const addStep = () => {
    if (!newStep.trim()) return
    setSteps(prev => [...prev, newStep.trim()])
    setNewStep("")
  }

  const removeStep = (idx: number) => {
    setSteps(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-4 bg-raised border rounded-xl p-4">
      <h3 className="font-bold text-base flex items-center gap-2">
        <ListTodo className="h-4 w-4 text-accent" />
        {dayName} — Підготовка
      </h3>

      {/* Auto + Manual Steps */}
      {allSteps.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-caption font-bold text-muted-foreground uppercase">Кроки приготування</h4>
          <ol className="space-y-1">
            {allSteps.map((step, idx) => {
              const isManual = idx >= autoSteps.length
              return (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-accent font-mono text-label shrink-0 mt-0.5">{idx + 1}.</span>
                  <span className={isManual ? "text-accent/80" : ""}>{step}</span>
                  {isManual && (
                    <button
                      onClick={() => removeStep(idx - autoSteps.length)}
                      className="ml-auto text-muted-foreground hover:text-red-500 shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      )}

      {/* Add custom step */}
      <div className="flex gap-2">
        <Input
          value={newStep}
          onChange={(e) => setNewStep(e.target.value)}
          placeholder="Додати свій крок..."
          className="h-8 text-sm"
          onKeyDown={(e) => e.key === "Enter" && addStep()}
        />
        <Button variant="ghost" size="sm" onClick={addStep} className="h-8 px-2">
          <Plus size={14} />
        </Button>
      </div>

      {/* Daily Products */}
      {dailyProducts.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-caption font-bold text-muted-foreground uppercase flex items-center gap-1.5">
            <ShoppingCart size={12} />
            Продукти на день (сирі)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
            {dailyProducts.map((p) => (
              <div key={p.name} className="text-sm font-mono text-muted-foreground">
                {p.name}: <span className="text-foreground">{p.rawWeight.toFixed(0)}г</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <h4 className="text-caption font-bold text-muted-foreground uppercase flex items-center gap-1.5">
          <StickyNote size={12} />
          Нотатки
        </h4>
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Нотатки на день..."
              className="min-h-[80px] text-sm w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={isPending}>
                <Save size={14} className="mr-1" />
                Зберегти
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setContent(prepNote?.content ?? "") }}>
                Скасувати
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="min-h-[40px] text-sm text-muted-foreground cursor-pointer hover:text-foreground p-2 rounded border border-dashed border-border hover:border-accent/30 transition-colors"
            onClick={() => setIsEditing(true)}
          >
            {content || "Натисни щоб додати нотатки..."}
          </div>
        )}
      </div>
    </div>
  )
}
