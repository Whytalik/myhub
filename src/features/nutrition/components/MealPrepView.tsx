"use client"

const DAY_NAMES = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота", "Неділя"]
const DAY_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"]

type WeekPlanData = {
  id: string
  name: string | null
  days: {
    dayPlanId: string
    dayOfWeek: number
    slots: {
      id: string
      personId: string
      personName: string | null
      name: string
      entries: {
        id: string
        dishId: string
        dishName: string
        dishType: string
        marinadeForIngredient: string | null
        ingredients: {
          productName: string
          weight: number
          unit: string | null
        }[]
      }[]
    }[]
  }[]
}

interface PrepGroup {
  slotName: string
  marinadeIngredient: string
  marinadeName: string
  marinadeComponents: { productName: string; weight: number; unit: string | null }[]
  persons: { personName: string; ingredientWeight: number }[]
}

interface PrepDay {
  dayOfWeek: number
  groups: PrepGroup[]
}

function buildPrepDays(plan: WeekPlanData): PrepDay[] {
  const result: PrepDay[] = []

  for (const day of plan.days) {
    const slotNames = [...new Set(day.slots.map(s => s.name))]
    const dayGroups: PrepGroup[] = []

    for (const slotName of slotNames) {
      const slotGroup = day.slots.filter(s => s.name === slotName)

      // Collect MARINADE entries: one per person
      const marinadesByIngredient = new Map<string, PrepGroup>()

      for (const slot of slotGroup) {
        for (const entry of slot.entries) {
          if (entry.dishType !== "MARINADE" || !entry.marinadeForIngredient) continue

          const key = `${entry.marinadeForIngredient}::${entry.dishName}`
          if (!marinadesByIngredient.has(key)) {
            marinadesByIngredient.set(key, {
              slotName,
              marinadeIngredient: entry.marinadeForIngredient,
              marinadeName: entry.dishName,
              marinadeComponents: entry.ingredients.map(i => ({
                productName: i.productName,
                weight: i.weight,
                unit: i.unit,
              })),
              persons: [],
            })
          }

          // Find the weight of this ingredient in the main dish
          const mainEntry = slot.entries.find(e => e.dishType !== "MARINADE")
          const mainIng = mainEntry?.ingredients.find(i => i.productName === entry.marinadeForIngredient)
          const ingredientWeight = mainIng?.weight ?? 0

          marinadesByIngredient.get(key)!.persons.push({
            personName: slot.personName ?? "?",
            ingredientWeight,
          })
        }
      }

      dayGroups.push(...marinadesByIngredient.values())
    }

    if (dayGroups.length > 0) {
      result.push({ dayOfWeek: day.dayOfWeek, groups: dayGroups })
    }
  }

  return result
}

const UNIT_LABELS: Record<string, string> = { GRAM: "г", ML: "мл", PIECE: "шт", TBSP: "ст.л.", TSP: "ч.л." }
function unitLabel(unit: string | null) { return unit ? (UNIT_LABELS[unit] ?? unit) : "г" }

interface MealPrepViewProps {
  plan: WeekPlanData | null
}

export function MealPrepView({ plan }: MealPrepViewProps) {
  if (!plan) {
    return (
      <div className="text-text-muted text-body">Немає даних плану.</div>
    )
  }

  const prepDays = buildPrepDays(plan)

  if (prepDays.length === 0) {
    return (
      <div className="py-12 text-center text-text-muted text-body">
        Маринади не знайдено. Додайте страви з маринадом до тижневого плану.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {prepDays.map(day => (
        <section key={day.dayOfWeek} className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-caption font-mono text-text-muted bg-surface border border-border px-2 py-0.5 rounded-md">
              {DAY_SHORT[day.dayOfWeek]}
            </span>
            <h3 className="text-heading font-bold text-text-primary">{DAY_NAMES[day.dayOfWeek]}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {day.groups.map((group, i) => (
              <div key={i} className="bg-surface border border-border rounded-2xl overflow-hidden">
                {/* Card header */}
                <div className="px-5 py-3 border-b border-border bg-violet-500/[0.04] flex items-center gap-2">
                  <span className="text-lg">🧂</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-body font-semibold text-text-primary">{group.marinadeIngredient}</span>
                      <span className="text-caption text-text-muted">→</span>
                      <span className="text-body font-medium text-violet-400">{group.marinadeName}</span>
                    </div>
                    <span className="text-caption text-text-muted font-mono">{group.slotName}</span>
                  </div>
                </div>

                {/* Per-person ingredient weights */}
                <div className="px-5 py-3 border-b border-border/50">
                  <p className="text-caption font-mono text-text-muted uppercase mb-2">Вага для маринування</p>
                  <div className="flex flex-wrap gap-3">
                    {group.persons.map(p => (
                      <div key={p.personName} className="flex items-center gap-1.5">
                        <span className="text-caption text-text-secondary font-medium">{p.personName}:</span>
                        <span className="text-caption font-mono text-text-primary">
                          {p.ingredientWeight > 0 ? `${p.ingredientWeight.toFixed(0)}г` : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Marinade components */}
                <div className="px-5 py-3">
                  <p className="text-caption font-mono text-text-muted uppercase mb-2">Склад маринаду</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {group.marinadeComponents.map(comp => (
                      <span key={comp.productName} className="text-caption text-text-secondary">
                        {comp.productName}{" "}
                        <span className="font-mono text-text-primary">
                          {comp.weight.toFixed(0)}{unitLabel(comp.unit)}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
